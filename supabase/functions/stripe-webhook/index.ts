// Supabase Edge Function — Stripe webhook
// Aggiorna il piano dell'utente su `profiles` dopo un pagamento riuscito.
//
// Variabili d'ambiente richieste (Settings > Edge Functions > Secrets):
//   STRIPE_SECRET_KEY      -> chiave segreta Stripe (sk_live_...)
//   STRIPE_WEBHOOK_SECRET  -> signing secret del webhook (whsec_...)
// SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sono iniettate automaticamente.

import Stripe from "https://esm.sh/stripe@14?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});
const cryptoProvider = Stripe.createSubtleCryptoProvider();

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// Mappa ID Payment Link -> piano.
//   plan:   "advanced" (lifetime) o "mentorship" (3 mesi).
//   cycles: numero di rate mensili (0 = pagamento unico, niente abbonamento).
//           Se > 0, l'abbonamento Stripe viene cancellato dopo l'ultima rata.
const PAYMENT_LINKS: Record<string, { plan: string; cycles: number }> = {
  "plink_1TlUUQQ86oCcQBKp5n94vDQH": { plan: "advanced", cycles: 0 },    // Advanced intero
  "plink_1TlUe5Q86oCcQBKpE6drLMyD": { plan: "advanced", cycles: 12 },   // Advanced 12 rate
  "plink_1TlUjZQ86oCcQBKp2fei8PTe": { plan: "mentorship", cycles: 0 },  // Master Mentor intero
  "plink_1TlUpMQ86oCcQBKp3sfwRUFb": { plan: "mentorship", cycles: 3 },  // Master Mentor 3 rate
};

Deno.serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!,
      undefined,
      cryptoProvider,
    );
  } catch (err) {
    console.error("Firma webhook non valida:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const email = session.customer_details?.email ?? session.customer_email;
    const linkId = typeof session.payment_link === "string"
      ? session.payment_link
      : session.payment_link?.id;
    const mapping = linkId ? PAYMENT_LINKS[linkId] : undefined;

    if (!email || !mapping) {
      console.warn("Sessione senza email o payment link sconosciuto:", session.id, linkId);
      return new Response(JSON.stringify({ received: true, skipped: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const { plan, cycles } = mapping;

    // Pagamento a rate: programma la cancellazione automatica dell'abbonamento
    // poco prima di quella che sarebbe la rata successiva all'ultima.
    if (cycles > 0 && session.subscription) {
      const subId = typeof session.subscription === "string"
        ? session.subscription
        : session.subscription.id;
      const d = new Date();
      d.setMonth(d.getMonth() + cycles);
      d.setDate(d.getDate() - 1); // margine di sicurezza di 1 giorno
      const cancelAt = Math.floor(d.getTime() / 1000);
      try {
        await stripe.subscriptions.update(subId, { cancel_at: cancelAt });
        console.log(`Abbonamento ${subId}: cancellazione programmata dopo ${cycles} rate.`);
      } catch (e) {
        console.error("Errore programmazione cancellazione abbonamento:", e);
      }
    }

    // Aggiorna solo l'entitlement acquistato, senza toccare l'altro:
    // chi ha già advanced e compra mentorship (o viceversa) diventa "Master +".
    const updateData: Record<string, unknown> = {};
    if (plan === "advanced") {
      updateData.has_advanced = true; // lifetime
    } else if (plan === "mentorship") {
      const d = new Date();
      d.setMonth(d.getMonth() + 3);
      updateData.mentorship_expires_at = d.toISOString();
    }

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .ilike("email", email);

    if (error) {
      console.error("Errore aggiornamento profilo:", error);
      return new Response("DB error", { status: 500 });
    }

    console.log(`Entitlement aggiornato: ${email} -> ${plan}`);
  }

  // Rimborso: revoca l'entitlement corrispondente all'acquisto rimborsato.
  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const email = charge.billing_details?.email ?? charge.receipt_email;
    const piId = typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id;

    if (!email || !piId) {
      console.warn("Rimborso senza email o payment_intent:", charge.id);
      return new Response(JSON.stringify({ received: true, skipped: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Risale al payment link tramite la sessione di checkout collegata al PaymentIntent
    let plan: string | undefined;
    try {
      const sessions = await stripe.checkout.sessions.list({ payment_intent: piId, limit: 1 });
      const linkId = typeof sessions.data[0]?.payment_link === "string"
        ? sessions.data[0].payment_link
        : sessions.data[0]?.payment_link?.id;
      plan = linkId ? PAYMENT_LINKS[linkId]?.plan : undefined;
    } catch (e) {
      console.error("Errore lookup sessione per rimborso:", e);
    }

    if (!plan) {
      console.warn("Rimborso: impossibile determinare il piano per", charge.id);
      return new Response(JSON.stringify({ received: true, skipped: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const updateData: Record<string, unknown> = {};
    if (plan === "advanced") updateData.has_advanced = false;
    else if (plan === "mentorship") updateData.mentorship_expires_at = null;

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .ilike("email", email);

    if (error) {
      console.error("Errore revoca entitlement (rimborso):", error);
      return new Response("DB error", { status: 500 });
    }

    console.log(`Entitlement revocato per rimborso: ${email} -> ${plan}`);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});

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
    const plan = session.metadata?.plan;          // "advanced" | "mentorship"
    const duration = session.metadata?.duration;  // "lifetime" | "3months"

    if (!email || !plan) {
      console.warn("Sessione senza email o metadata plan:", session.id);
      return new Response(JSON.stringify({ received: true, skipped: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Calcola la scadenza: lifetime => null, altrimenti now + N mesi
    let expiresAt: string | null = null;
    if (duration === "3months") {
      const d = new Date();
      d.setMonth(d.getMonth() + 3);
      expiresAt = d.toISOString();
    }

    const { error } = await supabase
      .from("profiles")
      .update({ plan, plan_expires_at: expiresAt })
      .ilike("email", email);

    if (error) {
      console.error("Errore aggiornamento profilo:", error);
      return new Response("DB error", { status: 500 });
    }

    console.log(`Piano aggiornato: ${email} -> ${plan} (scadenza: ${expiresAt ?? "lifetime"})`);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});

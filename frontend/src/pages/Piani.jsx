import { useEffect } from "react";
import { Check, X, ArrowRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import { LangProvider, useLang } from "@/context/LangContext";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const RAIL = ["33%", "66%", "100%"];

function Cell({ value, sub, highlight }) {
  return (
    <td className={highlight ? "col-hi" : undefined}>
      {value === true && <Check size={16} className="text-[var(--up)] inline" aria-label="incluso" />}
      {value === false && <span className="text-[var(--fg-dim)]" aria-label="non incluso">—</span>}
      {typeof value === "string" && (
        <span className="mono text-[11px] text-[var(--fg-muted)]">{value}</span>
      )}
      {sub && <span className="block text-xs text-[var(--fg-dim)] mt-1">{sub}</span>}
    </td>
  );
}

function PianiContent() {
  const { t } = useLang();
  const p = t.plans;
  const tiersRef = useScrollReveal();
  const cmpRef = useScrollReveal();
  const pathRef = useScrollReveal();
  const faqRef = useScrollReveal();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const contact = () => {
    window.location.hash = "/";
    setTimeout(() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" }), 250);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] grain" data-testid="piani-root">
      <Header variant="plans" />

      <main>
        {/* Hero */}
        <section className="relative pt-[172px] pb-16 overflow-hidden text-center" data-testid="piani-hero">
          <div className="grid-bg" />
          <div className="blob blob-violet -top-[30%] left-1/2 -translate-x-1/2" />
          <div className="blob blob-cyan -bottom-[40%] -right-[10%]" />
          <div className="relative z-10 max-w-[1240px] mx-auto px-6 lg:px-10">
            <p className="overline"><span className="dot" />{p.overline}</p>
            <h1 className="display-xl mt-5 text-[clamp(2.6rem,6vw,4.4rem)] leading-none">
              {p.title}
              <br />
              <span className="display-gradient">{p.titleAccent}</span>
            </h1>
            <p className="mt-6 mx-auto max-w-[62ch] text-base lg:text-lg leading-[1.7] text-[var(--fg-muted)]">
              {p.lead}
            </p>
            {/* Perimetro educativo: deve restare visibile, è il guardrail regolamentare */}
            <div className="inline-flex flex-wrap justify-center gap-x-[18px] gap-y-2 mt-8 px-[22px] py-3 rounded-full border border-[var(--line)] bg-[var(--surface)]">
              {p.scope.map((s) => (
                <span key={s} className="mono flex items-center gap-[7px] text-[10px] tracking-[0.13em] uppercase text-[var(--fg-muted)]">
                  <Check size={12} className="text-[var(--up)] shrink-0" />
                  {s}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Tre livelli */}
        <section id="tiers" className="pb-24 lg:pb-32" ref={tiersRef}>
          <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
            <div className="grid gap-4 lg:grid-cols-3 items-stretch">
              {p.tiers.map((tier, i) => (
                <article
                  key={tier.name}
                  data-testid={`tier-${i}`}
                  className={`tier-card ${tier.featured ? "featured" : ""} px-[30px] pt-[34px] pb-8 flex flex-col scroll-reveal delay-${i + 1}`}
                >
                  <span className="tier-rail" style={{ width: RAIL[i] }} />
                  {tier.badge && (
                    <span className="absolute top-4 right-4 mono text-[9px] font-semibold tracking-[0.14em] uppercase text-[var(--violet-text)] border border-[rgba(139,92,246,0.4)] bg-[rgba(139,92,246,0.13)] px-2.5 py-1 rounded-[5px]">
                      {tier.badge}
                    </span>
                  )}

                  <span className="mono block text-[10px] tracking-[0.2em] uppercase text-[var(--fg-dim)] mb-5">
                    {tier.level}
                  </span>
                  <h2 className="text-2xl font-normal tracking-tight text-white mb-2">{tier.name}</h2>
                  <p className="mono text-[9.5px] tracking-[0.13em] uppercase text-[var(--cyan)] mb-[22px]">
                    {tier.what}
                  </p>

                  <div className="flex items-baseline gap-2 flex-wrap mb-1.5">
                    <span className="text-[2.7rem] font-extralight tracking-[-0.045em] text-white leading-none">
                      {tier.price}
                    </span>
                    <span className="mono text-[11.5px] text-[var(--fg-muted)]">{tier.per}</span>
                  </div>
                  <p className="text-[12.5px] text-[var(--fg-dim)] mb-6">{tier.note}</p>

                  <p className="text-sm leading-[1.7] text-[var(--fg-muted)] pb-6 mb-6 border-b border-[var(--line)]">
                    {tier.desc}
                  </p>

                  <ul className="flex flex-col gap-3.5 mb-7 flex-1">
                    {tier.feats.map((f) => (
                      <li key={f} className="flex gap-3 text-sm leading-[1.55] text-[var(--fg)]">
                        <Check size={14} className="shrink-0 mt-1 text-[var(--violet-text)]" />
                        {f}
                      </li>
                    ))}
                    {tier.featsOff.map((f) => (
                      <li key={f} className="flex gap-3 text-sm leading-[1.55] text-[var(--fg-dim)]">
                        <X size={14} className="shrink-0 mt-1 text-[var(--fg-dim)]" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={contact}
                    data-testid={`tier-cta-${i}`}
                    className={`${tier.featured ? "btn-primary" : "btn-secondary"} w-full min-h-[48px] rounded-[10px] text-sm font-semibold`}
                  >
                    {tier.cta}
                  </button>
                  <p className="mono text-center text-[9.5px] tracking-[0.12em] uppercase text-[var(--fg-dim)] mt-4">
                    {tier.foot}
                  </p>
                </article>
              ))}
            </div>

            {/* Founding member */}
            <aside
              data-testid="founding-offer"
              className="founding-card rounded-[18px] px-8 py-9 mt-16 grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center scroll-reveal delay-3"
            >
              <div>
                <p className="mono flex items-center gap-2.5 text-[10px] tracking-[0.18em] uppercase text-[var(--gold)] mb-3.5">
                  <i className="pulse-dot w-1.5 h-1.5 rounded-full bg-[var(--gold)] shadow-[0_0_10px_var(--gold)]" />
                  {p.founding.label}
                </p>
                <h2 className="text-2xl font-normal tracking-tight text-white mb-3">{p.founding.title}</h2>
                <p className="text-sm leading-[1.7] text-[var(--fg-muted)] max-w-[64ch]">{p.founding.desc}</p>

                <ul className="flex flex-col gap-3 mt-6">
                  {p.founding.includes.map((f) => (
                    <li key={f} className="flex gap-3 text-sm leading-[1.55] text-[var(--fg)]">
                      <Check size={14} className="shrink-0 mt-1 text-[var(--gold)]" />
                      {f}
                    </li>
                  ))}
                  <li className="flex gap-3 text-sm leading-[1.55] text-[var(--fg-dim)]">
                    <X size={14} className="shrink-0 mt-1" />
                    {p.founding.excluded}
                  </li>
                </ul>

                <p className="text-[12.5px] leading-[1.65] text-[var(--fg-dim)] mt-5 max-w-[64ch]">
                  {p.founding.closing}
                </p>
              </div>

              <div className="text-center lg:min-w-[220px]">
                <span className="block text-[2.4rem] font-extralight tracking-[-0.04em] text-white leading-none mb-2">
                  {p.founding.price}
                </span>
                <span className="mono block text-[9.5px] tracking-[0.12em] uppercase text-[var(--fg-dim)] mb-5">
                  {p.founding.priceNote}
                </span>
                <button
                  onClick={contact}
                  data-testid="founding-cta"
                  className="btn-secondary w-full min-h-[48px] px-6 rounded-[10px] text-sm font-semibold border-[rgba(227,179,65,0.42)]"
                >
                  {p.founding.cta}
                </button>
              </div>
            </aside>
          </div>
        </section>

        {/* Confronto */}
        <section className="py-24 lg:py-32 section-alt" ref={cmpRef}>
          <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
            <div className="mb-16 max-w-[62ch] scroll-reveal">
              <p className="overline"><span className="dot" />{p.cmp.overline}</p>
              <h2 className="mt-4 text-[clamp(1.9rem,3.8vw,3rem)] font-light tracking-[-0.03em] leading-[1.02] text-white">
                {p.cmp.title}
              </h2>
              <p className="mt-5 text-base lg:text-lg leading-[1.7] text-[var(--fg-muted)]">{p.cmp.lead}</p>
            </div>

            {/* La tabella scorre dentro il suo contenitore: la pagina non va mai in overflow */}
            <div className="cmp-scroll scroll-reveal delay-1">
              <table className="cmp-table" data-testid="comparison-table">
                <thead>
                  <tr>
                    <th scope="col">&nbsp;</th>
                    <th scope="col">{p.cmp.cols[0]}</th>
                    <th scope="col" className="text-[var(--violet-text)]">{p.cmp.cols[1]}</th>
                    <th scope="col">{p.cmp.cols[2]}</th>
                  </tr>
                </thead>
                <tbody>
                  {p.cmp.rows.map((row) => (
                    <tr key={row.label}>
                      <td>
                        {row.label}
                        {row.sub && <span className="block text-xs text-[var(--fg-dim)] mt-1">{row.sub}</span>}
                      </td>
                      <Cell value={row.corso} />
                      <Cell value={row.adv} highlight />
                      <Cell value={row.coach} sub={row.coachSub} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mono text-[10px] tracking-[0.12em] uppercase text-[var(--fg-dim)] mt-3.5 md:hidden">
              {p.cmp.hint}
            </p>
          </div>
        </section>

        {/* Percorso */}
        <section className="py-24 lg:py-32" ref={pathRef}>
          <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
            <div className="mb-16 max-w-[62ch] scroll-reveal">
              <p className="overline"><span className="dot" />{p.path.overline}</p>
              <h2 className="mt-4 text-[clamp(1.9rem,3.8vw,3rem)] font-light tracking-[-0.03em] leading-[1.02] text-white">
                {p.path.title}
              </h2>
              <p className="mt-5 text-base lg:text-lg leading-[1.7] text-[var(--fg-muted)]">{p.path.lead}</p>
            </div>

            <div className="grid gap-px bg-[var(--line)] border border-[var(--line)] rounded-[14px] overflow-hidden md:grid-cols-3 scroll-reveal delay-1">
              {p.path.steps.map((s) => (
                <article key={s.title} className="bg-[var(--bg-base)] hover:bg-[var(--bg-elev)] transition-colors duration-500 px-[30px] py-9">
                  <span className="mono block text-[10px] tracking-[0.2em] text-[var(--violet-text)] mb-5">{s.n}</span>
                  <h3 className="text-[1.15rem] font-normal tracking-tight text-white mb-3">{s.title}</h3>
                  <p className="text-sm leading-[1.7] text-[var(--fg-muted)]">{s.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ piani */}
        <section id="faq" className="py-24 lg:py-32 section-alt" ref={faqRef}>
          <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
            <div className="mb-16 scroll-reveal">
              <p className="overline"><span className="dot" />{p.faq.overline}</p>
              <h2 className="mt-4 text-[clamp(1.9rem,3.8vw,3rem)] font-light tracking-[-0.03em] leading-[1.02] text-white">
                {p.faq.title}
              </h2>
            </div>
            <div className="scroll-reveal delay-1 hairline">
              <Accordion type="single" collapsible className="w-full">
                {p.faq.items.map((item, i) => (
                  <AccordionItem key={i} value={`p-${i}`} className="border-b border-[var(--line)]" data-testid={`plans-faq-${i}`}>
                    <AccordionTrigger className="text-left text-base lg:text-[1.15rem] font-normal text-[var(--fg)] hover:text-[var(--violet-text)] hover:no-underline py-6 min-h-[44px] font-[var(--font-heading)]">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-[14.5px] leading-[1.75] text-[var(--fg-muted)] pb-7 max-w-[80ch]">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 lg:py-32">
          <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
            <div className="relative overflow-hidden rounded-[22px] border border-[var(--line-hi)] px-8 py-24 text-center bg-[linear-gradient(165deg,rgba(139,92,246,0.11),rgba(56,189,248,0.05)_55%,transparent)]">
              <div className="blob blob-violet -top-[60%] left-1/2 -translate-x-1/2 opacity-60" />
              <div className="relative z-[2]">
                <p className="overline"><span className="dot" />{p.cta.overline}</p>
                <h2 className="mt-4 mx-auto max-w-[20ch] text-[clamp(1.9rem,3.8vw,3rem)] font-light tracking-[-0.03em] leading-[1.02] text-white">
                  {p.cta.title}
                </h2>
                <p className="mt-5 mx-auto max-w-[54ch] text-base leading-[1.7] text-[var(--fg-muted)]">
                  {p.cta.desc}
                </p>
                <div className="flex flex-wrap gap-3.5 justify-center mt-9">
                  <a
                    href="mailto:support@omniscent.space"
                    className="btn-primary min-h-[48px] px-[26px] rounded-[10px] text-sm font-semibold inline-flex items-center gap-2.5"
                  >
                    {p.cta.primary} <ArrowRight size={15} />
                  </a>
                  <button
                    onClick={() => {
                      window.location.hash = "/";
                      setTimeout(() => document.querySelector("#method")?.scrollIntoView({ behavior: "smooth" }), 250);
                    }}
                    className="btn-secondary min-h-[48px] px-[26px] rounded-[10px] text-sm font-semibold inline-flex items-center"
                  >
                    {p.cta.secondary}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer variant="plans" />
      <Chatbot />
    </div>
  );
}

export default function Piani() {
  return (
    <LangProvider>
      <PianiContent />
    </LangProvider>
  );
}

# OMNISCENT® Landing Page - PRD

## Problem Statement
Landing page per azienda di formazione privata di trading OMNISCENT®, con font minimal elegante e professionale, colori bianco violetto e azzurro. Percorsi basati su analisi dell'orderflow e sviluppo personale di strategie (swing e scalping). Possibilità di creare PAMM. Richieste gestite via mail.

## User Personas
- **Aspiranti trader**: Cercano formazione professionale sull'orderflow
- **Trader esperti**: Vogliono sviluppare strategie personali o creare fondi PAMM
- **Investitori**: Interessati a fondi PAMM gestiti professionalmente

## Core Requirements
- Landing page professionale con branding OMNISCENT®
- Sezioni: Hero, Servizi, Statistiche, Testimonianze, Chi Siamo, FAQ, Contatti
- Tutte le CTA tramite mailto:support@omniscent.space
- Link Instagram: www.instagram.com/omniscent_group
- Design: bianco, violetto (#4C1D95), azzurro (#0284C7)
- Font: Outfit (headings), Manrope (body)

## What's Been Implemented (Dec 2025)
- Header sticky con glass effect e navigazione smooth scroll
- Hero section con immagine di sfondo, tagline "a step forward"
- Servizi in bento grid (Orderflow, Strategie, PAMM con glow azzurro)
- Statistiche con grid borders pattern e visual
- Testimonianze con carousel navigabile
- Chi Siamo con foto personalizzata del fondatore
- FAQ con Shadcn Accordion
- Footer con email, Instagram e link rapidi
- Menu hamburger mobile responsive
- Backend FastAPI con endpoint /api/health e /api/contact
- Tutti i data-testid sugli elementi interattivi
- **Dark theme completo** (sfondo nero #09090B)
- **Logo personalizzato** nell'header e footer
- **Animazioni scroll-based** con Intersection Observer
- **Form di contatto inline** con invio al backend
- Test 100% backend e frontend (3 iterazioni)

## Prioritized Backlog
- P0: Logo personalizzato (quando disponibile)
- P1: Animazioni scroll-based (Intersection Observer / Lenis)
- P1: SEO meta tags e Open Graph
- P2: Form di contatto inline (alternativa al mailto)
- P2: Multi-lingua (IT/EN)
- P3: Blog / Risorse educative

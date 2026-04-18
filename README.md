# The State of Organizational AI — April 2026

A field report from the operator seat at **PerformanceLabs.AI × Aplora.AI**, published as a standalone static site. Editorial in tone, data-forward in execution — built to read like a McKinsey / BCG field report rather than a marketing page.

> *The Real AI Work: **Executive Clarity** Under Constant Change.*

Vol. I · № 01 · Field Report · Q2 2026

---

## Read it

- **Live site (production):** https://state-of-organizational-hx8lk2u50-tony-performancels-projects.vercel.app
  *(team deployment protection may require a Vercel login — adjust in Project Settings → Deployment Protection if you want a fully public URL)*
- **Local preview:** see [Running locally](#running-locally) below

## What's in the report

Six sections that together take about twelve minutes to read:

1. **The Opening** — why "behind" is now a universal condition, not a diagnosis
2. **In the Field** — five patterns observed in the past week of executive conversations
3. **The Research** — five figures from Writer, Deloitte, Gartner, Stanford, a16z
4. **What Is Coming** — four shifts already visible from the operator seat (pricing inversion, governance, coordination, moral drift)
5. **The Honest Part** — nobody is keeping up, including us
6. **What to Take Away** — the work of this moment is operating capacity, not tool selection

Plus a navy at-a-glance stat strip (Pricing shift 2×–3×, Agent surge 1,445%, Silo reality 79%, Talent gap 20%) and a closing invitation to compare notes.

## How it's built

Intentionally framework-free — three files, Google Fonts, nothing else.

| File | Purpose |
| --- | --- |
| `index.html` | Document structure, section copy, inline data-tables for the stat strip |
| `styles.css` | Typography, grid, color system, responsive breakpoints (1440 → 960 → 620 → 560), reveal/pulse animations |
| `charts.js` | Pure-SVG data graphics drawn procedurally — hero distribution, five pattern mini-diagrams, five research figures, four forecast charts, and the stat-strip sparklines |

### Type and color

- **Serif:** DM Serif Display (display headlines)
- **Sans:** DM Sans (body, labels)
- **Mono:** JetBrains Mono (numerals, eyebrows, tickmarks)
- **Palette:** navy `#102d50`, cream `#faf8f5`, orange `#faa840`, deep orange `#e8912a`, red `#ef4537`, paper `#ffffff`

### Motion

All animation is scroll-driven via a single `IntersectionObserver`. Elements carry a `.reveal` class and fade in with a transform when they intersect the viewport. Key data graphics layer on top of that:

- **Lines draw in** (`.line-draw`) — SVG stroke-dashoffset transitions
- **Bars grow in** (`.bar-fill`) — `scaleX` from 0 → 1
- **Stat numbers count up** (`.count-up`) — rAF loop driven by `Intl.NumberFormat` so thousand separators survive the animation
- **Fig 3.3 breach dots cascade** (`.shadow-dot`) — 67 red dots fade in one-by-one from first to last, staggered 18 ms per dot
- **Hero bullets pulse** (`.hero-pulse`) — the mode and frontier dots breathe gently after the curve finishes drawing

No `prefers-reduced-motion` shim yet — worth adding if accessibility review flags it.

## Running locally

The site is pure static files. Any static server works.

```bash
# from the repo root
python -m http.server 8765
# then open http://localhost:8765
```

or

```bash
npx serve .
```

No build step, no install, no dependencies.

## Deploying

Vercel auto-detects this as an "Other" project (static) and serves `index.html` at the root. To deploy from the CLI:

```bash
vercel deploy --yes --prod --scope <your-team>
```

The existing Vercel project (`state-of-organizational-ai` on team `tony-performancels-projects`) is already linked — connect the Git integration in Vercel's project settings and pushes to `main` will auto-deploy to production.

## Research sources

Writer Enterprise AI Adoption Survey 2026 · Deloitte State of AI in the Enterprise 2026 · Grant Thornton AI Impact Survey 2026 · Stanford AI Index · Gartner · a16z Growth · The Information · KPMG Board Leadership Center · Aon Global Risk Management Survey · Harvard Law School Forum on Corporate Governance.

## Credits

Authored by the operator teams at **[PerformanceLabs.AI](https://performancelabs.ai)** and Aplora.AI. Observations are drawn from firsthand engagements; research cited is drawn from published third-party sources.

Forward-Deployed AI Operations · Q2 2026

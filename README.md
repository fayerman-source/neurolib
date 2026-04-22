# Neuro Note Macros

A clinical documentation aid for neurology. Copy-paste dot phrase templates and an NIHSS calculator, running entirely in your browser as a static web app.

> ⚠ **Clinical documentation aid only — not a medical device.** Read `DISCLAIMER.md` before use. Verify every score and generated text against the patient before entering into the medical record. Do not enter PHI into this application.

**Live demo:** _(TODO: add Vercel / GitHub Pages URL once deployed)_

## Features

- **15+ dot phrase templates** — Stroke, TIA, SAH, Headache, Seizure, GBS, Ataxia, General Neuro, neuro exam, neuro ROS
- **NIHSS Calculator** — all 15 items with a generated, copy-ready documentation block
- **Real-time search + category filtering**
- **One-click copy** to clipboard for any template
- **Dark, minimal UI** (Linear-style)
- **Static export** — runs with no backend, no database, no tracking; self-hostable anywhere

## Getting started

```bash
bun install
bun run dev      # http://localhost:3000
bun run build    # emits a static site to out/
bun run lint
```

No test framework is configured.

## Adding a dot phrase

All templates live in `src/data/dotPhrases.ts`. See `CONTRIBUTING.md` for the schema, clinical-content requirements, and citation expectations.

## Contributing

We especially welcome:

- Subspecialty templates (epilepsy, MS, movement, neuromuscular, neuro-oncology, neuro-ICU)
- Citations / source references for existing templates
- Clinical corrections — please use the **Clinical Correction** issue template; these are high priority

See `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md` before contributing.

## Authors

- **Eli Fayerman** — Developer
- **Clinical Co-Author** — _(TODO: fill in neurologist name / pseudonym before flipping to public)_

## License

MIT — see `LICENSE`.

## Disclaimer

See `DISCLAIMER.md` for the full medical disclaimer. In short: this is a documentation aid, it is not a medical device, it has not been reviewed by the FDA or any other regulator, and it does not replace clinical judgement.

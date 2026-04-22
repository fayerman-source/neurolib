# Contributing to Neuro Note Macros

Thanks for considering a contribution. This project is a clinical documentation aid used by working clinicians, so the bar for changes — especially to clinical content — is higher than a typical web project.

## Before you start

- Read `DISCLAIMER.md`. Nothing in this project is a medical device. All contributions must preserve that framing.
- Open an issue before large changes. For new dot phrases or subspecialty additions, use the **New Dot Phrase** issue template so we can discuss scope first.

## Types of contributions we welcome

1. **New dot phrases** — especially subspecialty content (epilepsy, MS, movement disorders, neuromuscular, neuro-oncology, neuro-ICU).
2. **Corrections to existing templates** — if a template is clinically wrong or outdated, use the **Clinical Correction** issue template. These are treated as high priority.
3. **Citations / source references** for existing templates. The `DotPhrase` type has an optional `source` field — adding authoritative citations is a great on-ramp.
4. **UI / accessibility improvements.**
5. **Bug fixes.**

## How to add a new dot phrase

All dot phrases live in `src/data/dotPhrases.ts` as entries in the `dotPhrases` array.

```ts
{
  id: 'unique-kebab-case-id',
  name: 'Human-readable name',
  trigger: '.triggerphrase',
  category: 'stroke', // must be an existing CategoryId
  description: 'One-line description shown in the card preview.',
  content: `Multi-line template text.
Use placeholders like *** for fill-in sections.`,
  tags: ['tag1', 'tag2'],
  source: 'AHA/ASA 2019 Guidelines for Acute Ischemic Stroke Management; DOI: ...', // optional but strongly encouraged
}
```

### Adding a new category

1. Add a new entry to the `categories` const array in `src/data/dotPhrases.ts`.
2. The `CategoryId` union type updates automatically.
3. The category tab appears in the UI automatically.

## Clinical content requirements

- **Cite your source.** For any clinical template, the `source` field must point to a primary guideline (AHA/ASA, AAN, NINDS, etc.), a peer-reviewed review article, or a recognized textbook. "From my hospital's Epic library" is not an acceptable source — that content is arguably your hospital's IP.
- **No institution-specific content.** Templates must be portable across hospitals. Remove institution names, physician names, department-specific workflows, and local phone/pager numbers.
- **No copyrighted material.** Do not copy text from UpToDate, MDCalc, commercial stroke-scale PDFs, or other paid references. Paraphrase from open guidelines.
- **No PHI.** Ever. Real or fake patient details, even illustrative ones, should use obvious placeholders (`***`, `[NAME]`, `[MRN]`).
- **Clinician review.** For non-trivial clinical additions, we prefer PRs with evidence that a licensed clinician has reviewed the content. Mention this in the PR description.

## Development

```bash
bun install
bun run dev    # localhost:3000
bun run lint
bun run build  # static export to out/
```

No test framework is configured. Manual verification: open the app, filter by your new category/phrase, copy it, verify the text is correct.

## Pull requests

- One logical change per PR. Don't mix clinical content changes with UI refactors.
- Fill in the PR template completely — especially the clinical-review checkbox if applicable.
- Keep commits focused; the commit message should explain the *why*, not the *what*.
- Be patient with review. Clinical content will get more scrutiny than UI changes, and that is the point.

## Code of Conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). By participating, you agree to uphold it.

## License

By contributing, you agree your contribution will be licensed under the MIT License (see `LICENSE`).

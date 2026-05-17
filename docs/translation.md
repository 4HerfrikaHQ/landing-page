# Translation

## Overview

We use the [General Translation CLI](https://gtx.dev) (GT) to translate the English source file (`messages/en.json`) into our supported locales. Translation runs automatically on every push to `main` that changes `messages/en.json`, and can also be triggered manually.

## How it works

1. All user-facing strings live in `messages/en.json` (Next.js + `next-intl` format)
2. When `en.json` gets new or changed keys, the GitHub workflow runs `bun run translate --all`
3. GT translates missing keys into each target locale and writes the output to `messages/<locale>.json`
4. The updated translation files are auto-committed back to `main`
5. Supported locales are defined in `i18n/routing.ts` — the script reads them directly, so no config drift

## Manual translation

```bash
bun run translate fr           # translate only missing keys for French
bun run translate fr --force   # retranslate all French keys
bun run translate --all        # translate missing keys for all locales
bun run translate --all --force # retranslate everything
```

The `--force` flag is useful when you've rewritten English strings and want fresh translations rather than patching old ones.

## Triggering via GitHub Actions

1. Go to the [Translate workflow](https://github.com/4HerfrikaHQ/landing-page/actions/workflows/translate.yml)
2. Click **Run workflow** → **Run workflow**
3. The workflow will run `bun run translate --all` and auto-commit the results

This is useful when the auto-trigger didn't fire (e.g., you pushed a batch of commits and only the last one touched `en.json`).

## Technical setup

| Component | Details |
|-----------|---------|
| Translation service | [General Translation](https://gtx.dev) |
| CLI package | `generaltranslation` (via `bunx gt`) |
| Config file | `gt.config.json` |
| Lockfile | `gt-lock.json` (tracks version hashes per locale, committed to git) |
| Source file | `messages/en.json` |
| Target files | `messages/<locale>.json` (one per non-English locale) |
| Locale registry | `i18n/routing.ts` (`LOCALES` array) |
| Script | `scripts/translate.ts` |
| Workflow | `.github/workflows/translate.yml` |

## Adding a new locale

1. Add the locale entry to the `LOCALES` array in `i18n/routing.ts`
2. Run `bun run translate --all` — the script picks up the new locale automatically
3. Next.js will now serve that locale based on the user's detected language

## Environment variables required

```
GT_API_KEY=
GT_PROJECT_ID=
```

These are set in the GitHub Actions secrets for CI. For local use, add them to `.env.local`. You can get both from the GT dashboard.

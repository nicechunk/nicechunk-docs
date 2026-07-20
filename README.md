# NiceChunk Field Guide

![NiceChunk Field Guide overview](docs/media/catalog-overview-v4.webp)

The NiceChunk Field Guide explains the game to players who do not need to know programming or blockchain terminology in advance. It connects visible game actions to the browser runtime, Chunk.js world reconstruction, Guardian relay behavior, Solana programs and PDAs, character models, baked materials, and dated deployment evidence.

Read the published guide at [nicechunk.com/docs](https://nicechunk.com/docs/).

## What This Repository Contains

This repository is the GitHub publication mirror of the current field guide. The catalog organizes the guide into learning paths, and each topic page answers one player-sized question before introducing implementation details.

Every completed guide topic is designed to include:

- a plain-language explanation that starts with what the player sees and does;
- explicit boundaries between local browser behavior, Guardian relay behavior, Solana state, and deterministic reconstruction;
- relevant formulas, literal source excerpts, and line-by-line explanations;
- dated evidence and a clear statement of what that evidence does not prove;
- purpose-made teaching images grounded in the canonical villager boy and girl, real Chunk.js scenes, and real baked material or model references.

The guide is evidence-backed documentation, not a claim that every visible effect is on chain. A responsive animation, a Guardian message, a confirmed transaction, and a validated PDA read are different kinds of evidence and are described separately.

## Delivery Architecture

English is the default, crawler-readable edition. Each published route is a complete physical HTML document:

- `docs/index.html` is the field-guide catalog at `/docs/`.
- `docs/<slug>/index.html` is a topic at `/docs/<slug>/`.
- The English headings, prose, captions, formulas, code excerpts, evidence, and navigation are already present in the HTTP response.
- English remains readable with JavaScript disabled and does not require a document-content JSON request.

Translations are loaded independently and only when selected:

- `docs/content/en/<slug>.json` contains the canonical English authoring document in the source model mirrored here.
- `docs/content/<slug>/<language>.json` contains one generated runtime edition for one page and one language.
- `docs/locales/<language>.json` contains shared interface text for the Docs shell.
- Selecting a non-English language fetches only that page's language file. Returning to English restores the retained static HTML.

`docs/docs.js` owns the field-guide runtime, `src/i18n.js` provides shared locale behavior, and `src/site-header.js` mounts the same site header and navigation used by the rest of NiceChunk. Topic pages do not maintain a separate navigation implementation.

## Nginx-Compatible Static Hosting

The published guide is a static Nginx tree. A Docs-only release does not require a Vite build, a Vite development server, or a single-page application fallback.

The hosting configuration must preserve these route boundaries:

- `/docs/` serves `docs/index.html`.
- `/docs/<slug>/` serves `docs/<slug>/index.html`.
- The supported no-trailing-slash topic route resolves to the same physical topic document.
- An explicit topic `index.html` request redirects to the canonical directory URL.
- `/docs/content/`, `/docs/locales/`, and `/docs/media/` serve static assets directly.
- `/src/i18n.js`, `/src/site-header.js`, and `/src/site-header.css` remain available at their root-relative URLs.
- Unknown topic slugs return `404` instead of falling back to the catalog.

This contract lets search crawlers, accessibility tools, static analysis tools, and no-JavaScript readers receive the complete English guide while keeping translated payloads page-scoped.

## Source and Publication Relationship

The canonical working source lives in the main NiceChunk project, not in this split checkout:

1. `docs/` in the main project contains English authoring documents, documentation code, evidence, and media.
2. `public/docs/` contains the generated runtime locale and page-content overlay.
3. The Docs synchronization process copies the canonical `docs/` tree, overlays `public/docs/`, and publishes the resulting static tree here.
4. Shared header files, selected project notes, site icons, and other required public assets are copied through an explicit allowlist.

Because this repository is a publication mirror, direct edits to generated HTML or runtime locale output can be replaced by the next synchronization. Make content changes in the main project source, regenerate the outputs, validate them, and then synchronize this repository.

## Repository Layout

| Path | Purpose |
| --- | --- |
| `docs/index.html` | Physical English catalog page |
| `docs/<slug>/index.html` | Physical English topic pages |
| `docs/content/en/` | Canonical English document inputs mirrored from the main project |
| `docs/content/<slug>/` | Independent generated language files for each topic |
| `docs/locales/` | Generated Docs shell dictionaries |
| `docs/media/` | Versioned guide illustrations and supporting media |
| `docs/visual-sources/` | Canonical game captures, model renders, and material references |
| `docs/audits/` | Dated machine-readable evidence snapshots |
| `docs/docs.js` | Topic loading, language switching, and guide interaction runtime |
| `src/` | Shared internationalization and site-header runtime |
| `optimization-notes/` | Retained technical investigation notes |

## Validation

Run validation from the main NiceChunk working tree, where the source generators, browser checks, Nginx route fixtures, and synchronization script live:

```bash
npm run check:docs-i18n
node scripts/sync-docs-github.mjs --check
```

The Docs validation verifies the locale matrix, generated-file parity, complete static English markup, canonical metadata, shared navigation, no-JavaScript reading, page-scoped language requests, mobile layout, and Nginx-compatible topic routing. The synchronization check then compares the managed GitHub tree with the canonical source and reports missing, unexpected, or changed files.

Before publishing a change, also confirm that:

- every new or modified topic has a complete physical English HTML page;
- every supported non-English edition has its own page-and-language JSON file;
- all referenced images and evidence files exist;
- English does not request body-content JSON at runtime;
- desktop and mobile pages have no horizontal overflow or hidden navigation state;
- no secrets, wallet files, private deployment data, or machine-specific configuration are present; and
- repository prose, code, comments, and commit messages are English, while translated user-facing copy remains inside language JSON files.

## Contribution Rules

- Keep one topic focused on one player question.
- Explain player-visible behavior before implementation terminology.
- Name the exact authority and evidence boundary for every technical claim.
- Preserve existing public slugs when a broad legacy page becomes an overview.
- Use the shared site header and current field-guide visual language.
- Do not publish unfinished catalog placeholders.
- Do not edit generated outputs without updating their canonical inputs.
- Use an English commit message for every logical change.

## Official Links

- Documentation: [https://nicechunk.com/docs/](https://nicechunk.com/docs/)
- GitHub: [https://github.com/nicechunk/nicechunk-docs](https://github.com/nicechunk/nicechunk-docs)

# PH646 Website

Static website for PH646 online casino and sports betting.

## Structure

- **partials/** – Reusable header, footer, and sidebar (loaded by JS).
- **css/style.css** – Main styles; variables, components, utilities.
- **js/load-partials.js** – Loads header/footer/sidebar (run before main.js).
- **js/main.js** – Menu, scroll, animations, forms.
- **images/** – Site images; use **WebP** (see `images/README.md`).

## Local development

Partials are loaded with `fetch()`, which requires the site to be served over HTTP (not `file://`). Run a local server from the project root, for example:

```bash
npx serve .
# or: python -m http.server 8000
```

Then open `http://localhost:3000` (or the port shown).

## Maintenance

- **Header / footer / nav**: Edit `partials/header.html` and `partials/footer.html`; all pages use these.
- **Sidebar**: Edit `partials/sidebar.html`; used on the News index.
- **Active nav**: Set `data-page` on `<body>` (e.g. `data-page="slots"`) so the correct nav item is highlighted.
- **New pages**: Add `load-partials.js` before `main.js`, include `<div id="partial-header"></div>` and `<div id="partial-footer"></div>`, and set `data-page` if the page is in the main nav.

## SEO

- Meta title, description, canonical, Open Graph, and Twitter Card on all pages.
- Schema.org (WebSite, BreadcrumbList, CollectionPage, etc.) where relevant.
- Semantic HTML (`main`, `nav`, `article`, `section`) and breadcrumb links.

## Images

Use WebP and `<picture>` with a fallback; see `images/README.md`.

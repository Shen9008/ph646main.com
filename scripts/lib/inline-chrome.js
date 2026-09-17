'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');

function readPartial(name) {
  return fs.readFileSync(path.join(ROOT, 'partials', name), 'utf8').replace(/\r\n/g, '\n').trim();
}

function indentBlock(text, cols) {
  const pad = ' '.repeat(cols);
  return text
    .split('\n')
    .map((line) => (line ? pad + line : line))
    .join('\n');
}

function wrapPlaceholder(id, inner, cols) {
  const pad = ' '.repeat(cols);
  return `<div id="${id}">\n${indentBlock(inner, cols + 4)}\n${pad}</div>`;
}

function decorateCardImages(html) {
  let first = true;
  return html.replace(
    /(<div class="(?:game-card__image|tile__img)">\s*)<img\b([^>]*?)(\s*\/?)>/gi,
    (full, open, attrs) => {
      let a = attrs;
      if (!/\bwidth\s*=/i.test(a)) a += ' width="320"';
      if (!/\bheight\s*=/i.test(a)) a += ' height="200"';
      if (!/\bdecoding\s*=/i.test(a)) a += ' decoding="async"';
      if (first) {
        if (!/\bloading\s*=/i.test(a)) a += ' loading="eager"';
        if (!/\bfetchpriority\s*=/i.test(a)) a += ' fetchpriority="high"';
        first = false;
      } else if (!/\bloading\s*=/i.test(a)) {
        a += ' loading="lazy"';
      }
      return `${open}<img${a}>`;
    }
  );
}

function injectChrome(html) {
  const header = readPartial('header.html');
  const footer = readPartial('footer.html');
  const cta = readPartial('cta-banner.html');
  let out = html.replace(/\r\n/g, '\n');

  if (!/\bclass="skip-link"/.test(out)) {
    out = out.replace(
      /<body([^>]*)>/i,
      '<body$1>\n    <a class="skip-link" href="#main-content">Skip to content</a>'
    );
  }

  if (/<div id="partial-header">\s*<\/div>/i.test(out)) {
    out = out.replace(
      /<div id="partial-header">\s*<\/div>/i,
      wrapPlaceholder('partial-header', header, 4)
    );
  }

  if (/<div id="partial-footer">\s*<\/div>/i.test(out)) {
    out = out.replace(
      /<div id="partial-footer">\s*<\/div>/i,
      wrapPlaceholder('partial-footer', footer, 4)
    );
  }

  const is404 = /data-page="404"/.test(out);
  if (!is404 && !/class="[^"]*cta-banner/.test(out)) {
    out = out.replace(
      /(<main\b[\s\S]*?<\/section>)/i,
      `$1\n\n${indentBlock(cta, 4)}`
    );
  }

  return decorateCardImages(out);
}

module.exports = { injectChrome, decorateCardImages };

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const NEWS_DIR = path.join(ROOT, 'news');

function indentLines(text, cols) {
  const pad = ' '.repeat(cols);
  return text
    .split(/\r?\n/)
    .map((line) => pad + line.replace(/^\s+/, ''))
    .join('\n');
}

function indentBlock(text, cols) {
  const pad = ' '.repeat(cols);
  return text
    .split(/\r?\n/)
    .map((line) => pad + line)
    .join('\n');
}

function normalizeHero(heroHtml) {
  let h = heroHtml;
  h = h.replace(
    /<h1 class="hero__title"\s+style="font-size:\s*2rem;">/gi,
    '<h1 id="article-hero-title" class="hero__title">'
  );
  if (!h.includes('article-hero-title')) {
    h = h.replace(/<h1 class="hero__title">/i, '<h1 id="article-hero-title" class="hero__title">');
  }
  if (/aria-labelledby/i.test(h)) return h;
  return h.replace(
    /<section class="hero blog-article-hero"/i,
    '<section class="hero blog-article-hero" aria-labelledby="article-hero-title"'
  );
}

function rebuildHtml(html) {
  const headMatch = html.match(/<head>[\s\S]*?<\/head>/i);
  const bodyMatch = html.match(/<body[^>]*>/i);
  const heroMatch = html.match(
    /<section class="hero blog-article-hero"[\s\S]*?<\/section>/i
  );
  const contentMatch = html.match(
    /<div class="blog-article__content">([\s\S]*?)<\/div>\s*<\/article>/i
  );

  if (!headMatch || !bodyMatch || !heroMatch || !contentMatch) {
    throw new Error('Could not parse hero or article content');
  }

  const head = headMatch[0];
  const bodyOpen = bodyMatch[0];
  const hero = indentBlock(normalizeHero(heroMatch[0].trim()), 4);
  const prose = indentLines(contentMatch[1].trim().replace(/\r\n/g, '\n'), 24);

  return `<!DOCTYPE html>
<html lang="en">
${head}
${bodyOpen}
    <div id="partial-header"></div>

    <main id="main-content" class="news-article-page">
${hero}
    <section class="section news-article-page__body">
        <div class="container layout-with-sidebar">
            <div class="layout-main">
                <article class="blog-article">
                    <div class="blog-article__content">
${prose}
                    </div>
                </article>
            </div>
            <div id="partial-sidebar"></div>
        </div>
    </section>
    </main>

    <div id="partial-footer"></div>
</body>
</html>
`;
}

function main() {
  const entries = fs.readdirSync(NEWS_DIR, { withFileTypes: true });
  let n = 0;
  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    const slug = ent.name;
    const file = path.join(NEWS_DIR, slug, 'index.html');
    if (!fs.existsSync(file)) continue;
    let html = fs.readFileSync(file, 'utf8');
    if (!html.includes('blog-article__content')) continue;
    const out = rebuildHtml(html);
    fs.writeFileSync(file, out, 'utf8');
    n += 1;
    console.log('rebuilt', slug);
  }
  console.log('Done.', n, 'article(s).');
}

main();

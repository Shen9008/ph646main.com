'use strict';

const fs = require('fs');
const path = require('path');
const { injectChrome } = require('./lib/inline-chrome');

const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  '.cursor',
  '.github',
  'partials',
  'scripts',
  'css',
  'js',
  'images',
  'assets',
]);

const THIN_AU = {
  'live-casino-australia-guide': '/live-casino/',
  'online-pokies-australia-guide': '/slots/',
};

function walkHtml(dir, acc) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name.startsWith('.')) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (SKIP_DIRS.has(ent.name)) continue;
      walkHtml(full, acc);
    } else if (ent.name.endsWith('.html')) {
      acc.push(full);
    }
  }
  return acc;
}

function applyChrome() {
  const files = walkHtml(ROOT, []);
  let n = 0;
  for (const file of files) {
    const before = fs.readFileSync(file, 'utf8');
    const after = injectChrome(before);
    if (after !== before) {
      fs.writeFileSync(file, after, 'utf8');
      n += 1;
    }
  }
  console.log('Inlined chrome / image attrs in', n, 'HTML file(s). Total scanned:', files.length);
}

function noindexThinAuPages() {
  for (const [slug, dest] of Object.entries(THIN_AU)) {
    const file = path.join(ROOT, 'news', slug, 'index.html');
    if (!fs.existsSync(file)) continue;
    let html = fs.readFileSync(file, 'utf8');
    if (/name="robots"/i.test(html)) {
      html = html.replace(
        /<meta name="robots" content="[^"]*">/i,
        '<meta name="robots" content="noindex, follow">'
      );
    } else {
      html = html.replace(
        /<meta charset="UTF-8">/i,
        '<meta charset="UTF-8">\n    <meta name="robots" content="noindex, follow">'
      );
    }
    const canonical = `https://ph646main.com${dest}`;
    if (/rel="canonical"/i.test(html)) {
      html = html.replace(
        /<link rel="canonical" href="[^"]*">/i,
        `<link rel="canonical" href="${canonical}">`
      );
    }
    fs.writeFileSync(file, html, 'utf8');
  }
  console.log('Set noindex + money-page canonicals on thin AU leftover pages');
}

function stripSitemapThinAu() {
  const sitemapPath = path.join(ROOT, 'sitemap.xml');
  let xml = fs.readFileSync(sitemapPath, 'utf8');
  const slugs = Object.keys(THIN_AU);
  for (const slug of slugs) {
    const re = new RegExp(
      `\\s*<url>\\s*<loc>https://ph646main\\.com/(?:news|blog)/${slug}/</loc>[\\s\\S]*?</url>`,
      'g'
    );
    xml = xml.replace(re, '');
  }
  fs.writeFileSync(sitemapPath, xml, 'utf8');
  console.log('Removed thin AU URLs from sitemap.xml');
}

function stripBlogsThinAu() {
  const blogsPath = path.join(ROOT, 'assets/data/blogs.json');
  const blogs = JSON.parse(fs.readFileSync(blogsPath, 'utf8'));
  const drop = new Set(Object.keys(THIN_AU));
  const next = blogs
    .filter((b) => !drop.has(b.slug))
    .map((b) => {
      if (!Array.isArray(b.related_posts)) return b;
      return {
        ...b,
        related_posts: b.related_posts.filter((s) => !drop.has(s)),
      };
    });
  fs.writeFileSync(blogsPath, JSON.stringify(next, null, 2) + '\n', 'utf8');
  console.log('blogs.json entries:', blogs.length, '→', next.length);
}

function retargetThinAuHrefs() {
  const files = walkHtml(ROOT, []);
  files.push(path.join(ROOT, 'partials', 'sidebar.html'));
  let n = 0;
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let html = fs.readFileSync(file, 'utf8');
    const next = html
      .replace(/\/(?:news|blog)\/online-pokies-australia-guide\//g, '/news/pokies-vs-online-slots/')
      .replace(/\/(?:news|blog)\/live-casino-australia-guide\//g, '/live-casino/');
    if (next !== html) {
      fs.writeFileSync(file, next, 'utf8');
      n += 1;
    }
  }
  console.log('Retargeted thin AU hrefs in', n, 'file(s)');
}

function main() {
  applyChrome();
  noindexThinAuPages();
  stripSitemapThinAu();
  stripBlogsThinAu();
  retargetThinAuHrefs();
}

main();

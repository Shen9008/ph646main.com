'use strict';

const fs = require('fs');
const path = require('path');
const { sortBlogsForIndex, compareBlogPosts } = require('./lib/sort-blogs.js');

const ROOT = path.resolve(__dirname, '..');
const NEWS_DIR = path.join(ROOT, 'news');
const OUT = path.join(ROOT, 'assets', 'data', 'blogs.json');

const PLACEHOLDER_GRADIENT =
  'linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0.05) 55%, #0a0a0a 100%)';

function getRelatedSlugs(blogs, currentSlug, category, limit = 3) {
  const cat = (category || '').toLowerCase();
  const others = blogs.filter((b) => b.slug !== currentSlug);
  const sameCat = others
    .filter((b) => (b.category || '').toLowerCase() === cat)
    .sort(compareBlogPosts);
  const used = new Set(sameCat.map((b) => b.slug));
  const rest = others.filter((b) => !used.has(b.slug)).sort(compareBlogPosts);
  return [...sameCat, ...rest].slice(0, limit).map((b) => b.slug);
}

function parseArticle(html, slug) {
  const titleM = html.match(/<title>([^<]+)<\/title>/);
  const metaDescM = html.match(
    /<meta\s+name="description"\s+content="([^"]*)"/i
  );
  const keywordsM = html.match(
    /<meta\s+name="keywords"\s+content="([^"]*)"/i
  );
  const publishedM = html.match(
    /<meta\s+property="article:(?:published_time)"\s+content="([^"]+)"/i
  );
  const categoryM = html.match(
    /<span class="blog-article__category">([^<]+)<\/span>/
  );
  const readingM = html.match(/Reading Time:\s*(\d+)\s*min/i);
  const h1M = html.match(/<h1[^>]*class="hero__title"[^>]*>([^<]+)<\/h1>/);

  const title = h1M ? h1M[1].trim() : titleM ? titleM[1].replace(/\s*[–-]\s*PH646.*$/i, '').trim() : slug;
  const meta_description = metaDescM ? metaDescM[1] : '';
  const keywords = keywordsM
    ? keywordsM[1].split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const published_date = publishedM ? publishedM[1].slice(0, 10) : '2025-01-01';
  const reading_min = readingM ? parseInt(readingM[1], 10) : 12;
  const reading_time = `${reading_min} min read`;
  const category = categoryM ? categoryM[1].trim() : 'Casino Guide';
  const meta_title = titleM ? titleM[1].trim() : title;
  const focus_keyword = keywords[0] || title.split(/[|–-]/)[0].trim();

  return {
    slug,
    title,
    meta_title,
    meta_description,
    focus_keyword,
    category,
    search_intent: 'Informational',
    published_date,
    reading_time,
    excerpt: meta_description,
    placeholder_gradient: PLACEHOLDER_GRADIENT,
    keywords,
  };
}

function main() {
  const dirs = fs
    .readdirSync(NEWS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const raw = [];
  for (const dir of dirs) {
    const file = path.join(NEWS_DIR, dir, 'index.html');
    if (!fs.existsSync(file)) continue;
    const html = fs.readFileSync(file, 'utf8');
    if (!html.includes('blog-article__header')) continue;
    raw.push(parseArticle(html, dir));
  }

  const now = new Date().toISOString();
  const blogs = raw.map((b) => ({
    ...b,
    related_posts: [],
    synced_at: now,
  }));

  for (const b of blogs) {
    b.related_posts = getRelatedSlugs(blogs, b.slug, b.category);
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(sortBlogsForIndex(blogs), null, 2) + '\n', 'utf8');
  console.log(`Wrote ${blogs.length} entries to ${path.relative(ROOT, OUT)}`);
}

main();

'use strict';

const fs = require('fs');
const path = require('path');
const { fetchPosts, assertStrictSiteFilter } = require('./lib/fetch-posts.js');
const { normalizePost, validatePost } = require('./lib/normalize-post.js');
const { renderArticle } = require('./lib/render-article.js');
const { generateSitemap } = require('./lib/generate-sitemap.js');
const { fingerprintFromStrapiPost, postNeedsRefresh } = require('./lib/content-fingerprint.js');
const { sortBlogsForIndex } = require('./lib/sort-blogs.js');

const ROOT = path.resolve(__dirname, '..');
const BLOGS_JSON_PATH = path.join(ROOT, 'assets/data/blogs.json');

const BLOGS_JSON_FIELDS = [
  'slug', 'title', 'meta_title', 'meta_description', 'focus_keyword',
  'category', 'search_intent', 'published_date', 'reading_time',
  'excerpt', 'placeholder_gradient', 'related_posts', 'keywords',
  'cms_updated_at', 'content_hash', 'synced_at', 'article_path',
];

function parseArgs(argv) {
  const flags = {
    all: argv.includes('--all'),
    daily: argv.includes('--daily'),
    refresh: argv.includes('--refresh'),
    force: argv.includes('--force'),
    limit: null,
  };
  const limitIdx = argv.indexOf('--limit');
  if (limitIdx !== -1 && argv[limitIdx + 1]) {
    const n = parseInt(argv[limitIdx + 1], 10);
    if (!Number.isNaN(n) && n > 0) flags.limit = n;
  }
  return flags;
}

function toBlogsEntry(normalized, strapiPost) {
  const entry = {};
  for (const k of BLOGS_JSON_FIELDS) {
    if (normalized[k] !== undefined) entry[k] = normalized[k];
  }
  const fp = fingerprintFromStrapiPost(strapiPost);
  entry.cms_updated_at = fp.cms_updated_at;
  entry.content_hash = fp.content_hash;
  entry.synced_at = new Date().toISOString();
  entry.article_path = entry.article_path || 'blog';
  return entry;
}

function getRelatedSlugs(blogs, currentSlug, opts = {}, limit = 3) {
  const searchIntent = (opts.searchIntent || 'informational').toLowerCase();
  const category = (opts.category || '').toLowerCase();
  const others = blogs.filter((b) => b.slug !== currentSlug);

  const byLatest = (list) => list.slice().sort(sortBlogsForIndex);

  const sameIntent = byLatest(
    others.filter((b) => (b.search_intent || '').toLowerCase() === searchIntent),
  );
  const sameIntentSlugs = new Set(sameIntent.map((b) => b.slug));
  const sameCategory = byLatest(
    others.filter(
      (b) => !sameIntentSlugs.has(b.slug) && category && (b.category || '').toLowerCase() === category,
    ),
  );
  const sameCategorySlugs = new Set(sameCategory.map((b) => b.slug));
  const rest = byLatest(
    others.filter((b) => !sameIntentSlugs.has(b.slug) && !sameCategorySlugs.has(b.slug)),
  );

  return [...sameIntent, ...sameCategory, ...rest].slice(0, limit).map((b) => b.slug);
}

function loadBlogsJson() {
  try {
    const raw = fs.readFileSync(BLOGS_JSON_PATH, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveBlogsJson(blogs) {
  const sorted = blogs.slice().sort(sortBlogsForIndex);
  fs.writeFileSync(BLOGS_JSON_PATH, JSON.stringify(sorted, null, 2) + '\n', 'utf8');
}

function buildApiBySlug(strapiPosts) {
  const map = new Map();
  for (const p of strapiPosts) {
    const slug = p.slug || p.documentId || '';
    if (slug) map.set(slug, p);
  }
  return map;
}

function buildWorklist(flags, strapiPosts, existingBlogs) {
  const knownSlugs = new Set(existingBlogs.map((b) => b.slug));
  const apiBySlug = buildApiBySlug(strapiPosts);

  const unprocessed = strapiPosts
    .filter((p) => {
      const slug = p.slug || p.documentId || '';
      return slug && !knownSlugs.has(slug);
    })
    .sort((a, b) => new Date(a.publishedAt || 0) - new Date(b.publishedAt || 0));

  const worklist = [];
  const seen = new Set();

  function add(raw, mode) {
    const slug = raw.slug || raw.documentId || '';
    if (!slug || seen.has(slug)) return;
    seen.add(slug);
    worklist.push({ raw, mode, slug });
  }

  if (flags.force) {
    for (const raw of strapiPosts) add(raw, 'force');
    return applyLimit(worklist, flags.limit);
  }

  if (!flags.force) {
    let newLimit = 1;
    if (flags.daily) newLimit = 1;
    else if (flags.all || flags.refresh) newLimit = unprocessed.length;
    const toCreate = unprocessed.slice(0, newLimit);
    for (const raw of toCreate) add(raw, 'create');
  }

  const wantRefresh = (flags.refresh || flags.daily) && !flags.all;
  if (wantRefresh) {
    for (const entry of existingBlogs) {
      const raw = apiBySlug.get(entry.slug);
      if (!raw) continue;
      if (postNeedsRefresh(entry, raw)) add(raw, 'refresh');
    }
  }

  return applyLimit(worklist, flags.limit);
}

function applyLimit(worklist, limit) {
  if (limit == null) return worklist;
  return worklist.slice(0, limit);
}

function upsertBlogsEntry(blogs, entry) {
  const idx = blogs.findIndex((b) => b.slug === entry.slug);
  if (idx === -1) blogs.push(entry);
  else blogs[idx] = { ...blogs[idx], ...entry };
  return blogs;
}

function processOne(raw, blogs, mode) {
  const slug = raw.slug || raw.documentId || '';
  const related = getRelatedSlugs(blogs, slug, {
    searchIntent: raw.search_intent,
    category: raw.category,
  });

  const normalized = normalizePost(raw, { relatedPosts: related });
  validatePost(normalized);

  console.log(`  - [${mode}] ${normalized.title} (${slug})`);
  renderArticle(normalized, { blogs });

  const entry = toBlogsEntry(normalized, raw);
  return upsertBlogsEntry(blogs, entry);
}

async function run() {
  const flags = parseArgs(process.argv);
  assertStrictSiteFilter();

  const apiUrl = process.env.STRAPI_API_URL || 'http://localhost:1337/api';
  const modeLabel = flags.force
    ? 'force'
    : flags.daily
      ? 'daily'
      : flags.refresh
        ? 'refresh'
        : flags.all
          ? 'all-new'
          : 'default';

  console.log(`Fetching posts from API (mode: ${modeLabel})...`);
  const strapiPosts = await fetchPosts({ baseUrl: apiUrl });

  let blogs = loadBlogsJson();
  const worklist = buildWorklist(flags, strapiPosts, blogs);

  if (worklist.length === 0) {
    console.log('No articles to publish or refresh.');
    return;
  }

  console.log(`Processing ${worklist.length} article(s)...`);

  for (const item of worklist) {
    blogs = processOne(item.raw, blogs, item.mode);
  }

  saveBlogsJson(blogs);
  generateSitemap();
  console.log('Done. blogs.json and sitemap.xml updated.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

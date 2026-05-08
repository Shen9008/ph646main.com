'use strict';

/**
 * Rebuild blog article index.html files from article.template.html + existing prose.
 * Run after template changes. Only processes blogs.json entries with article_path === "blog".
 */

const fs = require('fs');
const path = require('path');
const { formatDateLong } = require('./lib/normalize-post.js');

const ROOT = path.resolve(__dirname, '..');
const TEMPLATE = path.join(ROOT, 'scripts/templates/article.template.html');
const BLOG_ROOT = path.join(ROOT, 'blog');
const BLOGS_JSON = path.join(ROOT, 'assets/data/blogs.json');

function escapeJsonString(s) {
  if (typeof s !== 'string') return '';
  return s
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r?\n/g, '\\n');
}

function extractProseInner(html) {
  const marker = /<\/div>\s*<section class="[^"]*(?:blog-inline-cta|blog-post-page__cta)/;
  const m = html.match(marker);
  if (!m) return null;
  const endIdx = m.index;
  const sm = html.match(/<div class="article-prose blog-prose[^"]*">/);
  if (!sm) return null;
  const startIdx = sm.index + sm[0].length;
  return html.slice(startIdx, endIdx).trim();
}

function splitToc(inner) {
  const navRe = /^(\s*<nav class="blog-toc[\s\S]*?<\/nav>\s*)([\s\S]*)$/;
  const mm = inner.match(navRe);
  if (mm) {
    return { tocHtml: mm[1].trim() + '\n\n            ', body: mm[2].trim() };
  }
  return { tocHtml: '', body: inner };
}

function applyTemplate(template, map) {
  let out = template;
  for (const [k, v] of Object.entries(map)) {
    out = out.split(k).join(v);
  }
  return out;
}

function main() {
  const template = fs.readFileSync(TEMPLATE, 'utf8');
  const blogs = JSON.parse(fs.readFileSync(BLOGS_JSON, 'utf8'));
  const bySlug = Object.fromEntries(blogs.map((b) => [b.slug, b]));

  const dirs = fs
    .readdirSync(BLOG_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const slug of dirs) {
    const entry = bySlug[slug];
    if (!entry || entry.article_path !== 'blog') continue;

    const htmlPath = path.join(BLOG_ROOT, slug, 'index.html');
    if (!fs.existsSync(htmlPath)) continue;
    const oldHtml = fs.readFileSync(htmlPath, 'utf8');
    const inner = extractProseInner(oldHtml);
    if (!inner) {
      console.warn('Skip (no prose block):', slug);
      continue;
    }
    const { tocHtml, body } = splitToc(inner);

    const siteOrigin = 'https://ph646main.com';
    const canonical = `${siteOrigin}/blog/${slug}/`;
    const ogImage = `${siteOrigin}/images/hero-banners/hero-blog.webp`;
    const logoUrl = `${siteOrigin}/images/logo/logo-main.webp`;
    const pub = entry.published_date || '';
    const pubFmt = formatDateLong(pub.length === 10 ? `${pub}T12:00:00` : pub);

    const map = {
      '{{META_TITLE}}': entry.meta_title || entry.title,
      '{{META_DESCRIPTION}}': entry.meta_description || entry.excerpt || '',
      '{{KEYWORDS}}': entry.focus_keyword || entry.title,
      '{{SLUG}}': slug,
      '{{TITLE}}': entry.title,
      '{{JSON_TITLE}}': escapeJsonString(entry.title || ''),
      '{{JSON_DESCRIPTION}}': escapeJsonString(entry.meta_description || entry.excerpt || ''),
      '{{CATEGORY}}': entry.category || 'Informational',
      '{{PUBLISHED_DATE_ISO}}': pub,
      '{{PUBLISHED_DATE_FORMATTED}}': pubFmt,
      '{{UPDATED_DATE_ISO}}': pub,
      '{{READING_TIME}}': entry.reading_time || '5 min read',
      '{{EXCERPT}}': entry.excerpt || '',
      '{{PLACEHOLDER_GRADIENT}}':
        entry.placeholder_gradient ||
        'linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0.05) 55%, #0a0a0a 100%)',
      '{{FOCUS_KEYWORD}}': entry.focus_keyword || entry.title,
      '{{TOC_HTML}}': tocHtml,
      '{{ARTICLE_BODY}}': body,
      '{{SHARE_URL}}': canonical,
      '{{SHARE_URL_ENCODED}}': encodeURIComponent(canonical),
      '{{SHARE_TITLE}}': encodeURIComponent(entry.title),
      '{{FAQ_SCHEMA_SCRIPT}}': '',
      '{{RELATED_POST_SLUGS}}': (entry.related_posts || []).join(','),
      '{{SITE_ORIGIN}}': siteOrigin,
      '{{CANONICAL_URL}}': canonical,
      '{{OG_IMAGE}}': ogImage,
      '{{LOGO_URL}}': logoUrl,
    };

    fs.writeFileSync(htmlPath, applyTemplate(template, map), 'utf8');
    console.log('Updated', slug);
  }
}

main();

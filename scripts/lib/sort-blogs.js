'use strict';

/** Keep in sync with js/blog-loader.js */
function syncSortTime(post) {
  if (!post || !post.synced_at) return 0;
  const t = new Date(post.synced_at).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function compareBlogPosts(a, b) {
  const syncB = syncSortTime(b);
  const syncA = syncSortTime(a);
  if (syncB !== syncA) return syncB - syncA;

  const pubB = new Date(b.published_date || 0).getTime();
  const pubA = new Date(a.published_date || 0).getTime();
  if (pubB !== pubA) return pubB - pubA;

  const cmsB = new Date(b.cms_updated_at || 0).getTime();
  const cmsA = new Date(a.cms_updated_at || 0).getTime();
  if (cmsB !== cmsA) return cmsB - cmsA;

  return String(b.slug).localeCompare(String(a.slug));
}

function sortBlogsForIndex(blogs) {
  return blogs.slice().sort(compareBlogPosts);
}

module.exports = { syncSortTime, compareBlogPosts, sortBlogsForIndex };

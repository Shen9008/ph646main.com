/**
 * Shared blog index helpers (news hub, article sidebars).
 * Sort: latest sync first (synced_at desc), then published_date, cms_updated_at, slug.
 */
(function (global) {
  'use strict';

  var MAX_POSTS = 594;

  function sortBlogPosts(posts) {
    return posts.slice().sort(function (a, b) {
      var syncB = new Date(b.synced_at || b.published_date || 0).getTime();
      var syncA = new Date(a.synced_at || a.published_date || 0).getTime();
      if (syncB !== syncA) return syncB - syncA;

      var pubB = new Date(b.published_date || 0).getTime();
      var pubA = new Date(a.published_date || 0).getTime();
      if (pubB !== pubA) return pubB - pubA;

      var cmsB = new Date(b.cms_updated_at || 0).getTime();
      var cmsA = new Date(a.cms_updated_at || 0).getTime();
      if (cmsB !== cmsA) return cmsB - cmsA;

      return String(b.slug).localeCompare(String(a.slug));
    });
  }

  function prepareBlogIndex(posts) {
    var sorted = sortBlogPosts(Array.isArray(posts) ? posts : []);
    if (sorted.length > MAX_POSTS) {
      return sorted.slice(0, MAX_POSTS);
    }
    return sorted;
  }

  global.BlogLoader = {
    MAX_POSTS: MAX_POSTS,
    sortBlogPosts: sortBlogPosts,
    prepareBlogIndex: prepareBlogIndex,
  };
})(typeof window !== 'undefined' ? window : global);

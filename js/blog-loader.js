/**
 * Shared blog index sort (news hub, article sidebars, must match content-sync.js).
 * Latest sync first: synced_at desc only; missing synced_at sorts last.
 */
(function (global) {
  'use strict';

  var MAX_POSTS = 594;

  function syncSortTime(post) {
    if (!post || !post.synced_at) return 0;
    var t = new Date(post.synced_at).getTime();
    return isNaN(t) ? 0 : t;
  }

  function compareBlogPosts(a, b) {
    var syncB = syncSortTime(b);
    var syncA = syncSortTime(a);
    if (syncB !== syncA) return syncB - syncA;

    var pubB = new Date(b.published_date || 0).getTime();
    var pubA = new Date(a.published_date || 0).getTime();
    if (pubB !== pubA) return pubB - pubA;

    var cmsB = new Date(b.cms_updated_at || 0).getTime();
    var cmsA = new Date(a.cms_updated_at || 0).getTime();
    if (cmsB !== cmsA) return cmsB - cmsA;

    return String(b.slug).localeCompare(String(a.slug));
  }

  function sortBlogPosts(posts) {
    return (Array.isArray(posts) ? posts : []).slice().sort(compareBlogPosts);
  }

  function prepareBlogIndex(posts) {
    var sorted = sortBlogPosts(posts);
    if (sorted.length > MAX_POSTS) {
      return sorted.slice(0, MAX_POSTS);
    }
    return sorted;
  }

  global.BlogLoader = {
    MAX_POSTS: MAX_POSTS,
    syncSortTime: syncSortTime,
    compareBlogPosts: compareBlogPosts,
    sortBlogPosts: sortBlogPosts,
    prepareBlogIndex: prepareBlogIndex,
  };
})(typeof window !== 'undefined' ? window : global);

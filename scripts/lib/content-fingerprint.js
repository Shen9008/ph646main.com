'use strict';

const crypto = require('crypto');

/**
 * Stable SHA-256 of Strapi post body (detects cross-site link injection, etc.).
 * @param {string|object|object[]|null|undefined} content
 * @returns {string} hex digest
 */
function hashPostContent(content) {
  let raw = '';
  if (content == null) {
    raw = '';
  } else if (typeof content === 'string') {
    raw = content;
  } else {
    raw = JSON.stringify(content);
  }
  return crypto.createHash('sha256').update(raw, 'utf8').digest('hex');
}

/**
 * @param {object} strapiPost
 * @returns {{ content_hash: string, cms_updated_at: string }}
 */
function fingerprintFromStrapiPost(strapiPost) {
  const cmsUpdatedAt = strapiPost.updatedAt || strapiPost.publishedAt || '';
  return {
    content_hash: hashPostContent(strapiPost.content),
    cms_updated_at: cmsUpdatedAt ? String(cmsUpdatedAt) : '',
  };
}

/**
 * @param {object} entry - blogs.json row
 * @param {object} strapiPost
 * @returns {boolean}
 */
function postNeedsRefresh(entry, strapiPost) {
  const fp = fingerprintFromStrapiPost(strapiPost);
  if (entry.content_hash && fp.content_hash !== entry.content_hash) return true;
  if (entry.cms_updated_at && fp.cms_updated_at && fp.cms_updated_at !== entry.cms_updated_at) {
    return true;
  }
  return false;
}

module.exports = {
  hashPostContent,
  fingerprintFromStrapiPost,
  postNeedsRefresh,
};

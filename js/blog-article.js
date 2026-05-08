/**
 * Blog article: related posts + sidebar from assets/data/blogs.json
 * Resolves /news/ vs /blog/ using article_path (same rules as news-hub.js).
 */
document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    var SIDEBAR_LATEST_MAX = 3;

    var slug = document.body.getAttribute('data-blog-slug');
    if (!slug) return;

    var relatedRaw = document.body.getAttribute('data-related-slugs') || '';
    var relatedSlugs = relatedRaw.split(',').map(function (s) { return s.trim(); }).filter(Boolean);

    var pathname = (window.location.pathname || '').replace(/\/$/, '') || '/';
    var segments = pathname.split('/').filter(Boolean).filter(function (s) { return s !== 'index.html'; });
    var depth = segments.length;
    var baseToRoot = depth > 0 ? Array(depth + 1).join('../') : '';

    var dataUrl = baseToRoot + 'assets/data/blogs.json';

    function postHref(post) {
        if (post.article_path === 'blog') {
            return baseToRoot + 'blog/' + encodeURIComponent(post.slug) + '/';
        }
        return baseToRoot + 'news/' + encodeURIComponent(post.slug) + '/';
    }

    function sortPosts(blogs) {
        return blogs.slice().sort(function (a, b) {
            var tb = new Date(b.synced_at || b.published_date || 0).getTime();
            var ta = new Date(a.synced_at || a.published_date || 0).getTime();
            if (tb !== ta) return tb - ta;
            return String(b.slug).localeCompare(String(a.slug));
        });
    }

    function escapeHtml(s) {
        if (s == null) return '';
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function fillRelated(blogsBySlug) {
        var section = document.getElementById('related-posts');
        if (!section) return;
        var list = section.querySelector('.blog-related-list');
        var placeholder = section.querySelector('.blog-related-placeholder');
        if (!list) return;

        var items = [];
        relatedSlugs.forEach(function (relSlug) {
            if (relSlug === slug) return;
            var p = blogsBySlug[relSlug];
            if (!p) return;
            var href = postHref(p);
            var li = document.createElement('li');
            li.className = 'blog-related-item';
            li.innerHTML = '<a class="blog-related-item__link" href="' + href + '"><span class="blog-related-item__title">' + escapeHtml(p.title || relSlug) + '</span><span class="blog-related-item__meta">' + escapeHtml(p.category || '') + '</span></a>';
            items.push(li);
        });

        if (!items.length) {
            if (placeholder) {
                placeholder.textContent = 'More guides are available from the News hub.';
            }
            return;
        }
        list.innerHTML = '';
        items.forEach(function (node) { list.appendChild(node); });
        list.hidden = false;
        if (placeholder) placeholder.hidden = true;
    }

    function fillLatestArticles(blogs) {
        var ul = document.getElementById('sidebar-latest-articles');
        if (!ul) return;
        var sorted = sortPosts(blogs.filter(function (b) { return b.slug !== slug; })).slice(0, SIDEBAR_LATEST_MAX);
        ul.innerHTML = '';
        sorted.forEach(function (p) {
            var li = document.createElement('li');
            var a = document.createElement('a');
            a.href = postHref(p);
            a.textContent = p.title || p.slug;
            li.appendChild(a);
            ul.appendChild(li);
        });
        if (!sorted.length) {
            var li = document.createElement('li');
            li.className = 'blog-post-sidebar__placeholder';
            li.textContent = 'Browse guides on the News page.';
            ul.appendChild(li);
        }
    }

    function fillCategories(blogs) {
        var ul = document.getElementById('sidebar-categories');
        if (!ul) return;
        var byCategory = {};
        blogs.forEach(function (b) {
            var c = (b.category || '').trim();
            if (!c) return;
            if (!byCategory[c]) byCategory[c] = b;
        });
        var names = Object.keys(byCategory).sort(function (a, b) { return a.localeCompare(b); });
        ul.innerHTML = '';
        names.forEach(function (name) {
            var post = byCategory[name];
            var li = document.createElement('li');
            var a = document.createElement('a');
            a.href = post ? postHref(post) : baseToRoot + 'news/';
            a.textContent = name;
            li.appendChild(a);
            ul.appendChild(li);
        });
        if (!names.length) {
            var li = document.createElement('li');
            li.className = 'blog-post-sidebar__placeholder';
            li.textContent = 'Guides & tips';
            ul.appendChild(li);
        }
    }

    fetch(dataUrl)
        .then(function (r) {
            if (!r.ok) throw new Error('fetch');
            return r.json();
        })
        .then(function (blogs) {
            if (!Array.isArray(blogs)) throw new Error('data');
            var map = {};
            blogs.forEach(function (b) {
                if (b && b.slug) map[b.slug] = b;
            });
            fillRelated(map);
            fillLatestArticles(blogs);
            fillCategories(blogs);
        })
        .catch(function () {
            var section = document.getElementById('related-posts');
            if (section) {
                var placeholder = section.querySelector('.blog-related-placeholder');
                if (placeholder) placeholder.textContent = 'Browse more guides on the News page.';
            }
            var latest = document.getElementById('sidebar-latest-articles');
            if (latest && !latest.querySelector('a')) {
                latest.innerHTML = '<li class="blog-post-sidebar__placeholder"><a href="' + baseToRoot + 'news/">News hub</a></li>';
            }
            var cats = document.getElementById('sidebar-categories');
            if (cats && !cats.querySelector('a')) {
                cats.innerHTML = '<li class="blog-post-sidebar__placeholder"><a href="' + baseToRoot + 'news/">All guides</a></li>';
            }
        });

    document.querySelectorAll('.blog-toc a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var href = anchor.getAttribute('href');
            if (!href || href === '#') return;
            var target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            var headerOffset = 96;
            var top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
            window.scrollTo({ top: top, behavior: 'smooth' });
        });
    });
});

// News hub: load guides from blogs.json, paginate (?page=), link /news/ vs /blog/

document.addEventListener('DOMContentLoaded', function () {
    var grid = document.getElementById('news-hub-all-guides');
    var paginationEl = document.getElementById('news-hub-pagination');
    var countEl = document.getElementById('news-hub-all-guides-count');
    var errEl = document.getElementById('news-hub-all-guides-error');
    if (!grid || !paginationEl) return;

    var PAGE_SIZE = 8;
    var DATA_URL = '../assets/data/blogs.json';
    var FALLBACK_IMG = '../images/hero-banners/hero-blog.webp';

    function escapeHtml(s) {
        if (s == null) return '';
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function formatMetaDate(iso) {
        if (!iso) return '';
        var d = new Date(iso.length === 10 ? iso + 'T12:00:00' : iso);
        if (isNaN(d.getTime())) return '';
        return d.toLocaleDateString('en-AU', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function articleHref(post) {
        if (post.article_path === 'blog') {
            return '../blog/' + encodeURIComponent(post.slug) + '/';
        }
        return encodeURIComponent(post.slug) + '/';
    }

    function cardImageSrc(post) {
        if (post.article_path === 'blog') {
            return FALLBACK_IMG;
        }
        return '../images/news/' + encodeURIComponent(post.slug) + '.webp';
    }

    function sortPosts(posts) {
        if (typeof BlogLoader !== 'undefined' && BlogLoader.prepareBlogIndex) {
            return BlogLoader.prepareBlogIndex(posts);
        }
        return posts.slice().sort(function (a, b) {
            var tb = new Date(b.synced_at || b.published_date || 0).getTime();
            var ta = new Date(a.synced_at || a.published_date || 0).getTime();
            if (tb !== ta) return tb - ta;
            var pubB = new Date(b.published_date || 0).getTime();
            var pubA = new Date(a.published_date || 0).getTime();
            if (pubB !== pubA) return pubB - pubA;
            return String(b.slug).localeCompare(String(a.slug));
        });
    }

    function parsePage() {
        var q = new URLSearchParams(window.location.search).get('page');
        var n = parseInt(q, 10);
        if (!n || n < 1) return 1;
        return n;
    }

    function renderCard(post) {
        var href = articleHref(post);
        var imgSrc = cardImageSrc(post);
        var title = escapeHtml(post.title);
        var excerpt = escapeHtml(post.excerpt || '');
        var cat = escapeHtml(post.category || 'Guide');
        var meta = formatMetaDate(post.published_date);
        if (!meta && post.reading_time) meta = escapeHtml(post.reading_time);

        return (
            '<a href="' + href + '">' +
            '<article class="news-card" data-animate>' +
            '<div class="news-card__image"><img src="' + escapeHtml(imgSrc) + '" alt="' + title + '" decoding="async" width="640" height="360" loading="lazy" onerror="this.onerror=null;this.src=\'' + FALLBACK_IMG + '\'"></div>' +
            '<div class="news-card__content">' +
            '<span class="news-card__category">' + cat + '</span>' +
            '<h3 class="news-card__title">' + title + '</h3>' +
            '<p class="news-card__excerpt">' + excerpt + '</p>' +
            '<span class="news-card__meta">' + meta + '</span>' +
            '</div></article></a>'
        );
    }

    function buildPageList(totalPages, current) {
        if (totalPages <= 1) return [];
        var delta = 2;
        if (totalPages <= 9) {
            var simple = [];
            for (var s = 1; s <= totalPages; s++) simple.push(s);
            return simple;
        }
        var pages = new Set();
        pages.add(1);
        pages.add(totalPages);
        var left = Math.max(2, current - delta);
        var right = Math.min(totalPages - 1, current + delta);
        for (var p = left; p <= right; p++) pages.add(p);
        var sorted = Array.from(pages).sort(function (a, b) {
            return a - b;
        });
        var out = [];
        for (var j = 0; j < sorted.length; j++) {
            if (j > 0 && sorted[j] - sorted[j - 1] > 1) out.push(null);
            out.push(sorted[j]);
        }
        return out;
    }

    function renderPagination(current, totalPages) {
        if (totalPages <= 1) {
            paginationEl.innerHTML = '';
            paginationEl.hidden = true;
            return;
        }

        var prev = current > 1 ? '?page=' + (current - 1) + '#all-guides' : null;
        var next = current < totalPages ? '?page=' + (current + 1) + '#all-guides' : null;
        var pageList = buildPageList(totalPages, current);

        var parts = [];
        var navLabel = 'Guides list pagination, page ' + current + ' of ' + totalPages;
        parts.push(
            '<div class="news-hub__pagination-row" role="navigation" aria-label="' +
                escapeHtml(navLabel) +
                '">'
        );
        if (prev) {
            parts.push('<a class="news-hub__nav-btn" href="' + prev + '">Previous</a>');
        } else {
            parts.push('<span class="news-hub__nav-btn news-hub__nav-btn--disabled" aria-disabled="true">Previous</span>');
        }

        for (var k = 0; k < pageList.length; k++) {
            var item = pageList[k];
            if (item === null) {
                parts.push('<span class="news-hub__page-gap" aria-hidden="true">&hellip;</span>');
                continue;
            }
            var hrefPage = '?page=' + item + '#all-guides';
            if (item === current) {
                parts.push('<span class="news-hub__page-num news-hub__page-num--current" aria-current="page">' + item + '</span>');
            } else {
                parts.push('<a class="news-hub__page-num" href="' + hrefPage + '">' + item + '</a>');
            }
        }

        if (next) {
            parts.push('<a class="news-hub__nav-btn" href="' + next + '">Next</a>');
        } else {
            parts.push('<span class="news-hub__nav-btn news-hub__nav-btn--disabled" aria-disabled="true">Next</span>');
        }
        parts.push('</div>');

        paginationEl.innerHTML = parts.join('');
        paginationEl.hidden = false;
    }

    function clampPage(page, totalPages) {
        if (page > totalPages) return totalPages;
        if (page < 1) return 1;
        return page;
    }

    /** After the grid fills, scroll to #all-guides so position is correct (browser often scrolls too early). */
    function scrollToAllGuidesSection() {
        var h = window.location.hash;
        var pageNum = parseInt(new URLSearchParams(window.location.search).get('page') || '1', 10);
        if (h !== '#all-guides' && pageNum <= 1) return;
        var section = document.getElementById('all-guides');
        if (!section) return;
        var instant = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        function run() {
            section.scrollIntoView({ behavior: instant ? 'auto' : 'smooth', block: 'start' });
        }
        requestAnimationFrame(function () {
            requestAnimationFrame(run);
        });
    }

    fetch(DATA_URL)
        .then(function (r) {
            if (!r.ok) throw new Error('fetch');
            return r.json();
        })
        .then(function (data) {
            if (!Array.isArray(data)) throw new Error('data');
            var sorted = sortPosts(data);
            var total = sorted.length;
            var totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
            var rawPage = parsePage();
            var page = clampPage(rawPage, totalPages);
            if (rawPage !== page && totalPages > 0) {
                try {
                    var u = new URL(window.location.href);
                    u.searchParams.set('page', String(page));
                    u.hash = 'all-guides';
                    window.history.replaceState({}, '', u.pathname + u.search + u.hash);
                } catch (e) {
                    window.history.replaceState({}, '', '?page=' + page + '#all-guides');
                }
            }

            if (countEl) {
                countEl.textContent =
                    total === 1
                        ? '1 guide — payments, slots, sports, bonuses and responsible play'
                        : total + ' guides — payments, slots, sports, bonuses and responsible play';
            }

            var slice = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
            grid.classList.toggle('news-hub__grid--single', total === 1);
            grid.innerHTML = slice.map(renderCard).join('');
            if (errEl) errEl.hidden = true;
            renderPagination(page, totalPages);
            scrollToAllGuidesSection();
        })
        .catch(function () {
            grid.innerHTML = '';
            grid.classList.remove('news-hub__grid--single');
            paginationEl.hidden = true;
            if (countEl) countEl.textContent = 'Guides unavailable right now';
            if (errEl) {
                errEl.hidden = false;
            }
        });
});

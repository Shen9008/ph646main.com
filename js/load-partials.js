/**
 * PH646 (ph646main.com) — load header, footer, CTA banner.
 * Run before main.js. Sets active nav from body[data-page].
 * Handles both root and news/ subfolder (base path).
 */
(function () {
    'use strict';

    var pathname = (window.location.pathname || '').replace(/\/$/, '') || '/';
    var segments = pathname.split('/').filter(Boolean).filter(function (s) { return s !== 'index.html'; });
    var depth = segments.length;
    var base = depth > 0 ? Array(depth + 1).join('../') : '';
    var isNews = pathname.indexOf('news') !== -1;

    function rewriteLinks(html) {
        if (base) html = html.replace(/\ssrc="images\//g, ' src="' + base + 'images/');
        return html;
    }

    function setActiveNav() {
        var page = document.body.getAttribute('data-page') || '';
        if (!page) return;
        document.querySelectorAll('.nav__link[data-nav="' + page + '"], .mobile-menu__link[data-nav="' + page + '"], .sidebar__link[data-nav="' + page + '"]').forEach(function (el) {
            el.classList.add('nav__link--active', 'mobile-menu__link--active', 'sidebar__link--active');
        });
        var toggle = document.querySelector('.sidebar-toggle');
        var sidebar = document.querySelector('.sidebar');
        if (toggle && sidebar) {
            toggle.addEventListener('click', function () {
                sidebar.classList.toggle('open');
            });
        }
    }

    function injectSvgSprite() {
        var frag = document.createDocumentFragment();
        var first = document.body.firstChild;
        var wrap = document.createElement('div');
        wrap.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;" aria-hidden="true"><defs>' +
            '<symbol id="icon-lock" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></symbol>' +
            '<symbol id="icon-lightning" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></symbol>' +
            '<symbol id="icon-gamepad" viewBox="0 0 24 24" fill="currentColor"><path d="M21.58 16.09l-1.09-7.66A3.996 3.996 0 0 0 16.53 5H7.47C5.48 5 3.79 6.46 3.51 8.43l-1.09 7.66C2.2 17.63 3.39 19 4.94 19c.68 0 1.32-.27 1.8-.75L9 15h6l2.25 3.25c.48.48 1.13.75 1.8.75 1.55 0 2.74-1.37 2.49-2.91zM11 11H9v2H8v-2H6v-1h2V8h1v2h2v1zm4-1c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2 3c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></symbol>' +
            '<symbol id="icon-chat" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></symbol>' +
            '<symbol id="icon-football" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></symbol>' +
            '<symbol id="icon-basketball" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 2.05c.32-.04.65-.05 1-.05.35 0 .68.01 1 .05v3.03c-.33-.02-.66-.03-1-.03s-.67.01-1 .03V4.05zM6.25 7.09c.66.5 1.25 1.1 1.72 1.77.18.26.34.53.48.81-.58.27-1.12.6-1.63.98-.92-.92-1.57-1.57-1.57-1.57zM5 12c0-.55.05-1.09.14-1.62.09.58.22 1.14.4 1.67.36.05.73.08 1.11.08.38 0 .75-.03 1.11-.08.18-.53.31-1.09.4-1.67-.09.53-.14 1.07-.14 1.62 0 .55.05 1.09.14 1.62-.09-.58-.22-1.14-.4-1.67-.36-.05-.73-.08-1.11-.08-.38 0-.75.03-1.11.08-.18.53-.31 1.09-.4 1.67.09-.53.14-1.07.14-1.62zM12 22c-.35 0-.68-.01-1-.05v-3.03c.33.02.66.03 1 .03s.67-.01 1-.03V21.95c-.32.04-.65.05-1 .05zm0-5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm4.25-9.91c-.92.92-1.57 1.57-1.57 1.57-.51-.38-1.05-.71-1.63-.98.14-.28.3-.55.48-.81.47-.67 1.06-1.27 1.72-1.77zM17.75 10h-3.5c-.28 0-.5.22-.5.5s.22.5.5.5h3.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5zm.25 4.5c-.28 0-.5.22-.5.5v.5h-3.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h3.5z"/></symbol>' +
            '<symbol id="icon-tennis" viewBox="0 0 24 24" fill="currentColor"><path d="M19.5 14c-.28 0-.5.22-.5.5 0 .83-.67 1.5-1.5 1.5-.28 0-.5.22-.5.5s.22.5.5.5c1.38 0 2.5-1.12 2.5-2.5 0-.28-.22-.5-.5-.5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 2c.55 0 1 .45 1 1v.5c1.84.47 3.25 2.02 3.68 3.87.12.52.62.88 1.16.88.12 0 .24-.02.35-.05.7-.24 1.22-.9 1.33-1.64.12-.85-.2-1.69-.86-2.27C16.12 6.94 14.18 6 12 6c-.55 0-1-.45-1-1s.45-1 1-1zm0 4c2.76 0 5 2.24 5 5 0 2.76-2.24 5-5 5s-5-2.24-5-5 2.24-5 5-5z"/></symbol>' +
            '<symbol id="icon-cricket" viewBox="0 0 24 24" fill="currentColor"><path d="M15.04 9.29l-1-.57 2.75-4.64c.39-.66-.09-1.22-.79-1.22-.26 0-.52.1-.72.3L2.79 15.46c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l9.59-9.59 1.25 2.25-2.75 4.64 1 .57 2.75-4.64 1 .57 2.76-4.65c.39-.66-.09-1.22-.79-1.22-.26 0-.52.1-.72.3L5.5 18.46c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l8.59-8.59-1.25-2.25-2.75 4.64-1-.57z"/></symbol>' +
            '<symbol id="icon-chart" viewBox="0 0 24 24" fill="currentColor"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.07-4-4L2 16.99z"/></symbol>' +
            '<symbol id="icon-money" viewBox="0 0 24 24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></symbol>' +
            '<symbol id="icon-menu" viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></symbol>' +
            '<symbol id="icon-close" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></symbol>' +
            '<symbol id="icon-rtp" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></symbol>' +
            '<symbol id="icon-trophy" viewBox="0 0 24 24" fill="currentColor"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/></symbol>' +
            '</defs></svg>';
        wrap.querySelector('svg').setAttribute('id', 'svg-sprite');
        document.body.insertBefore(wrap.firstChild, document.body.firstChild);
    }

    function run() {
        injectSvgSprite();
        Promise.all([
            fetch(base + 'partials/header.html').then(function (r) { return r.text(); }),
            fetch(base + 'partials/footer.html').then(function (r) { return r.text(); }),
            fetch(base + 'partials/cta-banner.html').then(function (r) { return r.text(); })
        ]).then(function (parts) {
            var headerHtml = rewriteLinks(parts[0]);
            var footerHtml = rewriteLinks(parts[1]);
            var bannerHtml = rewriteLinks(parts[2]);
            var headerPlaceholder = document.getElementById('partial-header');
            var footerPlaceholder = document.getElementById('partial-footer');
            if (headerPlaceholder) {
                var temp = document.createElement('div');
                temp.innerHTML = headerHtml;
                var parent = headerPlaceholder.parentNode;
                while (temp.firstChild) {
                    parent.insertBefore(temp.firstChild, headerPlaceholder);
                }
                headerPlaceholder.remove();
            }
            if (footerPlaceholder) {
                footerPlaceholder.outerHTML = footerHtml;
            }
            var main = document.getElementById('main-content') || document.querySelector('main.content-page');
            if (main) {
                var insertAfter = main.querySelector('section') || main.querySelector('.container') || main.firstElementChild;
                if (insertAfter) {
                    insertAfter.insertAdjacentHTML('afterend', bannerHtml);
                }
            }
            setActiveNav();
            var toggle = document.querySelector('.mobile-menu-toggle');
            var menu = document.querySelector('.mobile-menu');
            if (toggle && menu) {
                var iconMenu = base + 'js/icon-menu.svg';
                toggle.addEventListener('click', function () {
                    menu.classList.toggle('active');
                    var icon = toggle.querySelector('use');
                    if (icon) icon.setAttribute('href', menu.classList.contains('active') ? '#icon-close' : '#icon-menu');
                });
            }
        }).catch(function () {
            setActiveNav();
        });

        var sidebarPlaceholder = document.getElementById('partial-sidebar');
        if (sidebarPlaceholder) {
            fetch(base + 'partials/sidebar.html').then(function (r) { return r.text(); }).then(function (html) {
                sidebarPlaceholder.outerHTML = rewriteLinks(html);
            }).catch(function () {});
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }
})();

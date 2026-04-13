# Google Search Console – PH646 (PH646)

Use this guide so Google can crawl and index the **whole** PH646 site (PH646aus.net or PH646.pages.dev).

---

## 1. Add property in Search Console

1. Go to [Google Search Console](https://search.google.com/search-console).
2. **Add property** → choose **URL prefix**.
3. Enter your live URL, e.g.:
   - **https://PH646aus.net** (if custom domain is set), or  
   - **https://PH646.pages.dev** (Cloudflare Pages default).
4. Use the **exact** URL users see (with or without `www`). Do **not** mix `http` and `https` or different domains in one property.

---

## 2. Verify ownership

Pick one method and complete it.

### Option A: HTML tag (recommended)

1. In GSC, choose **HTML tag**.
2. Copy the meta tag, e.g.  
   `<meta name="google-site-verification" content="XXXXXXXX" />`
3. Add it in the `<head>` of **index.html** (once), right after the existing `<meta name="googlebot" ...>`.
4. Deploy the site.
5. In GSC, click **Verify**.

### Option B: DNS (for custom domain)

1. In GSC, choose **Domain name** or **DNS**.
2. Add the TXT record they give you at your domain DNS (e.g. Cloudflare DNS).
3. Wait for DNS to propagate, then click **Verify**.

### Option C: Google Analytics / GTM

If the site already uses GA4 or GTM linked to the same Google account, you may be able to verify via that method in GSC.

---

## 3. Submit sitemap (so the whole site is discovered)

1. In the left menu: **Sitemaps**.
2. Under **Add a new sitemap** enter:  
   **sitemap.xml**
3. Click **Submit**.

Full URL will be: **https://PH646aus.net/sitemap.xml** (or your live domain).  
All indexable pages (homepage, slots, live casino, news, etc.) are listed there so Google can crawl the entire site.

---

## 4. Request indexing for key URLs (optional but useful)

1. Left menu: **URL Inspection**.
2. Enter a URL, e.g. **https://PH646aus.net/** or **https://PH646aus.net/news/**.
3. Click **Request indexing** (after the URL is checked).

Do this for:

- Homepage
- **https://PH646aus.net/news/** (news index – helps discovery of all articles)
- **https://PH646aus.net/slots.html**
- A few important news articles if you want them indexed quickly

You don’t need to request every URL; once the sitemap is submitted, Google will crawl the rest over time.

---

## 5. Confirm the site is crawlable

- **robots.txt**:  
  **https://PH646aus.net/robots.txt** (or your live URL)  
  Should show `Allow: /` and `Sitemap: https://PH646aus.net/sitemap.xml`. Only `/admin/`, `/private/`, `/api/` are disallowed.
- **Sitemap**:  
  Open **https://PH646aus.net/sitemap.xml** in a browser and confirm it lists all main and news URLs.
- In GSC: **Coverage** / **Pages** – after some days you should see discovered and indexed counts for the whole site.

---

## 6. SEO checklist (already in place on this site)

- **Canonical URLs**: Every page has a `link rel="canonical"` to its final URL.
- **Meta robots**: Key pages use `index, follow`; news/articles use `index, follow`.
- **Sitemap**: All main and news pages are in **sitemap.xml**.
- **Structured data**: Homepage has WebSite + Organization; news articles have Article schema.
- **Sitemap link in HTML**: Homepage has `<link rel="sitemap" href="https://PH646aus.net/sitemap.xml">` for crawler discovery.

---

## 7. After verification

- **Sitemaps**: Check for errors; fix any reported invalid URLs.
- **Coverage**: Monitor “Valid” and “Indexed”;
- **Enhancements**: Check for any Breadcrumb or other suggestions.
- Re-submit **sitemap.xml** after adding new sections or many new pages so the whole site stays discoverable.

Using **URL prefix** and submitting **sitemap.xml** ensures Google Search Console is set up to crawl the **whole** PH646 website.

# Add ph646main.com to Cloudflare Pages

Your site is deployed at **https://PH646australia.pages.dev**. To use **ph646main.com**:

## Step 1: Add the domain to Cloudflare (if not already)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **Add a site**
3. Enter **ph646main.com** (or your root domain if different)
4. Follow the prompts to add the domain and update nameservers at your registrar

> **Note:** If ph646main.com is already in your Cloudflare account, skip to Step 2.

## Step 2: Add custom domain to your Pages project

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages**
2. Click your **PH646australia** project
3. Open the **Custom domains** tab
4. Click **Set up a custom domain**
5. Enter **ph646main.com**
6. Click **Continue**

## Step 3: DNS configuration

- **If the domain is on Cloudflare:** DNS is configured automatically (CNAME to `PH646australia.pages.dev`)
- **If the domain is elsewhere:** Add a CNAME record:
  - **Name:** `@` (or `www` for www.ph646main.com)
  - **Target:** `PH646australia.pages.dev`
  - **Proxy status:** Proxied (orange cloud)

## Step 4: SSL

Cloudflare will issue an SSL certificate automatically. This can take a few minutes.

---

**Your live URLs:**
- Pages default: https://PH646australia.pages.dev
- Custom domain (after setup): https://ph646main.com

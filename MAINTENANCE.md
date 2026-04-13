# PH646 Philippines – Maintenance Guide

## Modular Structure

### Easy-to-Update Components

| Component | Location | How to Update |
|-----------|----------|---------------|
| **CTA Banner** | `partials/cta-banner.html` | Edit title, subtitle and CTA button directly in HTML |
| **Banner Config** | `config/banners.json` | Edit JSON for page-specific banner content (Slots, Live, Sports, Main) |
| **Popular Games** | `partials/popular-games.html` | Edit game cards for site-wide consistency |
| **Sports Predictions** | `partials/sports-predictions.html` | Edit leagues, matches and odds |
| **Top Jackpots** | `partials/top-jackpots.html` | Edit jackpot amounts and game names |
| **Header / Footer** | `partials/header.html`, `partials/footer.html` | Update nav links and footer content |

### Page Layouts

- **Home**: Hero → Stats → Hot Games → RTP → Live Casino → Sports Predictions → Why Choose → SEO Guide → News
- **Slots**: Hero → Intro → Hot Games → RTP → Megaways → Jackpots → SEO Guide → New Releases → Providers
- **Live Casino**: Hero → Intro → Live Blackjack → Live Roulette → Baccarat → Game Shows → SEO
- **Sports Betting**: Hero → Intro → Stats → League Predictions → Featured Matches → SEO
- **Promotions**: Hero → Intro → Welcome Bonuses → Ongoing → VIP → Games → Sports → Jackpots → SEO
- **About Us / Responsible Gambling / Help Center**: Hero → Content → Games → Sports → Jackpots
- **Blog**: Hero → Intro → Featured → Latest → Slot Reviews → Guides

### SEO

- Each page has unique `<title>`, `<meta name="description">`, `<meta name="keywords">` and canonical URL
- Schema.org structured data on key pages
- 1200+ words of SEO-optimised content per page
- PH646, PH646 Philippines and related keywords used naturally throughout

### Adding a New Page

1. Create the HTML file with `data-page="page-name"` on `<body>`
2. Add to `partials/header.html` and `partials/footer.html` nav
3. Add to `rootPages` in `js/load-partials.js` (for news subfolder link rewriting)
4. Optionally add a banner preset in `config/banners.json`

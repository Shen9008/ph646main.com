# Deploy PH646 to Cloudflare Pages

## Prerequisites

- Node.js (for `npx wrangler`)
- Cloudflare account and an **API token** with these permissions:
  - **Account** → **Cloudflare Pages** → **Edit**
  - (If you get “Authentication error” on deploy, also add **Account** → **Account Settings** → **Read**)

Create or edit the token at: [Cloudflare Dashboard → My Profile → API Tokens](https://dash.cloudflare.com/profile/api-tokens). Use **Create Token** → **Custom token** and add the permissions above.

## One-time: Create the Pages project (if needed)

If the project `PH646` does not exist yet:

```bash
npx wrangler pages project create PH646
```

You'll be prompted to log in via browser, or set `CLOUDFLARE_API_TOKEN` (see below).

## Deploy

**Never put your API token in a file that gets committed.** Use an environment variable.

### Option 1: Environment variable (recommended)

**Windows (PowerShell):**
```powershell
$env:CLOUDFLARE_API_TOKEN = "your-api-token-here"
npx wrangler pages deploy . --project-name=PH646
```

**Windows (Command Prompt):**
```cmd
set CLOUDFLARE_API_TOKEN=your-api-token-here
npx wrangler pages deploy . --project-name=PH646
```

**macOS / Linux:**
```bash
export CLOUDFLARE_API_TOKEN=your-api-token-here
npx wrangler pages deploy . --project-name=PH646
```

### Option 2: Interactive login

```bash
npx wrangler login
npx wrangler pages deploy . --project-name=PH646
```

## After deploy

- Site URL: **https://PH646.pages.dev** (or your custom domain if configured)
- To add a custom domain: Cloudflare Dashboard → Pages → PH646 → Custom domains

## Security

- Create API tokens at: [Cloudflare Dashboard → My Profile → API Tokens](https://dash.cloudflare.com/profile/api-tokens)
- Use a token with **Account** → **Cloudflare Pages** → **Edit**
- **Never commit tokens to the repo or share them in chat.** If a token is ever exposed, revoke it in the dashboard and create a new one.

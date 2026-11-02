# Law Edge Solutions — Static Site

Tier 1 exact-replica static copy of https://www.lawedgesolutions.com (8 pages).

- `static_site/` — the site (HTML, CSS, JS, images)
- `wrangler.jsonc` — Cloudflare Worker config that serves `static_site/` as static assets

## Local preview

    cd static_site && python3 -m http.server 4325

## Deploy to Cloudflare

    npx wrangler login
    npx wrangler deploy

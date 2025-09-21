# Deploying prism to Vercel

This repository serves a static frontend from the `public/` folder and includes client-side code that expects a WebSocket backend at `/wisp/` and several static asset mounts (`/uv/`, `/baremux/`, `/epoxy/`). Vercel can host the static frontend easily, but Vercel's Serverless Functions do not support long-lived WebSocket connections. See options below.

Quick steps
- Create a Vercel account (https://vercel.com) and install the Vercel CLI if you like.
- From the project root, run `vercel` and follow the prompts, or connect the GitHub repo in the Vercel dashboard.
- Vercel will use `vercel.json` and the `public/` folder to serve static assets.

What we added
- `vercel.json` — configures a static-build that serves the `public/` folder as the site root. It also includes a route for `/wisp/` which is intentionally routed to a placeholder path; Vercel cannot host persistent WebSocket servers.
- `package.json` — added a `vercel-build` script (no-op) so Vercel has a build script to call.

WebSocket/backend options
1) External WebSocket host (recommended)
   - Run the `index.js` server (or an adapted version) on a provider that supports WebSockets: Fly, Render, Railway, DigitalOcean App Platform, or a small VPS.
   - Point your client to that host's WebSocket URL. Example: change the client code that builds `wispUrl` to use an environment-hosted domain instead of `location.host`.

2) Use a dedicated WebSocket service
   - Use a managed realtime provider (Pusher, Ably, Supabase Realtime) and adapt the client to use that transport.

3) WebSocket tunnel/proxy
   - Run the WebSocket server elsewhere and put a lightweight edge function on Vercel to rewrite or proxy specific requests (still requires external host for the socket).

Implementation notes / recommended changes
- In `public/index.html` the client determines the wisp url with `location.host`; update to use an env variable injected at build time or fallback to `location.host`.
  Example pattern:
  - Add a small block in `index.html` (or a bundled config) that reads `window.__PRISM__ = { WISP_HOST: '%WISP_HOST%' }` and replace `%WISP_HOST%` during build or via environment replacement.
- Alternatively, host the `index.js` server on an external provider and deploy only the static `public/` on Vercel.

Runtime config (easy, no build step)
- This repo includes `public/prism.config.js` (a sample). You can edit that file (or provide it via your Git repo) to set `window.__PRISM__.WISP_HOST` or `WISP_URL` to point the client at an externally hosted websocket server.
- On Vercel you can also upload this file at deploy time or commit a version that contains your production WebSocket endpoint.

Next steps (if you want me to continue)
- I can scaffold a small environment-variable based client config so you can point to an external WebSocket host easily.
- I can create a tiny serverless fallback that returns a friendly 501/404 for `/wisp/` requests with guidance.

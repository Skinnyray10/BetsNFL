# Bets — agent security guardrails

This repo is an NFL data board. The RapidAPI key is a secret. The browser must never see it.

## Non-negotiable

| Rule | Do this |
|------|---------|
| Secrets stay server-side | `RAPIDAPI_KEY` and `CLAUDE_API_KEY` / `ANTHROPIC_API_KEY` live only in env and are read only in `apps/api`. |
| No key in the client | Never call RapidAPI or Anthropic from Svelte. The web app talks only to `apps/api`. |
| No secrets in git | Never commit `.env`, keys, tokens, or screenshots that show them. Keep `.gitignore` covering `.env` / `.env.*`. |
| No secret in code or docs | Do not hardcode keys in source, README, comments, tests, or this file. Use `.env.example` with empty values. |
| Allowlisted upstream only | Call RapidAPI only through the fixed paths in `apps/api`. Do not add a catch-all proxy, user-supplied URL, or user-supplied host. |

If a key leaked (chat, screenshot, commit, CI log): rotate it in RapidAPI, purge it from git history if it was committed, and stop using the old value.

## Env split

| Variable | Where | Public? |
|----------|--------|---------|
| `RAPIDAPI_KEY` | `apps/api` only | No |
| `RAPIDAPI_HOST` | `apps/api` only | No |
| `CLAUDE_API_KEY` / `ANTHROPIC_API_KEY` | `apps/api` only | No |
| `CLAUDE_MODEL` | `apps/api` | No (config) |
| `CORS_ORIGIN` | `apps/api` | No (config, not a secret) |
| `PORT` | server | No |
| `PUBLIC_API_URL` | `apps/web` via `src/env.ts` (`public: true`) | Yes — API origin only, never a key |

New env vars that must not reach the browser stay **private** in `apps/web/src/env.ts` (omit `public: true`) or stay out of the web app entirely.

`PUBLIC_API_URL` must be an origin we control (`http://localhost:3001` or the deployed API). Never point it at RapidAPI.

## API (`apps/api`)

- Keep CORS origin-explicit. Do not use `*` if credentials or a deployed front exist. Default local origin: `http://localhost:5173`.
- Methods: GET/OPTIONS for current read-only routes. Do not add mutating RapidAPI calls without an explicit product decision.
- Validate path params (`id`) as a tight charset (digits / short alphanumeric). Reject anything that looks like a URL, path traversal, or header injection.
- Do not forward raw RapidAPI error bodies, headers, or request URLs to the client if they could include the key or upstream internals. Return a short `error` string and a status.
- Do not log `RAPIDAPI_KEY`, `x-rapidapi-key`, or full upstream URLs that embed secrets.
- Keep the in-memory cache. Do not add unbounded loops or scrapers against RapidAPI (quota + ToS).
- `rapidGet` must keep host + path under our control. Query values are data, not locations: never let `id` become a hostname or path.

## Web (`apps/web`)

- Fetch only `/api/...` on our API (`PUBLIC_API_URL`). No `x-rapidapi-key` in `fetch` headers.
- Treat API JSON as untrusted: render strings as text, do not inject HTML from RapidAPI fields.
- Keep `adapter-node` / `adapter-vercel` as-is for deploy; do not bake secrets into the client bundle.

## Git, CI, deploy

- Copy `.env.example` → `.env` locally. Production keys go in the host's secret store (Render / Vercel), not in `render.yaml` values committed to git (`sync: false` for secrets).
- Do not print env dumps in CI.
- Do not weaken `.gitignore` to commit env files "just for local testing".

## Out of scope unless asked

This app displays NFL data. Do not add payments, user auth, stored PII, or live wager placement without a dedicated security review.

## Checklist before merging

- [ ] `RAPIDAPI_KEY` / `CLAUDE_API_KEY` are not in the diff, client code, or logs
- [ ] Web still has no RapidAPI host/key
- [ ] New API routes use a fixed RapidAPI path (not a user URL)
- [ ] Path params are validated
- [ ] CORS still lists known origins
- [ ] Error responses do not echo upstream secrets

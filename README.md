# Bets

NFL board as a pnpm monorepo: a Node API that uses ESPN's public API, and a SvelteKit + Tailwind UI.

```
apps/api        Hono server (ESPN public API)
apps/web        SvelteKit UI
packages/shared Shared TypeScript types
```

## Local setup

1. Copy `.env.example` to `.env` and set `CLAUDE_API_KEY` (required for predictions).
2. Install and run both apps:

```bash
pnpm install
pnpm dev
```

- Web: http://localhost:5173
- API: http://localhost:3001/health

Do not commit `.env`. If a Claude key was pasted in a screenshot or chat, rotate it.

Forecasts: `GET /api/predictions` sends ESPN scoreboard + team facts to Claude on the server. The browser never receives `CLAUDE_API_KEY`.

## Prediction System with Bankroll Management

The prediction system integrates responsible betting guidance from `promptbot.md`:

### Bankroll Rules
- **Stake**: Recommended stake on 1-10 scale (defaults to 1-3 for uncertain predictions)
- **Min Odds**: Minimum acceptable decimal odds for positive expected value
- **Value**: Explanation of the edge over implied probability
- **Warning**: Always includes responsible gambling disclaimer

### Key Features
- Stakes calculated based on confidence, win probability, and odds
- Automatic validation against bankroll percentage limits (max 5% per bet)
- Data quality assessment (injuries, records, head-to-head, recent form)
- Responsible gambling warnings for high stakes or low confidence predictions

### Fallback System
When the Claude API is unavailable (insufficient funds, 402/429 errors), the system automatically falls back to a heuristic prediction engine based on `promptbot.md`:

- **Detection**: Automatically detects Claude API errors (insufficient funds, quota exceeded, 402, 429)
- **Heuristics**: Uses team records, injuries, and recent performance to generate predictions
- **Transparency**: Fallback predictions are marked with `[FALLBACK - Sistema local]` in rationale
- **Bankroll Rules**: Fallback predictions still apply all bankroll management rules
- **API Response**: Includes `fallback: true` flag when using fallback system

The fallback system ensures the app continues to work even when Claude credits run out.

### Prediction Response Fields
```typescript
{
  gameId: string;
  kind: 'forecast' | 'result_analysis';
  winnerId: string;
  winnerName: string;
  awayScore: number;
  homeScore: number;
  awayWinProb: number;
  homeWinProb: number;
  spreadHome: number;
  total: number;
  confidence: number;
  keyFactors: string[];
  rationale: string;
  stake: number;          // 1-10 scale
  minOdds: number;        // Minimum acceptable odds
  value: string;          // Value explanation
  warning: string;       // Responsible gambling warning
}
```

## Deploy

### Vercel (web)

Create a project with **Root Directory** `apps/web`.

Environment variable:

- `PUBLIC_API_URL` — public URL of the API (Render service below)

### Render (API, and optionally web)

This repo includes `render.yaml`:

- `bets-api` — Node service, `pnpm --filter @bets/api start`
- `bets-web` — Node service, `pnpm --filter @bets/web start`

Set `CLAUDE_API_KEY` and `CORS_ORIGIN` (your Vercel or Render web origin) on the API. Set `PUBLIC_API_URL` on the web service to the API URL.

The web app uses `@sveltejs/adapter-vercel` when `VERCEL` is set, otherwise `@sveltejs/adapter-node` so Render can run `node build`.

## API routes

| Route | ESPN source |
| --- | --- |
| `GET /api/teams` | `/teams` |
| `GET /api/teams/:id` | `/teams/:id` |
| `GET /api/teams/:id/players` | `/teams/:id/roster` |
| `GET /api/games` | `/scoreboard` |
| `GET /api/games/:id` | `/scoreboard` (filtered by id) |
| `GET /api/season` | `/scoreboard` (includes season info) |
| `GET /api/predictions` | Scoreboard + team facts → Claude (with bankroll rules) |
| `GET /api/games/:id/prediction` | One game + team facts → Claude (with bankroll rules) |

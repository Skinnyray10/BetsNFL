# Bets

NFL board as a pnpm monorepo: a Node API that proxies [RapidAPI NFL Football API](https://rapidapi.com/Creativesdev/api/nfl-football-api), and a SvelteKit + Tailwind UI.

```
apps/api        Hono server (RapidAPI key stays here)
apps/web        SvelteKit UI
packages/shared Shared TypeScript types
```

## Local setup

1. Copy `.env.example` to `.env` and set `RAPIDAPI_KEY`.
2. Install and run both apps:

```bash
pnpm install
pnpm dev
```

- Web: http://localhost:5173
- API: http://localhost:3001/health

Do not commit `.env`. If a RapidAPI or Claude key was pasted in a screenshot or chat, rotate it.

Forecasts: `GET /api/predictions` sends RapidAPI scoreboard + team facts to Claude on the server. The browser never receives `CLAUDE_API_KEY`.

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

Set `RAPIDAPI_KEY` and `CORS_ORIGIN` (your Vercel or Render web origin) on the API. Set `PUBLIC_API_URL` on the web service to the API URL.

The web app uses `@sveltejs/adapter-vercel` when `VERCEL` is set, otherwise `@sveltejs/adapter-node` so Render can run `node build`.

## API routes

| Route | RapidAPI source |
| --- | --- |
| `GET /api/teams` | `/nfl-team-list` |
| `GET /api/teams/:id` | `/nfl-team-info?id=` |
| `GET /api/teams/:id/players` | `/nfl-team-roster?id=` |
| `GET /api/games` | `/nfl-scoreboard` |
| `GET /api/games/:id` | `/nfl-boxscore?id=` |
| `GET /api/season` | `/nfl-season` |
| `GET /api/predictions` | Scoreboard + team facts → Claude (with bankroll rules) |
| `GET /api/games/:id/prediction` | One game + team facts → Claude (with bankroll rules) |

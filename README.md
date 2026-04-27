# Axiom Studio (axiomstudio.dev)

> 🔒 **Patent Pending** — DarkWave Studios LLC
>
> - U.S. Pat. App. No. **64/032,339** — Lume‑V: Deterministic Autonomous Infrastructure Governance Engine
> - U.S. Pat. App. No. **64/047,512** — Lume Core: Deterministic Natural‑Language Programming Language
> - U.S. Pat. App. No. **64/047,467** — Axiom: Deterministic Zero‑Assumption AI System
> - U.S. Pat. App. No. **64/047,496** — Lume‑X: Deterministic Multi‑Agent Cognition Substrate
> - U.S. Pat. App. No. **64/047,536** — Synthetic Organisms: Deterministic Self‑Governing Constructs

Multi-agent AI development environment with intelligent auto-routing. Part of the DarkWave Studios Trust Layer ecosystem.

**Live:** [axiomstudio.dev](https://axiomstudio.dev)

---

## Architecture

```
axiom-studio/
├── server/                  # Express + TypeScript backend
│   ├── index.ts             # Server entrypoint
│   ├── agent-routes.ts      # Multi-agent chat API (auto-routing)
│   ├── stripe-routes.ts     # Stripe billing integration
│   ├── coinbase-routes.ts   # Coinbase Commerce (crypto payments)
│   ├── analytics-routes.ts  # Usage analytics
│   ├── workspace-routes.ts  # Workspace filesystem API
│   ├── notification-routes.ts # Push notifications
│   ├── tiers.ts             # Subscription tier definitions
│   └── db.ts                # PostgreSQL (Drizzle ORM)
├── client/                  # React 19 + Vite SPA
│   ├── src/components/      # UI components (Chat, Footer, Billing)
│   └── src/pages/           # Page routes
└── shared/                  # Shared schema
```

## Auto-Routing

Axiom Studio intelligently routes messages to the best AI model based on complexity:

| Tier | Models Available | Messages/Month |
|---|---|---|
| Free | Mini only | 30 |
| Developer | Sonnet + Mini | 300 |
| Professional | Opus + Sonnet + Mini | 1,000 |
| Business | All + Priority | 3,000 |
| Enterprise | All + Unlimited | ∞ |

## Payments

- **Stripe** — Card payments for subscriptions
- **Coinbase Commerce** — Crypto payments (coming soon)

## Development

```bash
npm install
npm run dev        # Starts Express + Vite dev server on :5101
npm run db:push    # Push Drizzle schema to PostgreSQL
```

### Required Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Auth token signing |
| `ANTHROPIC_API_KEY` | Claude API access |
| `OPENAI_API_KEY` | GPT/Mini API access |
| `STRIPE_SECRET_KEY` | Payment processing |
| `COINBASE_COMMERCE_API_KEY` | Crypto payments |

## Deployment

Deployed to **Render** (Ohio):

```bash
npm run build
npm run start
```

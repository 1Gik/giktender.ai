# giktender.ai

MVP SaaS for structured Prozorro tender document preparation.

## Implemented MVP modules

- Auth (register/login/logout)
- Company profiles (isolated per user)
- Company documents upload/validity tracking
- Tender workflow:
  - create tender
  - upload source file (PDF storage) or text
  - parse requirements (OpenAI JSON mode if configured, deterministic fallback otherwise)
  - checklist statuses: ✅ AVAILABLE, 🤖 AUTO_GENERATABLE, ⚠ MISSING, ❌ BLOCKED
  - generate structured dovidky/forms from templates
  - export package summary
- Dashboard with companies, recent tenders, and subscription state
- Subscription logic:
  - first tender free
  - next tenders require active subscription
  - usage tracking
- Admin panel:
  - users list
  - manual subscription activation/deactivation
  - usage metrics

## Stack

- Next.js + React + TypeScript + TailwindCSS
- PostgreSQL + Prisma
- JWT auth cookie session
- Local MVP file storage in `/tmp/giktender-uploads` (prepared for S3-compatible replacement)
- OpenAI API (optional, for structured extraction)

## API overview

- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`
- Companies: `GET/POST /api/companies`
- Company documents: `GET/POST /api/companies/:companyId/documents`
- Dashboard: `GET /api/dashboard`
- Tenders:
  - `GET/POST /api/tenders`
  - `POST /api/tenders/:tenderId/source`
  - `POST /api/tenders/:tenderId/parse`
  - `GET /api/tenders/:tenderId/checklist`
  - `POST /api/tenders/:tenderId/generate`
  - `GET /api/tenders/:tenderId/export`
- Generated docs: `GET /api/generated`
- Admin:
  - `GET /api/admin/users`
  - `POST /api/admin/subscriptions`
  - `GET /api/admin/usage`

## Run locally

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate:dev
npm run dev
```

Set in `.env`:

- `DATABASE_URL`
- `JWT_SECRET`
- optional: `OPENAI_API_KEY`, `OPENAI_MODEL`

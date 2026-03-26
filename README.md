
Kosovo Alt Scene

Production-ready archival platform for documenting Kosovo alternative bands (rock, metal, punk, indie, experimental).

## 1) Project folder structure

```text
.
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── admin/page.tsx
│   │   ├── api/
│   │   │   ├── bands/
│   │   │   │   ├── [id]/albums/route.ts
│   │   │   │   ├── [id]/images/route.ts
│   │   │   │   ├── [id]/members/route.ts
│   │   │   │   ├── [id]/route.ts
│   │   │   │   └── route.ts
│   │   │   └── upload/route.ts
│   │   ├── bands/
│   │   │   ├── [slug]/page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── login/page.tsx
│   │   ├── error.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   ├── not-found.tsx
│   │   ├── page.tsx
│   │   ├── robots.ts
│   │   └── sitemap.ts
│   ├── components/
│   │   ├── admin/
│   │   │   ├── admin-dashboard.tsx
│   │   │   └── login-form.tsx
│   │   ├── archive-filters.tsx
│   │   ├── archive-search-bar.tsx
│   │   ├── band-card.tsx
│   │   ├── site-footer.tsx
│   │   └── site-header.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── middleware.ts
│   │   │   └── server.ts
│   │   ├── api-auth.ts
│   │   ├── archive.ts
│   │   ├── env.ts
│   │   ├── prisma.ts
│   │   ├── utils.ts
│   │   └── validators.ts
│   └── middleware.ts
├── .env.example
├── next.config.ts
└── package.json
```

## 2) Installation instructions

```bash
npm install
```

## 3) Environment setup

1. Copy `.env.example` to `.env`.
2. Fill in your Supabase and PostgreSQL values.
3. Ensure these variables are set:
	- `DATABASE_URL`
	- `DIRECT_URL`
	- `NEXT_PUBLIC_SUPABASE_URL`
	- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
	- `SUPABASE_SERVICE_ROLE_KEY`
	- `NEXT_PUBLIC_SITE_URL`
	- `SUPABASE_STORAGE_BUCKET`

## 4) Database setup instructions

```bash
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed
```

Recommended Supabase settings for long-term archival reliability:

- Enable daily automated backups.
- Enable Point-in-Time Recovery if available on your plan.
- Restrict direct writes to service role/API layer only.
- Periodically export snapshots (`pg_dump`) to off-platform cold storage.

## 5) Deployment guide for Vercel

1. Push repository to GitHub.
2. Import project in Vercel.
3. Configure all environment variables from `.env.example` in Vercel Project Settings.
4. Set build command and output:
	- Build command: `npm run build`
	- Install command: `npm install`
5. Run Prisma migrations in CI/CD or pre-deploy workflow:
	- `npx prisma migrate deploy`
6. Add production domain: `kosovoaltscene.com`.

## 6) Full code files

All production files are included in this repository under `src/`, `prisma/`, and root configs.

## Architecture notes

- App Router + server components for fast, SEO-friendly archival pages.
- Prisma as the single database access layer for maintainability.
- Supabase Auth + middleware protects `/admin` routes.
- Route handlers (`/api/*`) centralize validation and write operations.
- Black-and-white design system with high-contrast accessibility.
- Simple, non-overengineered structure intended for multi-year maintenance.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

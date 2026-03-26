# Connect your app to the Supabase database

**You already have a database.** Every Supabase project includes a Postgres database. You only need to connect the app to it and create the tables.

## Step 1: Get the connection strings

1. Open **[Supabase Dashboard](https://supabase.com/dashboard)** and select your project.
2. In the left sidebar, click **Project Settings** (gear icon).
3. Click **Database** in the menu.
4. Scroll to **Connection string**.
5. Choose **URI** and copy:
   - **Transaction** (port 6543) → use for `DATABASE_URL`
   - **Session** or **Direct** (port 5432) → use for `DIRECT_URL`
6. Replace `[YOUR-PASSWORD]` in both strings with your **database password**.
   - If you don’t know it: on the same Database settings page, use **Reset database password**, set a new one, then use that in the connection strings.

## Step 2: Put them in `.env`

Open `.env` in the project root and set:

```env
DATABASE_URL="postgresql://postgres.xxxxx:YOUR_PASSWORD@aws-0-XX.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxxx:YOUR_PASSWORD@aws-0-XX.pooler.supabase.com:5432/postgres"
```

Use the exact URIs you copied from Supabase (they already contain your project id and region).

## Step 3: Create the tables

In the project folder, run:

```bash
npm run db:generate
npm run db:migrate -- --name init
```

Optional: add sample bands:

```bash
npm run db:seed
```

Then restart the dev server (`npm run dev`). After that, “Add band” and the archive will use the database.

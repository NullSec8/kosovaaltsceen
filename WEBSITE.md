# Kosovo Alt Scene — Website Overview

**Kosovo Alt Scene** is a long-term digital archive for Kosovo’s alternative music scene. It documents bands across rock, metal, punk, indie, and experimental music, with a focus on preservation and clarity.

---

## What the website is

- A **public archive** of bands: biography, members, albums, gallery images, and links (YouTube, Spotify, Instagram).
- **Search and filter** by name, city, genre, year, status, and sort by year or name.
- **Theme support**: visitors can change colors (presets or custom) from the footer; the choice is stored in the browser.
- **Cookie consent**: first-time visitors see a banner; they can choose “Necessary only” or “Accept all.” With “Accept all,” the site records a single visit per session (approximate country and IP) to understand where visitors come from. See [Data we collect](#data-we-collect) below.
- **Admin area** for editors: add and edit bands, albums, members, and images; view visit logs (when consent was given). Access is restricted by allowlisted emails and Supabase sign-in.

The project was created by **nullsec8** for the community and for everyone who cares about the scene.

---

## Main pages (public)

| Page | URL | Description |
|------|-----|-------------|
| **Home** | `/` | Hero, search bar, featured bands, recently added, timeline preview. |
| **Archive** | `/bands` | Full list with filters (genre, city, year, status, sort) and pagination. “Random band” link. |
| **Band entry** | `/bands/[slug]` | One band: logo, bio, members, albums, gallery, external links, related bands, share actions. |
| **Random band** | `/bands/random` | Redirects to a random band (or `/bands` if none). |
| **About** | `/about` | Project description and “Data we collect.” |
| **Suggest a band** | `/suggest` | Mailto link to send a band suggestion (no form on the server). |
| **404** | — | Custom not-found page with links to Home, Archive, Random band. |

---

## Admin and auth

| Page | URL | Description |
|------|-----|-------------|
| **Login** | `/login` | Supabase email/password sign-in. |
| **Admin** | `/admin` | Dashboard: add/edit/delete bands, add albums/members/images, upload images to storage. “Logs” link in header. |
| **Logs** | `/admin/logs` | Visit data (when users chose “Accept all”): total, by country, and recent rows with date, country, IP. |

Access to `/admin` and `/admin/logs` requires being signed in and (if configured) having an email in `ADMIN_ALLOWED_EMAILS`.

---

## Data we collect

- **In the browser (no server storage):** theme colors, cookie consent choice.
- **If the user chose “Accept all”:** one visit per session is recorded (approximate country and IP) to see where visitors come from. No other analytics or tracking.
- **Admin:** Supabase stores sign-in (e.g. email and session); we do not store passwords. Band suggestions are sent by email (mailto); we only receive what the user sends.

Details and cookie settings are on the [About](/about) page and in the footer (“Cookie settings” to change your choice).

---

## Tech stack (short)

- **Next.js 16** (App Router), **React 19**, **TypeScript**
- **Tailwind CSS 4** for styling; theme via CSS variables and localStorage
- **Prisma** + **PostgreSQL** (e.g. db.prisma.io) for bands, albums, members, images, visits
- **Supabase** for auth (admin) and optional image upload storage
- **JSON-LD** for Organization (layout) and MusicGroup (band pages)

---

## Running and deploying

- **Install:** `npm install`
- **Env:** copy `.env.example` to `.env` and set `DATABASE_URL`, `DIRECT_URL`, Supabase vars, and optional `ADMIN_ALLOWED_EMAILS`, `NEXT_PUBLIC_SITE_URL`, etc.
- **DB:** `npm run db:generate`, `npm run db:migrate`, `npm run db:seed`
- **Dev:** `npm run dev`
- **Build:** `npm run build` then `npm run start`

For full setup, deployment (e.g. Vercel), and architecture, see the main [README.md](./README.md).

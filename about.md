# Kosovo Alt Scene - About

Kosovo Alt Scene is a long-term digital archive for Kosovos alternative music scene. It documents bands across rock, metal, punk, indie, and experimental music, with a focus on preservation, accuracy, and clarity.

## What the website does

- Public archive of bands with biographies, members, albums, gallery images, and external links (YouTube, Spotify, Instagram).
- Search and filter by name, city, genre, year, status, and sort by name or year.
- Band pages include logo, bio, members, albums, gallery, links, share actions, and related bands.
- Random band page for discovery.
- About page explaining the project and data collection.
- Suggest a band page for community input.

## Public pages

- Home: hero, search, featured bands, recently added, timeline preview.
- Archive (/bands): filters, search, and pagination.
- Band entry (/bands/[slug]): full band profile.
- Random band (/bands/random): redirects to a random band.
- About (/about): mission and data collection details.
- Suggest (/suggest): send band suggestions.

## Admin features

- Secure admin area with Supabase sign-in.
- Add, edit, and delete bands.
- Add albums, members, and images.
- Upload images to storage.
- Visit logs for consented analytics.
- Email allowlist gate for admin access.

## Data collection and privacy

- Theme colors and cookie consent are stored in the browser only.
- If a user chooses Accept all, the site records one visit per session with approximate country and IP.
- No third party analytics or tracking scripts.
- Admin sign-in is handled by Supabase; passwords are never stored by this site.

## Tech stack

- Next.js (App Router), React, TypeScript
- Tailwind CSS with CSS variables for theme
- Prisma + PostgreSQL for bands, albums, members, images, visits
- Supabase for admin auth and optional image storage
- JSON-LD structured data for Organization and MusicGroup

## Purpose

This project exists to preserve Kosovos alternative music history for the long term, keep records accessible, and make the scene easy to explore for locals and outsiders alike.

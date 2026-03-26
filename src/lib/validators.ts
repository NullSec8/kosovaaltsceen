import { z } from "zod";

const sourceEntrySchema = z.object({
  label: z.string().min(1),
  url: z.string().url(),
});

export const bandSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).optional(),
  city: z.string().min(2),
  yearFounded: z.coerce.number().int().min(1960).max(new Date().getFullYear()),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  genres: z.array(z.string().min(2)).min(1),
  biography: z.string().min(20),
  logoUrl: z.string().url().optional().or(z.literal("")),
  youtubeUrl: z.string().url().optional().or(z.literal("")),
  spotifyUrl: z.string().url().optional().or(z.literal("")),
  instagramUrl: z.string().url().optional().or(z.literal("")),
  lastVerifiedAt: z.coerce.date().optional().nullable(),
  archivedUrl: z.string().url().optional().or(z.literal("")),
  sources: z.array(sourceEntrySchema).optional().nullable(),
  labelId: z.string().uuid().optional().nullable().or(z.literal("")),
});

export const labelSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).optional(),
});

export const newsPostSchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2).optional(),
  body: z.string().min(10),
  type: z.enum(["NEW_BAND", "REUNION", "TRIBUTE", "GENERAL"]),
  publishedAt: z.coerce.date().optional(),
});

export const eventSchema = z.object({
  title: z.string().min(2),
  venue: z.string().min(2),
  eventDate: z.coerce.date(),
  description: z.string().optional(),
  lineup: z.string().optional(),
});

export const interviewSchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2).optional(),
  content: z.string().min(10),
  featuredImage: z.string().url(),
  dateCreated: z.coerce.date().optional(),
  bandId: z.string().uuid(),
});

export const albumSchema = z.object({
  title: z.string().min(2),
  type: z.enum(["ALBUM", "EP", "SINGLE"]).optional().default("ALBUM"),
  releaseYear: z.coerce.number().int().min(1960).max(new Date().getFullYear()),
  coverImage: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
});

export const memberSchema = z.object({
  name: z.string().min(2),
  role: z.string().min(2),
  yearsActive: z.string().min(3),
});

export const imageSchema = z.object({
  imageUrl: z.string().url(),
  caption: z.string().optional(),
});

export const bandSuggestionSchema = z.object({
  bandName: z.string().min(2).max(200),
  city: z.string().min(2).max(200),
  genres: z.string().min(2).max(500),
  yearFounded: z.coerce.number().int().min(1960).max(new Date().getFullYear()).optional(),
  links: z.string().max(2000).optional(),
  notes: z.string().max(2000).optional(),
  contributorEmail: z.string().email().max(320).optional().or(z.literal("")),
});

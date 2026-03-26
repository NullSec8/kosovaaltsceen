"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

import { AdminDatePicker } from "@/components/admin/admin-date-time-picker";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type SourceEntry = { label: string; url: string };

type AdminBandEditorAlbum = {
  id: string;
  title: string;
  type: "ALBUM" | "EP" | "SINGLE";
  releaseYear: number;
  coverImage?: string | null;
  description?: string | null;
};

export type AdminBandEditorLabel = { id: string; name: string; slug: string };

export type AdminBandEditorBand = {
  id: string;
  name: string;
  slug: string;
  city: string;
  yearFounded: number;
  status: "ACTIVE" | "INACTIVE";
  genres: string[];
  biography: string;
  logoUrl?: string | null;
  youtubeUrl?: string | null;
  spotifyUrl?: string | null;
  instagramUrl?: string | null;
  lastVerifiedAt?: string | null;
  archivedUrl?: string | null;
  sources?: SourceEntry[] | null;
  labelId?: string | null;
  albums: AdminBandEditorAlbum[];
};

export type AdminBandEditorSummary = {
  id: string;
  name: string;
  slug: string;
};

type AdminBandEditorProps = {
  band: AdminBandEditorBand;
  labels: AdminBandEditorLabel[];
  allBands: AdminBandEditorSummary[];
  availableGenres: string[];
};

function errorPayloadToString(error: unknown): string {
  if (error == null) return "Request failed.";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && "formErrors" in error && "fieldErrors" in error) {
    const flattened = error as { formErrors: string[]; fieldErrors: Record<string, string[]> };
    const parts: string[] = [...flattened.formErrors];
    Object.entries(flattened.fieldErrors).forEach(([field, messages]) => {
      if (messages?.length) parts.push(`${field}: ${messages.join(", ")}`);
    });
    return parts.length ? parts.join(" ") : "Validation failed.";
  }
  if (typeof error === "object" && "message" in error && typeof (error as { message: unknown }).message === "string") {
    return (error as { message: string }).message;
  }
  return "Request failed.";
}

async function parseApiResponse(response: Response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = errorPayloadToString(payload.error);
    const fallback =
      message === "Request failed."
        ? `${response.status === 401 ? "Unauthorized" : response.status === 400 ? "Invalid data" : "Server error"} (${response.status})`
        : message;
    throw new Error(fallback);
  }

  return payload;
}

function isValidUrl(value: string) {
  if (!value.trim()) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function AdminBandEditor({ band, labels, allBands, availableGenres }: AdminBandEditorProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [name, setName] = useState(band.name);
  const [slug, setSlug] = useState(band.slug);
  const [logoUrl, setLogoUrl] = useState(band.logoUrl ?? "");
  const [youtubeUrl, setYoutubeUrl] = useState(band.youtubeUrl ?? "");
  const [spotifyUrl, setSpotifyUrl] = useState(band.spotifyUrl ?? "");
  const [instagramUrl, setInstagramUrl] = useState(band.instagramUrl ?? "");
  const [archivedUrl, setArchivedUrl] = useState(band.archivedUrl ?? "");
  const [selectedGenres, setSelectedGenres] = useState<string[]>(band.genres);
  const formRef = useRef<HTMLFormElement | null>(null);
  const autosaveTimeoutRef = useRef<number | null>(null);
  const lastSavedPayloadRef = useRef<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setMessage(null);
    setError(null);
    setIsDirty(false);
    setIsSaving(false);
    setLastSavedAt(null);
    setName(band.name);
    setSlug(band.slug);
    setLogoUrl(band.logoUrl ?? "");
    setYoutubeUrl(band.youtubeUrl ?? "");
    setSpotifyUrl(band.spotifyUrl ?? "");
    setInstagramUrl(band.instagramUrl ?? "");
    setArchivedUrl(band.archivedUrl ?? "");
    setSelectedGenres(band.genres);
    lastSavedPayloadRef.current = null;
  }, [band.id]);

  function clearNotices() {
    setMessage(null);
    setError(null);
  }

  function buildPayload(formData: FormData) {
    const sourcesText = String(formData.get("sources") ?? "").trim();
    const sources = sourcesText
      ? sourcesText
          .split("\n")
          .map((line) => {
            const parts = line.split("|").map((p) => p.trim());
            if (parts.length >= 2 && parts[0] && parts[1]) return { label: parts[0], url: parts[1] };
            return null;
          })
          .filter((s): s is SourceEntry => s !== null)
      : undefined;
    const lastVerifiedRaw = formData.get("lastVerifiedAt");
    const getUrlOrEmpty = (value: FormDataEntryValue | null) => {
      const str = String(value ?? "").trim();
      return str ? str : "";
    };
    const selected = formData.getAll("genres").map((item) => String(item).trim()).filter(Boolean);
    const fallback = String(formData.get("genres") ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const genres = selected.length > 0 ? selected : fallback;
    const payload = {
      name: formData.get("name"),
      slug: formData.get("slug"),
      city: formData.get("city"),
      yearFounded: formData.get("yearFounded"),
      status: formData.get("status"),
      biography: formData.get("biography"),
      genres,
      logoUrl: getUrlOrEmpty(formData.get("logoUrl")),
      youtubeUrl: getUrlOrEmpty(formData.get("youtubeUrl")),
      spotifyUrl: getUrlOrEmpty(formData.get("spotifyUrl")),
      instagramUrl: getUrlOrEmpty(formData.get("instagramUrl")),
      lastVerifiedAt: lastVerifiedRaw && String(lastVerifiedRaw).trim() ? String(lastVerifiedRaw).trim() : null,
      archivedUrl: getUrlOrEmpty(formData.get("archivedUrl")),
      sources: sources?.length ? sources : null,
      labelId: String(formData.get("labelId") ?? "").trim() || "",
    };

    return payload;
  }

  async function handleUpdateBand(formData: FormData, showMessage = true) {
    clearNotices();
    const payload = buildPayload(formData);
    const payloadSignature = JSON.stringify(payload);

    if (payloadSignature === lastSavedPayloadRef.current) {
      setIsDirty(false);
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch(`/api/bands/${band.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await parseApiResponse(response);
      lastSavedPayloadRef.current = payloadSignature;
      setIsDirty(false);
      setLastSavedAt(new Date().toLocaleTimeString());
      if (showMessage) {
        setMessage("Band updated.");
      }
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not update band.");
    } finally {
      setIsSaving(false);
    }
  }

  function scheduleAutosave() {
    setIsDirty(true);
    if (hasInvalidUrl) {
      return;
    }
    if (autosaveTimeoutRef.current) {
      window.clearTimeout(autosaveTimeoutRef.current);
    }
    autosaveTimeoutRef.current = window.setTimeout(() => {
      if (!formRef.current) return;
      const formData = new FormData(formRef.current);
      handleUpdateBand(formData, false);
    }, 1200);
  }

  async function handleCreateAlbum(formData: FormData) {
    clearNotices();
    try {
      const response = await fetch(`/api/bands/${band.id}/albums`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("albumTitle"),
          type: formData.get("albumType"),
          releaseYear: formData.get("albumReleaseYear"),
          coverImage: formData.get("albumCoverImage"),
          description: formData.get("albumDescription"),
        }),
      });
      await parseApiResponse(response);
      setMessage("Album added.");
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not add album.");
    }
  }

  async function handleUpdateAlbum(albumId: string, formData: FormData) {
    clearNotices();
    try {
      const response = await fetch(`/api/albums/${albumId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          type: formData.get("type"),
          releaseYear: formData.get("releaseYear"),
          coverImage: formData.get("coverImage"),
          description: formData.get("description"),
        }),
      });
      await parseApiResponse(response);
      setMessage("Album updated.");
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not update album.");
    }
  }

  async function handleDeleteAlbum(albumId: string, title: string) {
    clearNotices();
    const confirmed = window.confirm(`Delete album "${title}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/albums/${albumId}`, { method: "DELETE" });
      await parseApiResponse(response);
      setMessage("Album deleted.");
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not delete album.");
    }
  }

  const similarBands = useMemo(() => {
    const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "");
    const nameKey = normalize(name);
    const slugKey = normalize(slug);
    if (!nameKey && !slugKey) return [] as AdminBandEditorSummary[];

    return allBands
      .filter((other) => other.id !== band.id)
      .filter((other) => {
        const otherName = normalize(other.name);
        const otherSlug = normalize(other.slug);
        return (
          (nameKey && (otherName.includes(nameKey) || nameKey.includes(otherName))) ||
          (slugKey && (otherSlug.includes(slugKey) || slugKey.includes(otherSlug)))
        );
      })
      .slice(0, 5);
  }, [allBands, band.id, name, slug]);

  const logoUrlValid = isValidUrl(logoUrl);
  const youtubeUrlValid = isValidUrl(youtubeUrl);
  const spotifyUrlValid = isValidUrl(spotifyUrl);
  const instagramUrlValid = isValidUrl(instagramUrl);
  const archivedUrlValid = isValidUrl(archivedUrl);
  const hasInvalidUrl = !logoUrlValid || !youtubeUrlValid || !spotifyUrlValid || !instagramUrlValid || !archivedUrlValid;

  useEffect(() => {
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    lastSavedPayloadRef.current = JSON.stringify(buildPayload(formData));
  }, []);

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (hasInvalidUrl) {
      setError("Fix invalid URL fields before saving.");
      return;
    }
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    handleUpdateBand(formData, true);
  }

  async function handleCreateMember(formData: FormData) {
    clearNotices();
    try {
      const response = await fetch(`/api/bands/${band.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("memberName"),
          role: formData.get("memberRole"),
          yearsActive: formData.get("memberYearsActive"),
        }),
      });
      await parseApiResponse(response);
      setMessage("Member added.");
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not add member.");
    }
  }

  async function handleDeleteBand() {
    clearNotices();
    const confirmed = window.confirm(`Are you sure you want to delete "${band.name}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/bands/${band.id}`, { method: "DELETE" });
      await parseApiResponse(response);
      router.push("/admin");
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not delete band.");
    }
  }

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      router.push("/");
      router.refresh();
      return;
    }

    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/20 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold uppercase tracking-wide">Edit Band</h1>
          <p className="text-sm text-white/60">{band.name}</p>
          <p className="text-xs text-white/50">slug: {band.slug} · id: {band.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="border border-white/50 px-3 py-2 text-sm uppercase tracking-wider hover:border-accent hover:text-accent"
          >
            Back to admin
          </Link>
          <Link
            href={`/bands/${band.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-white/50 px-3 py-2 text-sm uppercase tracking-wider hover:border-accent hover:text-accent"
          >
            View public
          </Link>
          <button onClick={handleSignOut} className="border border-white px-3 py-2 text-sm hover:border-accent hover:text-accent">
            Sign out
          </button>
        </div>
      </div>

      {message ? <p className="border border-green-500/40 p-3 text-green-300">{message}</p> : null}
      {error ? <p className="border border-red-500/40 p-3 text-red-300">{error}</p> : null}

      <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
        <span>{isSaving ? "Autosaving..." : isDirty ? "Unsaved changes" : "All changes saved"}</span>
        {lastSavedAt && !isDirty ? <span>Saved at {lastSavedAt}</span> : null}
      </div>

      {similarBands.length > 0 ? (
        <div className="border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm text-yellow-200">
          <p className="font-semibold">Possible duplicates found</p>
          <p className="text-yellow-100/80">Check these bands before saving to avoid duplicates:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {similarBands.map((other) => (
              <Link
                key={other.id}
                href={`/admin/bands/id/${other.id}`}
                className="border border-yellow-400/40 px-2 py-1 text-xs hover:border-yellow-300"
              >
                {other.name}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <form
        ref={formRef}
        onSubmit={handleFormSubmit}
        onChange={scheduleAutosave}
        className="space-y-4 border border-white/20 p-5"
      >
        <div className="grid gap-3 md:grid-cols-2">
          <input
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="border border-white/30 bg-black px-3 py-2"
          />
          <input
            name="slug"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            required
            className="border border-white/30 bg-black px-3 py-2"
          />
          <input name="city" defaultValue={band.city} required className="border border-white/30 bg-black px-3 py-2" />
          <input
            name="yearFounded"
            type="number"
            defaultValue={band.yearFounded}
            required
            className="border border-white/30 bg-black px-3 py-2"
          />
          <select name="status" defaultValue={band.status} className="border border-white/30 bg-black px-3 py-2">
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-white/60" htmlFor="genres">
              Genres
            </label>
            <select
              id="genres"
              name="genres"
              multiple
              value={selectedGenres}
              onChange={(event) => {
                const values = Array.from(event.target.selectedOptions).map((option) => option.value);
                setSelectedGenres(values);
              }}
              className="min-h-[140px] w-full border border-white/30 bg-black px-3 py-2"
            >
              {availableGenres.length > 0 ? (
                availableGenres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No genres available
                </option>
              )}
            </select>
            <p className="text-xs text-white/50">Select one or more existing genres.</p>
          </div>
          <textarea
            name="biography"
            defaultValue={band.biography}
            rows={4}
            className="md:col-span-2 border border-white/30 bg-black px-3 py-2"
          />
          <div className="md:col-span-2 space-y-2">
            <input
              name="logoUrl"
              value={logoUrl}
              onChange={(event) => setLogoUrl(event.target.value)}
              placeholder="Logo image URL (optional)"
              className="w-full border border-white/30 bg-black px-3 py-2"
            />
            {logoUrl && !logoUrlValid ? (
              <p className="text-xs text-red-300">Logo URL must be a valid http(s) URL.</p>
            ) : null}
            {logoUrlValid && logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo preview"
                className="max-h-40 w-auto border border-white/20"
                loading="lazy"
              />
            ) : null}
          </div>
          <div className="space-y-1">
            <input
              name="youtubeUrl"
              value={youtubeUrl}
              onChange={(event) => setYoutubeUrl(event.target.value)}
              placeholder="YouTube URL"
              className="w-full border border-white/30 bg-black px-3 py-2"
            />
            {youtubeUrl && !youtubeUrlValid ? (
              <p className="text-xs text-red-300">YouTube URL must be a valid http(s) URL.</p>
            ) : null}
          </div>
          <div className="space-y-1">
            <input
              name="spotifyUrl"
              value={spotifyUrl}
              onChange={(event) => setSpotifyUrl(event.target.value)}
              placeholder="Spotify URL"
              className="w-full border border-white/30 bg-black px-3 py-2"
            />
            {spotifyUrl && !spotifyUrlValid ? (
              <p className="text-xs text-red-300">Spotify URL must be a valid http(s) URL.</p>
            ) : null}
          </div>
          <div className="md:col-span-2 space-y-1">
            <input
              name="instagramUrl"
              value={instagramUrl}
              onChange={(event) => setInstagramUrl(event.target.value)}
              placeholder="Instagram URL"
              className="w-full border border-white/30 bg-black px-3 py-2"
            />
            {instagramUrl && !instagramUrlValid ? (
              <p className="text-xs text-red-300">Instagram URL must be a valid http(s) URL.</p>
            ) : null}
          </div>
          <AdminDatePicker
            name="lastVerifiedAt"
            defaultValue={band.lastVerifiedAt ? band.lastVerifiedAt.slice(0, 10) : undefined}
          />
          <div className="space-y-1">
            <input
              name="archivedUrl"
              value={archivedUrl}
              onChange={(event) => setArchivedUrl(event.target.value)}
              placeholder="Archive.org / Perma URL"
              className="w-full border border-white/30 bg-black px-3 py-2"
            />
            {archivedUrl && !archivedUrlValid ? (
              <p className="text-xs text-red-300">Archive URL must be a valid http(s) URL.</p>
            ) : null}
          </div>
          <select name="labelId" defaultValue={band.labelId ?? ""} className="border border-white/30 bg-black px-3 py-2">
            <option value="">No label</option>
            {labels.map((label) => (
              <option key={label.id} value={label.id}>
                {label.name}
              </option>
            ))}
          </select>
          <textarea
            name="sources"
            defaultValue={band.sources && Array.isArray(band.sources) ? (band.sources as SourceEntry[]).map((s) => `${s.label} | ${s.url}`).join("\n") : ""}
            placeholder="Sources: one per line, Label | URL"
            rows={3}
            className="md:col-span-2 border border-white/30 bg-black px-3 py-2"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="submit" className="border border-white px-3 py-2 text-sm hover:border-accent hover:text-accent">
            Save
          </button>
          <button
            type="button"
            onClick={handleDeleteBand}
            className="border border-red-500/50 px-3 py-2 text-sm text-red-300 hover:border-red-400"
          >
            Delete
          </button>
        </div>
      </form>

      <form action={handleCreateMember} className="space-y-3 border border-white/20 p-5">
        <h2 className="text-lg font-bold uppercase tracking-wide">Add Member</h2>
        <input name="memberName" placeholder="Name" required className="w-full border border-white/30 bg-black px-3 py-2" />
        <input name="memberRole" placeholder="Role" required className="w-full border border-white/30 bg-black px-3 py-2" />
        <input
          name="memberYearsActive"
          placeholder="Years active"
          required
          className="w-full border border-white/30 bg-black px-3 py-2"
        />
        <button type="submit" className="w-full border border-white px-3 py-2 hover:border-accent hover:text-accent">
          Add Member
        </button>
      </form>

      <section className="space-y-4 border border-white/20 p-5">
        <h2 className="text-lg font-bold uppercase tracking-wide">Albums</h2>
        <form action={handleCreateAlbum} className="grid gap-3 md:grid-cols-2">
          <input name="albumTitle" placeholder="Title" required className="border border-white/30 bg-black px-3 py-2" />
          <select name="albumType" className="border border-white/30 bg-black px-3 py-2">
            <option value="ALBUM">Album</option>
            <option value="EP">EP</option>
            <option value="SINGLE">Single</option>
          </select>
          <input
            name="albumReleaseYear"
            type="number"
            placeholder="Release year"
            required
            className="border border-white/30 bg-black px-3 py-2"
          />
          <input name="albumCoverImage" placeholder="Cover image URL" className="border border-white/30 bg-black px-3 py-2" />
          <textarea name="albumDescription" placeholder="Description" className="md:col-span-2 border border-white/30 bg-black px-3 py-2" />
          <button type="submit" className="md:col-span-2 border border-white px-3 py-2 hover:border-accent hover:text-accent">
            Add Release
          </button>
        </form>

        {band.albums.length > 0 ? (
          <div className="space-y-3">
            {band.albums.map((album) => (
              <form
                key={album.id}
                onSubmit={(event) => {
                  event.preventDefault();
                  handleUpdateAlbum(album.id, new FormData(event.currentTarget));
                }}
                className="grid gap-2 border border-white/15 p-4 md:grid-cols-2"
              >
                <input name="title" defaultValue={album.title} className="border border-white/30 bg-black px-3 py-2" />
                <select name="type" defaultValue={album.type} className="border border-white/30 bg-black px-3 py-2">
                  <option value="ALBUM">Album</option>
                  <option value="EP">EP</option>
                  <option value="SINGLE">Single</option>
                </select>
                <input
                  name="releaseYear"
                  type="number"
                  defaultValue={album.releaseYear}
                  className="border border-white/30 bg-black px-3 py-2"
                />
                <input
                  name="coverImage"
                  defaultValue={album.coverImage ?? ""}
                  placeholder="Cover image URL"
                  className="border border-white/30 bg-black px-3 py-2"
                />
                <textarea
                  name="description"
                  defaultValue={album.description ?? ""}
                  placeholder="Description"
                  className="md:col-span-2 border border-white/30 bg-black px-3 py-2"
                />
                <div className="md:col-span-2 flex flex-wrap gap-2">
                  <button type="submit" className="border border-white px-3 py-2 text-sm hover:border-accent hover:text-accent">
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteAlbum(album.id, album.title)}
                    className="border border-red-500/50 px-3 py-2 text-sm text-red-300 hover:border-red-400"
                  >
                    Delete
                  </button>
                </div>
              </form>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/60">No albums yet.</p>
        )}
      </section>
    </div>
  );
}

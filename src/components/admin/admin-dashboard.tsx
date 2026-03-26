"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AdminDatePicker, AdminDateTimePicker } from "@/components/admin/admin-date-time-picker";
import { DEFAULT_GENRES } from "@/lib/genres";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type SourceEntry = { label: string; url: string };

export type AdminLabel = { id: string; name: string; slug: string };

export type AdminBand = {
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
  label?: AdminLabel | null;
  updatedAt?: string;
};

type VisitStats = {
  byCountry: Record<string, number>;
  total: number;
};

type AdminStats = {
  totalBands: number;
  recentBands: number;
  verifiedBands: number;
  pendingSuggestions: number;
};

type AdminNewsPost = { id: string; title: string; slug: string; body: string; type: string; publishedAt: string; updatedAt: string };
type AdminEvent = { id: string; title: string; venue: string; eventDate: string; description?: string | null; lineup?: string | null; url?: string | null };
type AdminInterview = {
  id: string;
  title: string;
  slug: string;
  content: string;
  featuredImage: string;
  dateCreated: string;
  band: { id: string; name: string; slug: string };
};
type AdminSuggestion = {
  id: string;
  bandName: string;
  city: string;
  genres: string;
  yearFounded: number | null;
  links: string | null;
  notes: string | null;
  contributorEmail: string | null;
  status: string;
  createdAt: string;
};

type AdminDashboardProps = {
  initialBands: AdminBand[];
  initialLabels: AdminLabel[];
  visitStats: VisitStats;
  adminStats: AdminStats;
};

type BandStatus = "complete" | "missing-info" | "needs-verification";

type TabType = "bands" | "news" | "events" | "interviews" | "labels" | "suggestions";

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

function calculateBandStatus(band: AdminBand): BandStatus {
  const missingFields = !band.logoUrl || !band.biography || band.genres.length === 0 || !band.youtubeUrl;
  const lastVerifiedDate = band.lastVerifiedAt ? new Date(band.lastVerifiedAt) : null;
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  if (!lastVerifiedDate || lastVerifiedDate < ninetyDaysAgo) {
    return "needs-verification";
  }
  
  return missingFields ? "missing-info" : "complete";
}

function getBandStatusBadge(status: BandStatus): { icon: string; label: string; color: string } {
  switch (status) {
    case "complete":
      return { icon: "[OK]", label: "Complete", color: "text-green-400" };
    case "missing-info":
      return { icon: "[!]", label: "Missing info", color: "text-yellow-400" };
    case "needs-verification":
      return { icon: "[?]", label: "Needs verification", color: "text-blue-400" };
  }
}

function filterBands(bands: AdminBand[], searchTerm: string): AdminBand[] {
  if (!searchTerm.trim()) return bands;
  const query = searchTerm.toLowerCase();
  return bands.filter(
    (band) =>
      band.name.toLowerCase().includes(query) ||
      band.city.toLowerCase().includes(query) ||
      band.genres.some((genre) => genre.toLowerCase().includes(query))
  );
}

export function AdminDashboard({ initialBands, initialLabels, visitStats, adminStats }: AdminDashboardProps) {
  const [bands, setBands] = useState(initialBands);
  const [labels, setLabels] = useState(initialLabels);
  const [newsPosts, setNewsPosts] = useState<AdminNewsPost[]>([]);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [interviews, setInterviews] = useState<AdminInterview[]>([]);
  const [suggestions, setSuggestions] = useState<AdminSuggestion[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("bands");
  const [searchTerm, setSearchTerm] = useState("");
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    addBand: false,
    editBands: false,
    files: false,
  });
  const router = useRouter();

  const bandOptions = useMemo(() => bands.map((band) => ({ id: band.id, name: band.name })), [bands]);
  const filteredBands = useMemo(() => filterBands(bands, searchTerm), [bands, searchTerm]);
  const availableGenres = useMemo(
    () => Array.from(new Set([...DEFAULT_GENRES, ...bands.flatMap((band) => band.genres)])).sort((a, b) => a.localeCompare(b)),
    [bands],
  );

  function toggleSection(section: string) {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }

  function handleOpenBand(bandId: string | undefined) {
    if (!bandId) {
      setError("Missing band id for edit page.");
      return;
    }
    window.location.href = `/admin/bands/id/${encodeURIComponent(bandId)}`;
  }

  async function refreshLabels() {
    const res = await fetch("/api/labels", { cache: "no-store" });
    const payload = await parseApiResponse(res);
    setLabels(payload.labels ?? []);
  }

  async function refreshNews() {
    try {
      const res = await fetch("/api/news", { cache: "no-store" });
      const payload = await parseApiResponse(res);
      setNewsPosts(payload.posts ?? []);
    } catch {
      setNewsPosts([]);
    }
  }

  async function refreshEvents() {
    try {
      const res = await fetch("/api/events", { cache: "no-store" });
      const payload = await parseApiResponse(res);
      setEvents(payload.events ?? []);
    } catch {
      setEvents([]);
    }
  }

  async function refreshSuggestions() {
    try {
      const res = await fetch("/api/suggest", { cache: "no-store" });
      const payload = await parseApiResponse(res);
      setSuggestions(payload.suggestions ?? []);
    } catch {
      setSuggestions([]);
    }
  }

  async function refreshInterviews() {
    try {
      const res = await fetch("/api/interviews", { cache: "no-store" });
      const payload = await parseApiResponse(res);
      setInterviews(payload.interviews ?? []);
    } catch {
      setInterviews([]);
    }
  }

  useEffect(() => {
    refreshNews();
    refreshEvents();
    refreshInterviews();
    refreshSuggestions();
  }, []);

  function clearNotices() {
    setMessage(null);
    setError(null);
  }

  async function refreshBands() {
    const response = await fetch("/api/bands", { cache: "no-store" });
    const payload = await parseApiResponse(response);
    setBands(payload.bands ?? []);
  }

  async function handleCreateBand(formData: FormData) {
    clearNotices();
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

    try {
      const response = await fetch("/api/bands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await parseApiResponse(response);
      setMessage("Band added.");
      await refreshBands();
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not add band.");
    }
  }

  async function handleDeleteBand(id: string, name?: string) {
    clearNotices();

    const label = name ? `"${name}"` : "this band";
    const confirmed = window.confirm(
      `Are you sure you want to delete ${label}? This will permanently remove the band and all its albums, members, and images. This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/bands/${id}`, { method: "DELETE" });
      await parseApiResponse(response);
      setMessage("Band deleted.");
      await refreshBands();
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not delete band.");
    }
  }

  async function handleCreateAlbum(formData: FormData) {
    clearNotices();
    const bandId = String(formData.get("albumBandId") ?? "");

    try {
      const response = await fetch(`/api/bands/${bandId}/albums`, {
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

  async function handleCreateMember(formData: FormData) {
    clearNotices();
    const bandId = String(formData.get("memberBandId") ?? "");

    try {
      const response = await fetch(`/api/bands/${bandId}/members`, {
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

  async function handleCreateImage(formData: FormData) {
    clearNotices();
    const bandId = String(formData.get("imageBandId") ?? "");

    try {
      const response = await fetch(`/api/bands/${bandId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: formData.get("imageUrl"),
          caption: formData.get("imageCaption"),
        }),
      });
      await parseApiResponse(response);
      setMessage("Image record added.");
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not add image record.");
    }
  }

  async function handleUpload(formData: FormData) {
    clearNotices();
    setUploading(true);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const payload = await parseApiResponse(response);
      setMessage(`Uploaded: ${payload.publicUrl}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleCreateLabel(formData: FormData) {
    clearNotices();
    const name = String(formData.get("labelName") ?? "").trim();
    if (!name) {
      setError("Label name is required.");
      return;
    }
    try {
      const response = await fetch("/api/labels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      await parseApiResponse(response);
      setMessage("Label added.");
      await refreshLabels();
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not add label.");
    }
  }

  async function handleCreateNews(formData: FormData) {
    clearNotices();
    const title = String(formData.get("newsTitle") ?? "").trim();
    const body = String(formData.get("newsBody") ?? "").trim();
    const type = String(formData.get("newsType") ?? "GENERAL");
    const publishedAt = String(formData.get("newsPublishedAt") ?? "").trim();
    if (!title || !body) {
      setError("Title and body are required.");
      return;
    }
    try {
      const response = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          type,
          publishedAt: publishedAt || undefined,
        }),
      });
      await parseApiResponse(response);
      setMessage("News post added.");
      await refreshNews();
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not add news post.");
    }
  }

  async function handleUpdateNews(id: string, formData: FormData) {
    clearNotices();
    const title = String(formData.get(`newsTitle-${id}`) ?? "").trim();
    const body = String(formData.get(`newsBody-${id}`) ?? "").trim();
    const type = String(formData.get(`newsType-${id}`) ?? "GENERAL");
    const publishedAt = String(formData.get(`newsPublishedAt-${id}`) ?? "").trim();
    if (!title || !body) {
      setError("Title and body are required.");
      return;
    }
    try {
      const response = await fetch(`/api/news/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        title,
        slug: String(formData.get(`newsSlug-${id}`) ?? "").trim() || undefined,
        body,
        type,
        publishedAt: publishedAt || undefined,
      }),
      });
      await parseApiResponse(response);
      setMessage("News post updated.");
      await refreshNews();
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not update news post.");
    }
  }

  async function handleDeleteNews(id: string, title?: string) {
    clearNotices();
    if (!window.confirm(`Delete news post "${title ?? id}"?`)) return;
    try {
      const response = await fetch(`/api/news/${id}`, { method: "DELETE" });
      await parseApiResponse(response);
      setMessage("News post deleted.");
      await refreshNews();
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not delete news post.");
    }
  }

  async function handleCreateEvent(formData: FormData) {
    clearNotices();
    const title = String(formData.get("eventTitle") ?? "").trim();
    const venue = String(formData.get("eventVenue") ?? "").trim();
    const eventDate = String(formData.get("eventDate") ?? "").trim();
    if (!title || !venue || !eventDate) {
      setError("Title, venue, and date are required.");
      return;
    }
    try {
      const eventUrl = String(formData.get("eventUrl") ?? "").trim();
        const payload: Record<string, unknown> = {
          title,
          venue,
          eventDate: new Date(eventDate).toISOString(),
          description: String(formData.get("eventDescription") ?? "").trim() || undefined,
          lineup: String(formData.get("eventLineup") ?? "").trim() || undefined,
        };
        if (eventUrl) payload.url = eventUrl;
        const response = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      await parseApiResponse(response);
      setMessage("Event added.");
      await refreshEvents();
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not add event.");
    }
  }

  async function handleUpdateEvent(id: string, formData: FormData) {
    clearNotices();
    const title = String(formData.get(`eventTitle-${id}`) ?? "").trim();
    const venue = String(formData.get(`eventVenue-${id}`) ?? "").trim();
    const eventDate = String(formData.get(`eventDate-${id}`) ?? "").trim();
    if (!title || !venue || !eventDate) {
      setError("Title, venue, and date are required.");
      return;
    }
    try {
      const eventUrl = String(formData.get(`eventUrl-${id}`) ?? "").trim();
        const payload: Record<string, unknown> = {
          title,
          venue,
          eventDate: new Date(eventDate).toISOString(),
          description: String(formData.get(`eventDescription-${id}`) ?? "").trim() || undefined,
          lineup: String(formData.get(`eventLineup-${id}`) ?? "").trim() || undefined,
        };
        if (eventUrl) payload.url = eventUrl;
        const response = await fetch(`/api/events/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      await parseApiResponse(response);
      setMessage("Event updated.");
      await refreshEvents();
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not update event.");
    }
  }

  async function handleDeleteEvent(id: string, title?: string) {
    clearNotices();
    if (!window.confirm(`Delete event "${title ?? id}"?`)) return;
    try {
      const response = await fetch(`/api/events/${id}`, { method: "DELETE" });
      await parseApiResponse(response);
      setMessage("Event deleted.");
      await refreshEvents();
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not delete event.");
    }
  }

  async function handleCreateInterview(formData: FormData) {
    clearNotices();
    const title = String(formData.get("interviewTitle") ?? "").trim();
    const content = String(formData.get("interviewContent") ?? "").trim();
    const featuredImage = String(formData.get("interviewFeaturedImage") ?? "").trim();
    const bandId = String(formData.get("interviewBandId") ?? "").trim();
    const slug = String(formData.get("interviewSlug") ?? "").trim();
    const dateCreated = String(formData.get("interviewDate") ?? "").trim();

    if (!title || !content || !featuredImage || !bandId) {
      setError("Title, content, featured image, and band are required.");
      return;
    }

    try {
      const response = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug: slug || undefined,
          content,
          featuredImage,
          bandId,
          dateCreated: dateCreated || undefined,
        }),
      });
      await parseApiResponse(response);
      setMessage("Interview added.");
      await refreshInterviews();
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not add interview.");
    }
  }

  async function handleUpdateInterview(id: string, formData: FormData) {
    clearNotices();
    const title = String(formData.get(`interviewTitle-${id}`) ?? "").trim();
    const content = String(formData.get(`interviewContent-${id}`) ?? "").trim();
    const featuredImage = String(formData.get(`interviewFeaturedImage-${id}`) ?? "").trim();
    const bandId = String(formData.get(`interviewBandId-${id}`) ?? "").trim();
    const slug = String(formData.get(`interviewSlug-${id}`) ?? "").trim();
    const dateCreated = String(formData.get(`interviewDate-${id}`) ?? "").trim();

    if (!title || !content || !featuredImage || !bandId) {
      setError("Title, content, featured image, and band are required.");
      return;
    }

    try {
      const response = await fetch(`/api/interviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug: slug || undefined,
          content,
          featuredImage,
          bandId,
          dateCreated: dateCreated || undefined,
        }),
      });
      await parseApiResponse(response);
      setMessage("Interview updated.");
      await refreshInterviews();
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not update interview.");
    }
  }

  async function handleDeleteInterview(id: string, title?: string) {
    clearNotices();
    if (!window.confirm(`Delete interview "${title ?? id}"?`)) return;
    try {
      const response = await fetch(`/api/interviews/${id}`, { method: "DELETE" });
      await parseApiResponse(response);
      setMessage("Interview deleted.");
      await refreshInterviews();
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not delete interview.");
    }
  }

  async function handleSuggestionStatus(id: string, status: "ADDED" | "DISMISSED") {
    clearNotices();
    try {
      await fetch(`/api/suggest/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setMessage(status === "ADDED" ? "Marked as added." : "Suggestion dismissed.");
      await refreshSuggestions();
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not update suggestion.");
    }
  }

  async function handleDuplicateBand(band: AdminBand) {
    clearNotices();
    const sources = band.sources ?? undefined;
    const payload = {
      name: `Copy of ${band.name}`,
      city: band.city,
      yearFounded: band.yearFounded,
      status: band.status,
      biography: band.biography,
      genres: band.genres,
      logoUrl: band.logoUrl && String(band.logoUrl).trim() ? band.logoUrl : "",
      youtubeUrl: band.youtubeUrl && String(band.youtubeUrl).trim() ? band.youtubeUrl : "",
      spotifyUrl: band.spotifyUrl && String(band.spotifyUrl).trim() ? band.spotifyUrl : "",
      instagramUrl: band.instagramUrl && String(band.instagramUrl).trim() ? band.instagramUrl : "",
      lastVerifiedAt: null,
      archivedUrl: band.archivedUrl && String(band.archivedUrl).trim() ? band.archivedUrl : "",
      sources: sources?.length ? sources : null,
      labelId: band.labelId && String(band.labelId).trim() ? band.labelId : "",
    };

    try {
      const response = await fetch("/api/bands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await parseApiResponse(response);
      setMessage("Band duplicated. Remember to verify all info before saving.");
      await refreshBands();
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not duplicate band.");
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
    <div className="space-y-6 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black border-b border-white/20 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h1 className="text-3xl font-extrabold uppercase tracking-wide">Archive Admin</h1>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/logs"
              className="border border-white/50 px-3 py-2 text-sm uppercase tracking-wider hover:border-accent hover:text-accent"
            >
              Logs
            </Link>
            <button onClick={handleSignOut} className="border border-white px-3 py-2 text-sm hover:border-accent hover:text-accent">
              Sign out
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(["bands", "news", "events", "interviews", "labels", "suggestions"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSearchTerm("");
              }}
              className={`px-4 py-2 border uppercase text-sm font-medium tracking-wider ${
                activeTab === tab
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-white/50 text-white/70 hover:border-white hover:text-white"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-6">
        {/* Messages */}
        {message ? <p className="mb-4 border border-green-500/40 p-3 text-green-300">{message}</p> : null}
        {error ? <p className="mb-4 border border-red-500/40 p-3 text-red-300">{error}</p> : null}

        {visitStats.total > 0 && activeTab === "bands" ? (
          <p className="mb-4 text-sm text-white/70">
            {visitStats.total} visit(s) recorded from users who chose &quot;Accept all&quot;.{" "}
            <Link href="/admin/logs" className="underline hover:text-accent">
              View logs
            </Link>
          </p>
        ) : null}

        {activeTab === "bands" ? (
          <section className="mb-6 grid gap-3 md:grid-cols-4">
            <div className="border border-white/20 p-3">
              <p className="text-xs uppercase tracking-wide text-white/60">Total bands</p>
              <p className="text-2xl font-semibold">{adminStats.totalBands}</p>
            </div>
            <div className="border border-white/20 p-3">
              <p className="text-xs uppercase tracking-wide text-white/60">Added last 30 days</p>
              <p className="text-2xl font-semibold">{adminStats.recentBands}</p>
            </div>
            <div className="border border-white/20 p-3">
              <p className="text-xs uppercase tracking-wide text-white/60">Verified (90 days)</p>
              <p className="text-2xl font-semibold">{adminStats.verifiedBands}</p>
            </div>
            <div className="border border-white/20 p-3">
              <p className="text-xs uppercase tracking-wide text-white/60">Pending suggestions</p>
              <p className="text-2xl font-semibold">{adminStats.pendingSuggestions}</p>
            </div>
          </section>
        ) : null}

        {/* BANDS TAB */}
        {activeTab === "bands" && (
          <div className="space-y-6">
            {/* Add Band Section */}
            <section className="space-y-3 border border-white/20 p-5">
              <button
                onClick={() => toggleSection("addBand")}
                className="w-full flex items-center justify-between gap-3 text-xl font-bold uppercase tracking-wide hover:text-accent"
              >
                <span>Add New Band</span>
                <span className="text-lg">{collapsedSections.addBand ? ">" : "v"}</span>
              </button>
              {!collapsedSections.addBand && (
                <form action={handleCreateBand} className="grid gap-3 md:grid-cols-2">
                  <input name="name" placeholder="Band name" required className="border border-white/30 bg-black px-3 py-2" />
                  <input name="city" placeholder="City" required className="border border-white/30 bg-black px-3 py-2" />
                  <input
                    name="yearFounded"
                    type="number"
                    placeholder="Year founded"
                    required
                    className="border border-white/30 bg-black px-3 py-2"
                  />
                  <select name="status" required className="border border-white/30 bg-black px-3 py-2">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs uppercase tracking-wider text-white/60" htmlFor="create-genres">
                      Genres
                    </label>
                    <select
                      id="create-genres"
                      name="genres"
                      multiple
                      required
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
                    placeholder="Biography"
                    required
                    rows={4}
                    className="md:col-span-2 border border-white/30 bg-black px-3 py-2"
                  />
                  <input
                    name="logoUrl"
                    placeholder="Logo image URL (optional)"
                    className="md:col-span-2 border border-white/30 bg-black px-3 py-2"
                  />
                  <input name="youtubeUrl" placeholder="YouTube URL" className="border border-white/30 bg-black px-3 py-2" />
                  <input name="spotifyUrl" placeholder="Spotify URL" className="border border-white/30 bg-black px-3 py-2" />
                  <input
                    name="instagramUrl"
                    placeholder="Instagram URL"
                    className="md:col-span-2 border border-white/30 bg-black px-3 py-2"
                  />
                  <AdminDatePicker name="lastVerifiedAt" className="w-full" />
                  <input
                    name="archivedUrl"
                    placeholder="Archive.org / Perma URL (optional)"
                    className="border border-white/30 bg-black px-3 py-2"
                  />
                  <select name="labelId" className="border border-white/30 bg-black px-3 py-2">
                    <option value="">No label</option>
                    {labels.map((label) => (
                      <option key={label.id} value={label.id}>
                        {label.name}
                      </option>
                    ))}
                  </select>
                  <textarea
                    name="sources"
                    placeholder="Sources: one per line, Label | URL"
                    rows={3}
                    className="md:col-span-2 border border-white/30 bg-black px-3 py-2"
                  />
                  <button type="submit" className="md:col-span-2 border border-white px-4 py-2 hover:border-accent hover:text-accent">
                    Add Band
                  </button>
                </form>
              )}
            </section>

            {/* Search & Filter */}
            <section className="border border-white/20 p-5">
              <input
                type="text"
                placeholder="Search bands by name, city, or genre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-white/30 bg-black px-3 py-2"
              />
              <p className="mt-2 text-sm text-white/60">
                Showing {filteredBands.length} of {bands.length} bands
              </p>
            </section>

            {/* Edit Bands Section */}
            <section className="space-y-3 border border-white/20 p-5">
              <button
                onClick={() => toggleSection("editBands")}
                className="w-full flex items-center justify-between gap-3 text-xl font-bold uppercase tracking-wide hover:text-accent"
              >
                <span>Edit or Delete Bands</span>
                <span className="text-lg">{collapsedSections.editBands ? ">" : "v"}</span>
              </button>
              {!collapsedSections.editBands && (
                <div className="space-y-3">
                  {filteredBands.length === 0 ? (
                    <p className="text-sm text-white/50">No bands matching your search.</p>
                  ) : (
                    filteredBands.map((band) => {
                      const bandStatus = calculateBandStatus(band);
                      const statusBadge = getBandStatusBadge(bandStatus);
                      return (
                        <div key={band.id} className="border border-white/15 p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <h3 className="font-semibold text-base">{band.name}</h3>
                              <p className="text-sm text-white/60">{band.city} · {band.genres.join(", ")}</p>
                              <p className="text-xs text-white/50">slug: {band.slug} · id: {band.id}</p>
                            </div>
                            <span className={`text-sm font-medium ${statusBadge.color}`}>
                              {statusBadge.icon} {statusBadge.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 pt-3">
                            <button
                              type="button"
                              onClick={() => handleOpenBand(band.id)}
                              className="border border-white px-3 py-2 text-sm hover:border-accent hover:text-accent"
                            >
                              Edit page
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicateBand(band)}
                              className="border border-blue-500/50 px-3 py-2 text-sm text-blue-300 hover:border-blue-400"
                            >
                              Duplicate
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBand(band.id, band.name)}
                              className="border border-red-500/50 px-3 py-2 text-sm text-red-300 hover:border-red-400"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </section>

            {/* Files Section */}
            <section className="grid gap-6 lg:grid-cols-3">
              <form action={handleCreateAlbum} className="space-y-3 border border-white/20 p-5">
                <h3 className="font-bold uppercase tracking-wide">Add Album</h3>
                <select name="albumBandId" required className="w-full border border-white/30 bg-black px-3 py-2">
                  <option value="">Select band</option>
                  {bandOptions.map((band) => (
                    <option key={band.id} value={band.id}>
                      {band.name}
                    </option>
                  ))}
                </select>
                <input name="albumTitle" placeholder="Title" required className="w-full border border-white/30 bg-black px-3 py-2" />
                <select name="albumType" className="w-full border border-white/30 bg-black px-3 py-2">
                  <option value="ALBUM">Album</option>
                  <option value="EP">EP</option>
                  <option value="SINGLE">Single</option>
                </select>
                <input
                  name="albumReleaseYear"
                  type="number"
                  placeholder="Release year"
                  required
                  className="w-full border border-white/30 bg-black px-3 py-2"
                />
                <input name="albumCoverImage" placeholder="Cover image URL" className="w-full border border-white/30 bg-black px-3 py-2" />
                <textarea name="albumDescription" placeholder="Description" className="w-full border border-white/30 bg-black px-3 py-2" />
                <button type="submit" className="w-full border border-white px-3 py-2 hover:border-accent hover:text-accent">
                  Add Album
                </button>
              </form>

              <form action={handleCreateMember} className="space-y-3 border border-white/20 p-5">
                <h3 className="font-bold uppercase tracking-wide">Add Member</h3>
                <select name="memberBandId" required className="w-full border border-white/30 bg-black px-3 py-2">
                  <option value="">Select band</option>
                  {bandOptions.map((band) => (
                    <option key={band.id} value={band.id}>
                      {band.name}
                    </option>
                  ))}
                </select>
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

              <div className="space-y-4 border border-white/20 p-5">
                <form action={handleUpload} className="space-y-3">
                  <h3 className="font-bold uppercase tracking-wide">Upload Image</h3>
                  <input name="file" type="file" required accept="image/*" className="w-full border border-white/30 bg-black px-3 py-2" />
                  <button
                    type="submit"
                    disabled={uploading}
                    className="w-full border border-white px-3 py-2 hover:border-accent hover:text-accent disabled:opacity-60"
                  >
                    {uploading ? "Uploading..." : "Upload to storage"}
                  </button>
                </form>

                <form action={handleCreateImage} className="space-y-3 border-t border-white/20 pt-4">
                  <h3 className="font-bold uppercase tracking-wide">Add Gallery Record</h3>
                  <select name="imageBandId" required className="w-full border border-white/30 bg-black px-3 py-2">
                    <option value="">Select band</option>
                    {bandOptions.map((band) => (
                      <option key={band.id} value={band.id}>
                        {band.name}
                      </option>
                    ))}
                  </select>
                  <input name="imageUrl" placeholder="Uploaded image URL" required className="w-full border border-white/30 bg-black px-3 py-2" />
                  <input name="imageCaption" placeholder="Caption" className="w-full border border-white/30 bg-black px-3 py-2" />
                  <button type="submit" className="w-full border border-white px-3 py-2 hover:border-accent hover:text-accent">
                    Add Image
                  </button>
                </form>
              </div>
            </section>
          </div>
        )}

        {/* NEWS TAB */}
        {activeTab === "news" && (
          <div className="space-y-6">
            <section className="space-y-3 border border-white/20 p-5">
              <h2 className="text-xl font-bold uppercase tracking-wide">Create News Post</h2>
              <form action={handleCreateNews} className="grid gap-3 md:grid-cols-2">
                <input name="newsTitle" placeholder="Title" required className="border border-white/30 bg-black px-3 py-2" />
                <select name="newsType" className="border border-white/30 bg-black px-3 py-2">
                  <option value="GENERAL">News</option>
                  <option value="NEW_BAND">New band</option>
                  <option value="REUNION">Reunion</option>
                  <option value="TRIBUTE">Tribute</option>
                </select>
                <textarea name="newsBody" placeholder="Body" required rows={4} className="md:col-span-2 border border-white/30 bg-black px-3 py-2" />
                <AdminDateTimePicker name="newsPublishedAt" className="w-full" />
                <button type="submit" className="border border-white px-4 py-2 hover:border-accent hover:text-accent">
                  Add news post
                </button>
              </form>
            </section>

            <section className="space-y-3 border border-white/20 p-5">
              <h2 className="text-xl font-bold uppercase tracking-wide">Recent Posts</h2>
              {newsPosts.length === 0 ? (
                <p className="text-sm text-white/50">No news posts yet.</p>
              ) : (
                <div className="space-y-3">
                  {newsPosts.map((post) => (
                    <form key={post.id} action={(formData) => handleUpdateNews(post.id, formData)} className="border border-white/15 p-4 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10">
                        <Link href={`/news/${post.slug}`} target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-accent">
                          {post.title}
                        </Link>
                        <span className="text-sm text-white/60">
                          {new Date(post.publishedAt).toLocaleDateString()} · {post.type}
                        </span>
                      </div>
                      <input name={`newsTitle-${post.id}`} defaultValue={post.title} required className="w-full border border-white/30 bg-black px-3 py-2 text-sm" />
                      <select name={`newsType-${post.id}`} defaultValue={post.type} className="border border-white/30 bg-black px-3 py-2 text-sm">
                        <option value="GENERAL">News</option>
                        <option value="NEW_BAND">New band</option>
                        <option value="REUNION">Reunion</option>
                        <option value="TRIBUTE">Tribute</option>
                      </select>
                      <textarea name={`newsBody-${post.id}`} defaultValue={post.body} required rows={4} className="w-full border border-white/30 bg-black px-3 py-2 text-sm" />
                      <input type="hidden" name={`newsSlug-${post.id}`} value={post.slug} />
                      <AdminDateTimePicker
                        name={`newsPublishedAt-${post.id}`}
                        defaultValue={post.publishedAt ? post.publishedAt.slice(0, 16) : undefined}
                        className="w-full"
                      />
                      <div className="flex flex-wrap gap-2">
                        <button type="submit" className="border border-white px-3 py-1 text-sm hover:text-accent">
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteNews(post.id, post.title)}
                          className="border border-red-500/50 px-3 py-1 text-sm text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </form>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* EVENTS TAB */}
        {activeTab === "events" && (
          <div className="space-y-6">
            <section className="space-y-3 border border-white/20 p-5">
              <h2 className="text-xl font-bold uppercase tracking-wide">Create Event</h2>
              <form action={handleCreateEvent} className="grid gap-3 md:grid-cols-2">
                <input name="eventTitle" placeholder="Title" required className="border border-white/30 bg-black px-3 py-2" />
                <input name="eventVenue" placeholder="Venue" required className="border border-white/30 bg-black px-3 py-2" />
                <AdminDateTimePicker name="eventDate" required className="w-full" />
                <input name="eventLineup" placeholder="Lineup (optional)" className="border border-white/30 bg-black px-3 py-2" />
                <input name="eventUrl" placeholder="Tickets / info URL (optional)" className="md:col-span-2 border border-white/30 bg-black px-3 py-2" />
                <textarea name="eventDescription" placeholder="Description (optional)" rows={2} className="md:col-span-2 border border-white/30 bg-black px-3 py-2" />
                <button type="submit" className="border border-white px-4 py-2 hover:border-accent hover:text-accent">
                  Add event
                </button>
              </form>
            </section>

            <section className="space-y-3 border border-white/20 p-5">
              <h2 className="text-xl font-bold uppercase tracking-wide">Upcoming Events</h2>
              {events.length === 0 ? (
                <p className="text-sm text-white/50">No events yet.</p>
              ) : (
                <div className="space-y-3">
                  {events.map((event) => (
                    <form key={event.id} action={(formData) => handleUpdateEvent(event.id, formData)} className="border border-white/15 p-4 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10">
                        <span className="font-semibold">{event.title}</span>
                        <span className="text-sm text-white/60">
                          {new Date(event.eventDate).toLocaleDateString()} · {event.venue}
                        </span>
                      </div>
                      <input name={`eventTitle-${event.id}`} defaultValue={event.title} required className="w-full border border-white/30 bg-black px-3 py-2 text-sm" />
                      <input name={`eventVenue-${event.id}`} defaultValue={event.venue} required className="w-full border border-white/30 bg-black px-3 py-2 text-sm" />
                      <AdminDateTimePicker
                        name={`eventDate-${event.id}`}
                        defaultValue={event.eventDate.slice(0, 16)}
                        required
                        className="w-full"
                      />
                      <input name={`eventLineup-${event.id}`} defaultValue={event.lineup ?? ""} placeholder="Lineup" className="w-full border border-white/30 bg-black px-3 py-2 text-sm" />
                      <textarea
                        name={`eventDescription-${event.id}`}
                        defaultValue={event.description ?? ""}
                        placeholder="Description"
                        rows={2}
                        className="w-full border border-white/30 bg-black px-3 py-2 text-sm"
                      />
                      <input name={`eventUrl-${event.id}`} defaultValue={event.url ?? ""} placeholder="URL" className="w-full border border-white/30 bg-black px-3 py-2 text-sm" />
                      <div className="flex flex-wrap gap-2">
                        <button type="submit" className="border border-white px-3 py-1 text-sm hover:text-accent">
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEvent(event.id, event.title)}
                          className="border border-red-500/50 px-3 py-1 text-sm text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </form>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === "interviews" && (
          <div className="space-y-6">
            <section className="space-y-3 border border-white/20 p-5">
              <h2 className="text-xl font-bold uppercase tracking-wide">Create Interview</h2>
              <form action={handleCreateInterview} className="grid gap-3 md:grid-cols-2">
                <input name="interviewTitle" placeholder="Title" required className="border border-white/30 bg-black px-3 py-2" />
                <input name="interviewSlug" placeholder="Slug (optional)" className="border border-white/30 bg-black px-3 py-2" />
                <select name="interviewBandId" required className="border border-white/30 bg-black px-3 py-2">
                  <option value="">Select band</option>
                  {bandOptions.map((band) => (
                    <option key={band.id} value={band.id}>
                      {band.name}
                    </option>
                  ))}
                </select>
                <AdminDateTimePicker name="interviewDate" className="w-full" />
                <input
                  name="interviewFeaturedImage"
                  placeholder="Featured image URL"
                  required
                  className="md:col-span-2 border border-white/30 bg-black px-3 py-2"
                />
                <textarea
                  name="interviewContent"
                  placeholder="Interview content (HTML or rich text)"
                  required
                  rows={6}
                  className="md:col-span-2 border border-white/30 bg-black px-3 py-2"
                />
                <button type="submit" className="border border-white px-4 py-2 hover:border-accent hover:text-accent">
                  Add interview
                </button>
              </form>
            </section>

            <section className="space-y-3 border border-white/20 p-5">
              <h2 className="text-xl font-bold uppercase tracking-wide">Recent Interviews</h2>
              {interviews.length === 0 ? (
                <p className="text-sm text-white/50">No interviews yet.</p>
              ) : (
                <div className="space-y-3">
                  {interviews.map((interview) => (
                    <form key={interview.id} action={(formData) => handleUpdateInterview(interview.id, formData)} className="border border-white/15 p-4 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10">
                        <Link href={`/interviews/${interview.slug}`} target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-accent">
                          {interview.title}
                        </Link>
                        <span className="text-sm text-white/60">
                          {new Date(interview.dateCreated).toLocaleDateString()} · {interview.band.name}
                        </span>
                      </div>
                      <input name={`interviewTitle-${interview.id}`} defaultValue={interview.title} required className="w-full border border-white/30 bg-black px-3 py-2 text-sm" />
                      <input name={`interviewSlug-${interview.id}`} defaultValue={interview.slug} className="w-full border border-white/30 bg-black px-3 py-2 text-sm" />
                      <select name={`interviewBandId-${interview.id}`} defaultValue={interview.band.id} className="border border-white/30 bg-black px-3 py-2 text-sm">
                        {bandOptions.map((band) => (
                          <option key={band.id} value={band.id}>
                            {band.name}
                          </option>
                        ))}
                      </select>
                      <AdminDateTimePicker
                        name={`interviewDate-${interview.id}`}
                        defaultValue={interview.dateCreated ? interview.dateCreated.slice(0, 16) : undefined}
                        className="w-full"
                      />
                      <input
                        name={`interviewFeaturedImage-${interview.id}`}
                        defaultValue={interview.featuredImage}
                        className="w-full border border-white/30 bg-black px-3 py-2 text-sm"
                      />
                      <textarea
                        name={`interviewContent-${interview.id}`}
                        defaultValue={interview.content}
                        rows={6}
                        className="w-full border border-white/30 bg-black px-3 py-2 text-sm"
                      />
                      <div className="flex flex-wrap gap-2">
                        <button type="submit" className="border border-white px-3 py-1 text-sm hover:text-accent">
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteInterview(interview.id, interview.title)}
                          className="border border-red-500/50 px-3 py-1 text-sm text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </form>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* LABELS TAB */}
        {activeTab === "labels" && (
          <section className="space-y-3 border border-white/20 p-5">
            <h2 className="text-xl font-bold uppercase tracking-wide">Manage Labels</h2>
            <form action={handleCreateLabel} className="flex flex-wrap items-end gap-3 pb-4 border-b border-white/20">
              <input
                name="labelName"
                placeholder="Label name"
                required
                className="border border-white/30 bg-black px-3 py-2 min-w-[200px]"
              />
              <button type="submit" className="border border-white px-4 py-2 hover:border-accent hover:text-accent">
                Add label
              </button>
            </form>
            {labels.length === 0 ? (
              <p className="text-sm text-white/50">No labels yet. Add one above.</p>
            ) : (
              <ul className="flex flex-wrap gap-3">
                {labels.map((label) => (
                  <li key={label.id} className="border border-white/30 p-3 hover:bg-white/5">
                    <Link href={`/labels/${label.slug}`} target="_blank" rel="noopener noreferrer" className="font-medium hover:text-accent">
                      {label.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* SUGGESTIONS TAB */}
        {activeTab === "suggestions" && (
          <section className="space-y-3 border border-white/20 p-5">
            <div>
              <h2 className="text-xl font-bold uppercase tracking-wide mb-2">Band Suggestions</h2>
              <p className="text-sm text-white/70">
                Submissions from the <Link href="/suggest" className="underline hover:text-accent">Suggest a band</Link> form.
              </p>
            </div>

            {suggestions.filter((s) => s.status === "PENDING").length === 0 ? (
              <p className="text-sm text-white/50 mt-4">{suggestions.length > 0 ? "No pending suggestions." : "No suggestions yet."}</p>
            ) : (
              <div className="space-y-3 mt-4">
                {suggestions
                  .filter((s) => s.status === "PENDING")
                  .map((s) => (
                    <div key={s.id} className="border border-white/15 p-4 space-y-2">
                      <div className="flex flex-wrap items-start justify-between gap-2 pb-2 border-b border-white/10">
                        <div>
                          <p className="font-semibold">{s.bandName}</p>
                          <p className="text-sm text-white/70">
                            {s.city} · {s.genres}
                            {s.yearFounded ? ` · ${s.yearFounded}` : ""}
                          </p>
                        </div>
                        <span className="text-xs text-white/50">{new Date(s.createdAt).toLocaleDateString()}</span>
                      </div>
                      {s.links ? <p className="text-sm text-white/60 whitespace-pre-wrap">{s.links}</p> : null}
                      {s.notes ? <p className="text-sm text-white/60">{s.notes}</p> : null}
                      {s.contributorEmail ? <p className="text-xs text-white/50">From: {s.contributorEmail}</p> : null}
                      <div className="flex flex-wrap gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => handleSuggestionStatus(s.id, "ADDED")}
                          className="border border-green-500/50 px-3 py-1 text-sm text-green-300 hover:bg-green-500/20"
                        >
                          Mark as added
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSuggestionStatus(s.id, "DISMISSED")}
                          className="border border-white/50 px-3 py-1 text-sm hover:bg-white/10"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

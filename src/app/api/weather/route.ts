import { NextRequest, NextResponse } from "next/server";

/**
 * AccuWeather integration (server-side only – API key never exposed).
 * Get a free API key: https://developer.accuweather.com/
 * Add to .env: ACCUWEATHER_API_KEY=your_key
 *
 * Usage:
 * - GET /api/weather?city=Prishtina
 * - GET /api/weather?locationKey=349727&details=true&language=en-us&format=json
 * Default city is Prishtina if no query param.
 */
const ACCUWEATHER_BASE = "https://dataservice.accuweather.com";

function buildQuery(params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === "") continue;
    searchParams.set(key, value);
  }
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.ACCUWEATHER_API_KEY;
  if (!apiKey?.trim()) {
    return NextResponse.json(
      { error: "Weather not configured", ok: false },
      { status: 503 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const locationKey = searchParams.get("locationKey")?.trim();
  const city = searchParams.get("city")?.trim() || "Prishtina";

  try {
    if (locationKey) {
      const details = searchParams.get("details") ?? undefined;
      const language = searchParams.get("language") ?? undefined;
      const format = searchParams.get("format") ?? undefined;
      const query = buildQuery({ details, language, format });
      const locationUrl = `${ACCUWEATHER_BASE}/locations/v1/${encodeURIComponent(locationKey)}${query}`;
      const locationRes = await fetch(locationUrl, {
        headers: { Authorization: `Bearer ${apiKey}` },
        next: { revalidate: 3600 },
      });
      if (!locationRes.ok) {
        const text = await locationRes.text();
        return NextResponse.json(
          { error: "Location lookup failed", details: text.slice(0, 200) },
          { status: 502 }
        );
      }
      const location = await locationRes.json();
      return NextResponse.json({ ok: true, location });
    }

    const searchUrl = `${ACCUWEATHER_BASE}/locations/v1/cities/search?apikey=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(city)}`;
    const searchRes = await fetch(searchUrl, { next: { revalidate: 3600 } });
    if (!searchRes.ok) {
      const text = await searchRes.text();
      return NextResponse.json(
        { error: "Location lookup failed", details: text.slice(0, 200) },
        { status: 502 }
      );
    }
    const locations = await searchRes.json();
    const location = Array.isArray(locations) && locations.length > 0 ? locations[0] : null;
    if (!location?.Key) {
      return NextResponse.json(
        { error: "City not found", city },
        { status: 404 }
      );
    }

    const conditionsUrl = `${ACCUWEATHER_BASE}/currentconditions/v1/${location.Key}?apikey=${encodeURIComponent(apiKey)}`;
    const condRes = await fetch(conditionsUrl, { next: { revalidate: 600 } });
    if (!condRes.ok) {
      const text = await condRes.text();
      return NextResponse.json(
        { error: "Conditions fetch failed", details: text.slice(0, 200) },
        { status: 502 }
      );
    }
    const conditions = await condRes.json();
    const current = Array.isArray(conditions) && conditions.length > 0 ? conditions[0] : null;
    if (!current) {
      return NextResponse.json(
        { error: "No current conditions" },
        { status: 502 }
      );
    }

    const temp = current.Temperature?.Metric ?? current.Temperature?.Imperial;
    return NextResponse.json({
      ok: true,
      city: location.LocalizedName ?? city,
      weatherText: current.WeatherText ?? null,
      temperature: temp ? { value: temp.Value, unit: temp.Unit } : null,
      isDayTime: current.IsDayTime ?? null,
      icon: current.WeatherIcon != null ? current.WeatherIcon : null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Weather service error", details: message },
      { status: 500 }
    );
  }
}

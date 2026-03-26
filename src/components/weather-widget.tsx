"use client";

import { useEffect, useState } from "react";

type Weather = {
  ok: true;
  city: string;
  weatherText: string | null;
  temperature: { value: number; unit: string } | null;
  isDayTime: boolean | null;
  icon: number | null;
};

export function WeatherWidget({ city = "Prishtina", className = "" }: { city?: string; className?: string }) {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const q = city ? `?city=${encodeURIComponent(city)}` : "";
    fetch(`/api/weather${q}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok && data.city) setWeather(data);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [city]);

  if (loading) {
    return (
      <div className={`border border-foreground/20 bg-foreground/5 px-4 py-3 text-sm text-foreground/70 ${className}`}>
        Weather…
      </div>
    );
  }

  if (error || !weather) {
    return null;
  }

  const temp = weather.temperature;
  const tempStr = temp ? `${temp.value}°${temp.unit ?? "C"}` : null;

  return (
    <div
      className={`border border-foreground/20 bg-foreground/5 px-4 py-3 text-sm text-foreground/85 ${className}`}
      aria-label={`Weather in ${weather.city}: ${weather.weatherText ?? ""} ${tempStr ?? ""}`}
    >
      <span className="font-semibold uppercase tracking-wide">{weather.city}</span>
      {tempStr && <span className="ml-2">{tempStr}</span>}
      {weather.weatherText && (
        <span className="ml-2 text-foreground/70">· {weather.weatherText}</span>
      )}
    </div>
  );
}

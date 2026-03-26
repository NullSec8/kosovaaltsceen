"use client";

import { format, setHours, setMinutes } from "date-fns";
import { useRef, useState } from "react";
import { DayPicker } from "react-day-picker";

type AdminDatePickerProps = {
  name: string;
  defaultValue?: string;
  required?: boolean;
  className?: string;
};

type AdminDateTimePickerProps = {
  name: string;
  defaultValue?: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
};

/** Date-only picker (value: YYYY-MM-DD). Optional dates use empty string when not set. */
export function AdminDatePicker({
  name,
  defaultValue,
  required,
  className = "",
}: AdminDatePickerProps) {
  const parsed = defaultValue?.trim()
    ? new Date(defaultValue.trim().slice(0, 10))
    : null;
  const hasInitial = parsed && !Number.isNaN(parsed.getTime());
  const [date, setDate] = useState<Date | null>(hasInitial ? parsed : null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const value = date ? format(date, "yyyy-MM-dd") : "";

  return (
    <div ref={containerRef} className="relative flex flex-wrap items-center gap-2">
      <input type="hidden" name={name} value={value} required={required} />
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 border border-white/30 bg-black px-3 py-2 text-left text-white ${className}`}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={date ? "text-white/90" : "text-white/50"}>
          {date ? format(date, "dd MMM yyyy") : "Select date (optional)"}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
          aria-hidden
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>
      {!required && date && (
        <button
          type="button"
          onClick={() => setDate(null)}
          className="border border-white/30 bg-black px-3 py-2 text-sm text-white/70 hover:text-white"
        >
          Clear
        </button>
      )}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute left-0 top-full z-50 mt-1 border border-white/30 bg-black p-3 shadow-lg"
            role="dialog"
            aria-modal="true"
            aria-label="Choose date"
          >
            <DayPicker
              mode="single"
              selected={date ?? undefined}
              onSelect={(d) => {
                if (d) {
                  setDate(d);
                  setOpen(false);
                }
              }}
              defaultMonth={date ?? new Date()}
              classNames={{
                months: "flex flex-col gap-2",
                month: "flex flex-col gap-2",
                month_caption: "flex justify-center items-center h-8 text-white font-semibold",
                weekdays: "flex gap-1",
                weekday: "w-8 text-center text-xs text-white/60",
                week: "flex gap-1",
                day: "w-8 h-8 flex items-center justify-center text-sm rounded",
                day_button: "w-full h-full rounded hover:bg-white/20 focus:bg-white/20 focus:outline-none",
                selected: "bg-accent text-white hover:bg-accent",
                today: "text-accent font-semibold",
                outside: "text-white/30",
                hidden: "invisible",
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

/** Value format: YYYY-MM-DDTHH:mm (datetime-local) or ISO string */
function parseDefault(value: string | undefined): { date: Date; time: string } {
  if (!value || !value.trim()) {
    const d = new Date();
    return {
      date: d,
      time: format(d, "HH:mm"),
    };
  }
  const str = value.trim();
  const iso = str.includes("T") ? str : `${str}T00:00:00`;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    const d = new Date();
    return { date: d, time: format(d, "HH:mm") };
  }
  return {
    date,
    time: format(date, "HH:mm"),
  };
}

function toDateTimeLocal(d: Date, time: string): string {
  const [h, m] = time.split(":").map(Number);
  const combined = setMinutes(setHours(d, h ?? 0), m ?? 0);
  return format(combined, "yyyy-MM-dd'T'HH:mm");
}

export function AdminDateTimePicker({
  name,
  defaultValue,
  required,
  className = "",
  placeholder = "Pick date and time",
}: AdminDateTimePickerProps) {
  const { date: initialDate, time: initialTime } = parseDefault(defaultValue);
  const [date, setDate] = useState<Date>(initialDate);
  const [time, setTime] = useState(initialTime);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const value = toDateTimeLocal(date, time);

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={value} required={required} />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`flex items-center gap-2 border border-white/30 bg-black px-3 py-2 text-left text-white ${className}`}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <span className="text-white/90">
            {format(date, "dd MMM yyyy")} · {time}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
            aria-hidden
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </button>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="border border-white/30 bg-black px-3 py-2 text-white"
          aria-label="Time"
        />
      </div>
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute left-0 top-full z-50 mt-1 border border-white/30 bg-black p-3 shadow-lg"
            role="dialog"
            aria-modal="true"
            aria-label="Choose date"
          >
            <DayPicker
              mode="single"
              selected={date}
              onSelect={(d) => {
                if (d) {
                  setDate(d);
                  setOpen(false);
                }
              }}
              defaultMonth={date}
              className="rdp-admin"
              classNames={{
                months: "flex flex-col gap-2",
                month: "flex flex-col gap-2",
                month_caption: "flex justify-center items-center h-8 text-white font-semibold",
                weekdays: "flex gap-1",
                weekday: "w-8 text-center text-xs text-white/60",
                week: "flex gap-1",
                day: "w-8 h-8 flex items-center justify-center text-sm rounded",
                day_button: "w-full h-full rounded hover:bg-white/20 focus:bg-white/20 focus:outline-none",
                selected: "bg-accent text-white hover:bg-accent",
                today: "text-accent font-semibold",
                outside: "text-white/30",
                hidden: "invisible",
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

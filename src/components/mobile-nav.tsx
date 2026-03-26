"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const NAV_ITEMS = [
  { href: "/bands", label: "Archive" },
  { href: "/news", label: "News" },
  { href: "/events", label: "Events" },
  { href: "/labels", label: "Labels" },
  { href: "/compare", label: "Compare" },
  { href: "/about", label: "About" },
  { href: "/suggest", label: "Suggest a band" },
];

export function MobileNav({ showAdmin }: { showAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const toggle = useCallback(() => setOpen((o) => !o), []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={toggle}
        className="flex items-center justify-center p-2 transition hover:text-accent"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60" onClick={toggle} aria-hidden />
          <nav
            className="fixed right-0 top-0 z-50 flex h-full w-64 flex-col border-l border-foreground/20 bg-background p-6"
            aria-label="Mobile navigation"
          >
            <button
              type="button"
              onClick={toggle}
              className="mb-8 self-end p-1 transition hover:text-accent"
              aria-label="Close menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <ul className="flex flex-col gap-4 text-lg uppercase tracking-wider">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block py-1 transition hover:text-accent ${pathname === item.href ? "text-accent" : ""}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {showAdmin && (
                <li>
                  <Link href="/admin" className={`block py-1 transition hover:text-accent ${pathname.startsWith("/admin") ? "text-accent" : ""}`}>
                    Admin
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}

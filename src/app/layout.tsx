import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { BackgroundCharacters } from "@/components/background-characters";
import { ColorSettings } from "@/components/color-settings";
import { CookieConsent } from "@/components/cookie-consent";
import { SiteFooter } from "@/components/site-footer";
import { VisitRecorder } from "@/components/visit-recorder";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { buildSiteOrganizationJsonLd } from "@/lib/structured-data";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://kosovoaltscene.com"),
  title: {
    default: "Kosovo Alt Scene",
    template: "%s | Kosovo Alt Scene",
  },
  description:
    "Kosovo Alt Scene is a long-term digital archive preserving alternative music history across rock, metal, punk, indie, and experimental bands from Kosovo.",
  openGraph: {
    title: "Kosovo Alt Scene",
    description:
      "A museum-like digital archive for alternative bands from Kosovo, built for long-term preservation.",
    url: "https://kosovoaltscene.com",
    siteName: "Kosovo Alt Scene",
    locale: "en_US",
    type: "website",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = buildSiteOrganizationJsonLd();

  const themeScript = `
    (function() {
      try {
        var raw = localStorage.getItem('kosovo-alt-theme');
        if (raw) {
          var t = JSON.parse(raw);
          if (t && t.background && t.foreground && t.accent) {
            document.documentElement.style.setProperty('--background', t.background);
            document.documentElement.style.setProperty('--foreground', t.foreground);
            document.documentElement.style.setProperty('--accent', t.accent);
          }
        }
      } catch (e) {}
    })();
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: organizationJsonLd }}
        />
        <ThemeProvider>
          <BackgroundCharacters />
          <div className="relative z-10 flex min-h-screen flex-col">
            <SiteHeader />
            <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-6" tabIndex={-1}>
              {children}
            </main>
            <SiteFooter />
            <CookieConsent />
            <VisitRecorder />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

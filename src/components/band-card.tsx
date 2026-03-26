"use client";

import type { BandStatus } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

type BandCardProps = {
  band: {
    name: string;
    slug: string;
    city: string;
    yearFounded: number;
    status: BandStatus;
    genres: string[];
    logoUrl?: string | null;
    images?: { imageUrl: string }[];
    label?: { name: string; slug: string } | null;
  };
};

const TILT_MAX = 8;
const ROTATE_HOVER = 1.5;
const PRESS_SCALE = 0.88;
const PRESS_DURATION_MS = 450;
const PRESS_TRANSITION_MS = 180;

export function BandCard({ band }: BandCardProps) {
  const imageUrl = band.logoUrl ?? band.images?.[0]?.imageUrl;
  const placeholderSrc = "/band-placeholder.svg";
  const [displaySrc, setDisplaySrc] = useState(imageUrl ?? placeholderSrc);
  const cardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0, rotateZ: 0 });
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    setDisplaySrc(imageUrl ?? placeholderSrc);
  }, [imageUrl, placeholderSrc]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      flushSync(() => setPressed(true));
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            router.push(`/bands/${band.slug}`);
          }, PRESS_DURATION_MS);
        });
      });
    },
    [band.slug, router],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setTransform({
        rotateX: -y * TILT_MAX,
        rotateY: x * TILT_MAX,
        rotateZ: ROTATE_HOVER,
      });
    },
    [],
  );

  const handleMouseLeave = useCallback(() => {
    setTransform({ rotateX: 0, rotateY: 0, rotateZ: 0 });
    setPressed(false);
  }, []);

  const isHovering = transform.rotateX !== 0 || transform.rotateY !== 0 || transform.rotateZ !== 0;
  const scale = pressed ? PRESS_SCALE : isHovering ? 1.02 : 1;
  const style = {
    transform: `perspective(800px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) rotateZ(${transform.rotateZ}deg) scale3d(${scale}, ${scale}, ${scale})`,
    transition: pressed
      ? `transform ${PRESS_TRANSITION_MS}ms ease-out, box-shadow ${PRESS_TRANSITION_MS}ms ease-out`
      : "transform 0.2s ease-out, box-shadow 0.2s ease-out",
    transformOrigin: "center center",
    ...(pressed ? { boxShadow: "0 8px 24px rgba(0,0,0,0.35)" } : {}),
  };

  return (
    <Link
      href={`/bands/${band.slug}`}
      className="group block"
      aria-label={`View archive entry for ${band.name}`}
      onClick={handleClick}
    >
      <div
        ref={cardRef}
        className="flex flex-col p-0"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ perspective: "800px" }}
      >
        <article
          className="flex flex-col border border-foreground/20 p-0 transition-colors group-hover:border-foreground/40"
          style={style}
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-foreground/5">
            <Image
              src={displaySrc}
              alt=""
              fill
              className="object-cover object-center"
              quality={80}
              priority={false}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
              style={{ objectFit: "cover", objectPosition: "center" }}
              onError={() => {
                if (displaySrc !== placeholderSrc) setDisplaySrc(placeholderSrc);
              }}
            />
          </div>
          <div className="flex flex-1 flex-col p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-bold uppercase tracking-wide">{band.name}</h3>
              <span
                className={`shrink-0 border px-2 py-0.5 text-xs uppercase tracking-wider ${
                  band.status === "ACTIVE" ? "border-accent text-accent" : "border-foreground/50 text-foreground/70"
                }`}
              >
                {band.status.toLowerCase()}
              </span>
            </div>
            <p className="mt-2 text-sm text-foreground/80">
              {band.city} • Founded {band.yearFounded}
              {band.label ? (
                <>
                  {" "}
                  •{" "}
                  <Link
                    href={`/labels/${band.label.slug}`}
                    className="hover:text-accent"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {band.label.name}
                  </Link>
                </>
              ) : null}
            </p>
            <p className="mt-3 text-sm text-foreground/80">{band.genres.join(" • ")}</p>
            <span className="mt-4 text-sm font-semibold uppercase tracking-wider underline decoration-foreground/50 transition group-hover:text-accent">
              View Archive Entry
            </span>
          </div>
        </article>
      </div>
    </Link>
  );
}

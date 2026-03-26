"use client";

import Image from "next/image";

/**
 * Animated background with music characters.
 * To remove: delete this file, remove <BackgroundCharacters /> from layout.tsx,
 * and optionally delete public/background-characters.png.
 */
export function BackgroundCharacters() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 animate-float-slow">
        <Image
          src="/background-characters.png"
          alt=""
          fill
          className="object-contain object-center opacity-[0.12]"
          sizes="100vw"
          priority={false}
          unoptimized
        />
      </div>
    </div>
  );
}

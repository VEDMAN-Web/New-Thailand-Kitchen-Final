"use client";

import { useEffect } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import "lenis/dist/lenis.css";

function LenisWindowBridge() {
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis) return;
    const w = window as Window & { __lenis?: typeof lenis };
    w.__lenis = lenis;
    return () => {
      if (w.__lenis === lenis) delete w.__lenis;
    };
  }, [lenis]);
  return null;
}

/**
 * Varsovia-style universal smooth scrolling (Lenis) on every page.
 * Honors prefers-reduced-motion via Lenis autoToggle.
 */
export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReactLenis
      root
      options={{
        autoRaf: true,
        lerp: 0.08,
        duration: 1.2,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.35,
        syncTouch: false,
        anchors: {
          offset: -88,
        },
        autoToggle: true,
      }}
    >
      <LenisWindowBridge />
      {children}
    </ReactLenis>
  );
}

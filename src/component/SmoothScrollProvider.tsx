"use client";

import { useEffect, useRef } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import "lenis/dist/lenis.css";

function LenisWindowBridge() {
  const lenis = useLenis();

  // Expose lenis on window for external scroll utilities
  useEffect(() => {
    if (!lenis) return;
    const w = window as Window & { __lenis?: typeof lenis };
    w.__lenis = lenis;
    return () => {
      if (w.__lenis === lenis) delete w.__lenis;
    };
  }, [lenis]);

  // Honor prefers-reduced-motion — stop/start Lenis accordingly
  useEffect(() => {
    if (!lenis) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = (reduce: boolean) => {
      if (reduce) lenis.stop();
      else lenis.start();
    };
    apply(mq.matches);
    const handler = (e: MediaQueryListEvent) => apply(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [lenis]);

  return null;
}

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        duration: 1.0,
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 2.0,
        infinite: false,
        orientation: "vertical",
        gestureOrientation: "vertical",
      }}
    >
      <LenisWindowBridge />
      {children}
    </ReactLenis>
  );
}

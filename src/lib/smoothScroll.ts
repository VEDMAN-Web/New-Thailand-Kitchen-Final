/** Smooth in-page scroll — uses Lenis when available (Varsovia-style). */

type LenisLike = {
  scrollTo: (
    target: string | number | HTMLElement,
    options?: { offset?: number; immediate?: boolean; lock?: boolean }
  ) => void;
};

function getLenis(): LenisLike | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { __lenis?: LenisLike; lenis?: LenisLike };
  return w.__lenis || w.lenis || null;
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
  );
}

export function smoothScrollToId(id: string) {
  if (typeof document === "undefined") return;
  const el = document.getElementById(id);
  if (!el) return;

  const reduce = prefersReducedMotion();
  const lenis = getLenis();
  if (lenis && !reduce) {
    lenis.scrollTo(el, { offset: -88 });
    return;
  }

  el.scrollIntoView({
    behavior: reduce ? "auto" : "smooth",
    block: "start",
  });
}

export function smoothScrollToTop() {
  if (typeof window === "undefined") return;
  const reduce = prefersReducedMotion();
  const lenis = getLenis();
  if (lenis && !reduce) {
    lenis.scrollTo(0);
    return;
  }
  window.scrollTo({
    top: 0,
    behavior: reduce ? "auto" : "smooth",
  });
}

/**
 * After a client navigation, wait one paint then scroll once.
 * Avoids the common double setTimeout flicker.
 */
export function smoothScrollAfterNav(href: string) {
  if (typeof window === "undefined") return;
  const hash = href.includes("#") ? href.split("#")[1] : "";

  const run = () => {
    if (hash) {
      const el = document.getElementById(hash);
      if (el) {
        smoothScrollToId(hash);
        return;
      }
    }
    smoothScrollToTop();
  };

  requestAnimationFrame(() => {
    requestAnimationFrame(run);
  });
}

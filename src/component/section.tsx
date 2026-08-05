"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "../i18n/LanguageProvider";
import type { TranslationKey } from "../i18n/translations";
import { useCmsSection } from "../lib/CmsHomeContext";

const defaultStats = [
  {
    titleKey: "home.stats.years" as TranslationKey,
    from: 1,
    to: 15,
    suffix: "+",
    label: "",
  },
  {
    titleKey: "home.stats.cities" as TranslationKey,
    from: 1,
    to: 12,
    suffix: "",
    label: "",
  },
  {
    titleKey: "home.stats.kitchens" as TranslationKey,
    from: 100,
    to: 800,
    suffix: "+",
    label: "",
  },
];

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function CountValue({
  from,
  to,
  suffix,
  active,
  duration = 1600,
}: {
  from: number;
  to: number;
  suffix: string;
  active: boolean;
  duration?: number;
}) {
  const [value, setValue] = useState(from);

  useEffect(() => {
    if (!active) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      const id = requestAnimationFrame(() => setValue(to));
      return () => cancelAnimationFrame(id);
    }

    let raf = 0;
    let start: number | null = null;

    const tick = (now: number) => {
      if (start === null) start = now;
      const p = Math.min((now - start) / duration, 1);
      setValue(Math.round(from + (to - from) * easeOut(p)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, from, to, duration]);

  return (
    <>
      {value}
      {suffix}
    </>
  );
}

export default function StatsSection() {
  const { t, locale } = useTranslation();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState(false);
  const cmsStats = useCmsSection<{
    items?: { label?: string; value?: string; suffix?: string }[];
  }>("statistics");

  const stats = useMemo(() => {
    const items = cmsStats?.items?.filter((i) => i?.label || i?.value) || [];
    if (!items.length) return defaultStats;

    return items.map((item, index) => {
      const numeric = parseInt(String(item.value || "").replace(/[^\d]/g, ""), 10);
      const to = Number.isFinite(numeric) ? numeric : 0;
      return {
        titleKey:
          defaultStats[index]?.titleKey ||
          ("home.stats.years" as TranslationKey),
        from: Math.max(0, Math.floor(to * 0.1)),
        to,
        suffix: item.suffix || "",
        label: item.label || "",
      };
    });
  }, [cmsStats]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let done = false;
    let io: IntersectionObserver | null = null;

    const isVisible = () => {
      const rect = el.getBoundingClientRect();
      const viewH = window.innerHeight || document.documentElement.clientHeight;
      return rect.top < viewH * 0.9 && rect.bottom > 0;
    };

    const cleanup = () => {
      io?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };

    const fire = () => {
      if (done) return;
      done = true;
      setActive(true);
      cleanup();
    };

    const onScroll = () => {
      if (isVisible()) fire();
    };

    if (isVisible()) {
      fire();
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      fire();
      return;
    }

    io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) fire();
      },
      { threshold: [0, 0.2] }
    );
    io.observe(el);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return cleanup;
  }, []);

  return (
    <section ref={sectionRef} className="bg-[#1A1A1A] py-10 lg:py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-stretch">
          {stats.map((item, index) => (
            <div
              key={`${item.label || item.titleKey}-${index}`}
              className={`flex-1 text-center py-5 sm:py-0 px-4 sm:px-8 ${
                index < stats.length - 1
                  ? "border-b sm:border-b-0 sm:border-r border-white/15"
                  : ""
              }`}
            >
              <p className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white tracking-tight tabular-nums">
                <CountValue
                  from={item.from}
                  to={item.to}
                  suffix={item.suffix}
                  active={active}
                />
              </p>
              <p className="mt-2 text-sm md:text-base text-white/55">
                {locale === "EN" && item.label ? item.label : t(item.titleKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

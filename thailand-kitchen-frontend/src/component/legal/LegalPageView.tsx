"use client";

import { useEffect, useState } from "react";
import Footer from "../Footer/footer";
import {
  parseLegalContent,
  type LegalPageContent,
  type LegalSection,
} from "./legalData";
import { fetchLegalPage } from "../../services/cmsPublic";

export default function LegalPageView({
  type,
  fallback,
}: {
  type: "privacy" | "terms";
  fallback: LegalPageContent;
}) {
  const [title, setTitle] = useState(fallback.title);
  const [subtitle, setSubtitle] = useState(fallback.subtitle);
  const [updated, setUpdated] = useState(fallback.updated);
  const [sections, setSections] = useState<LegalSection[]>(fallback.sections);

  useEffect(() => {
    let alive = true;
    fetchLegalPage(type).then((page) => {
      if (!alive || !page) return;
      if (page.title?.trim()) setTitle(page.title.trim().toUpperCase());
      if (page.subtitle?.trim()) setSubtitle(page.subtitle.trim());
      if (page.updatedLabel?.trim()) {
        const label = page.updatedLabel.trim();
        setUpdated(
          label.toLowerCase().startsWith("last updated")
            ? label
            : `Last Updated: ${label}`
        );
      }

      if (page.sections?.length) {
        setSections(
          page.sections.map((s, i) => ({
            title: String(s.title || "").trim() || `Section ${i + 1}`,
            body: String(s.body || "").trim(),
          }))
        );
        return;
      }

      const parsed = parseLegalContent(page.content || "");
      if (parsed?.length) setSections(parsed);
    });
    return () => {
      alive = false;
    };
  }, [type]);

  return (
    <div className="w-full min-h-screen bg-[#F5F3EF]">
      <main className="pt-[100px] sm:pt-[110px] pb-16 lg:pb-24 px-5 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-[#1A1A1A] text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-wide uppercase">
            {title}
          </h1>
          <p className="mt-4 text-[#1FA6A0] text-xs sm:text-sm font-bold tracking-[0.12em] uppercase leading-6">
            {subtitle}
          </p>
          <p className="mt-3 text-[#9A9A9A] text-sm">{updated}</p>
        </div>

        <article className="mt-10 sm:mt-12 max-w-3xl mx-auto bg-white rounded-[1.5rem] sm:rounded-[1.75rem] border border-[#E8E4DE] shadow-[0_8px_30px_rgba(0,0,0,0.04)] px-6 sm:px-10 py-8 sm:py-10">
          <div className="space-y-0">
            {sections.map((section, index) => (
              <section
                key={`${section.title}-${index}`}
                className={
                  index < sections.length - 1
                    ? "pb-7 mb-7 border-b border-[#EDEAE4]"
                    : ""
                }
              >
                <h2 className="text-[#1A1A1A] text-base sm:text-lg font-bold">
                  {/^\d+\./.test(section.title)
                    ? section.title
                    : `${index + 1}. ${section.title}`}
                </h2>
                <p className="mt-3 text-[#6B6B6B] text-sm sm:text-[15px] leading-7">
                  {section.body}
                </p>
              </section>
            ))}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}

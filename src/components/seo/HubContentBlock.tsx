import Image from "next/image";
import { pickCmsText } from "../../lib/cmsText";
import type { Locale } from "../../i18n/translations";

export type ContentSectionBlock = {
  heading?: unknown;
  body?: unknown;
  image?: string;
  layout?: string;
};

function splitItems(body: string): string[] {
  if (!body.trim()) return [];
  // Prefer line-based items when multiple lines exist
  if (/\n/.test(body)) {
    return body
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (body.includes("|")) {
    return body
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [body.trim()];
}

function splitTitleDesc(item: string): { title: string; desc: string } {
  if (item.includes("|")) {
    const [title, ...rest] = item.split("|");
    return { title: title.trim(), desc: rest.join("|").trim() };
  }
  if (item.includes(":")) {
    const [title, ...rest] = item.split(":");
    return { title: title.trim(), desc: rest.join(":").trim() };
  }
  const dash = item.split(/\s[–—-]\s/);
  if (dash.length > 1) {
    return { title: dash[0].trim(), desc: dash.slice(1).join(" — ").trim() };
  }
  return { title: item.trim(), desc: "" };
}

function SectionEyebrow({
  index,
  label,
}: {
  index: number;
  label?: string;
}) {
  return (
    <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[#B38B6D] mb-3">
      {label || `Section ${String(index + 1).padStart(2, "0")}`}
    </p>
  );
}

export default function HubContentBlock({
  block,
  index,
  locale = "EN",
}: {
  block: ContentSectionBlock;
  index: number;
  locale?: Locale;
}) {
  const heading = pickCmsText(block.heading, "", locale);
  const body = pickCmsText(block.body, "", locale);
  const image = String(block.image || "").trim();
  const layout = String(block.layout || "image-left").trim();
  const items = splitItems(body);

  if (!heading && !body && !image) return null;

  if (layout === "band") {
    return (
      <section className="rounded-2xl sm:rounded-3xl bg-[#1A2332] text-white px-6 sm:px-10 py-10 sm:py-14">
        <div className="max-w-3xl">
          <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#B38B6D] mb-3">
            Next step
          </p>
          {heading ? (
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl sm:text-3xl md:text-4xl leading-tight">
              {heading}
            </h2>
          ) : null}
          {body ? (
            <p className="mt-4 text-white/75 text-sm sm:text-base leading-7 whitespace-pre-line">
              {body}
            </p>
          ) : null}
        </div>
      </section>
    );
  }

  if (layout === "quote") {
    return (
      <section className="rounded-2xl border border-[#E8E4DC] bg-white px-6 sm:px-12 py-10 sm:py-14 text-center">
        <p className="text-[#B38B6D] text-3xl mb-4" aria-hidden>
          “
        </p>
        <blockquote className="font-[family-name:var(--font-cormorant)] text-2xl sm:text-3xl md:text-4xl text-[#1A2332] leading-snug max-w-3xl mx-auto">
          {heading}
        </blockquote>
        {body ? (
          <p className="mt-5 text-sm text-[#6B7280]">{body}</p>
        ) : null}
      </section>
    );
  }

  if (layout === "cards") {
    const cards = items.length
      ? items
      : body
        ? [body]
        : [];
    return (
      <section>
        <SectionEyebrow index={index} label="Highlights" />
        {heading ? (
          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl sm:text-3xl md:text-4xl text-[#1A2332] mb-8 max-w-2xl leading-tight">
            {heading}
          </h2>
        ) : null}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {cards.map((item, i) => {
            const { title, desc } = splitTitleDesc(item);
            return (
              <div
                key={`${title}-${i}`}
                className="rounded-2xl bg-white border border-[#E8E4DC] p-5 sm:p-6"
              >
                <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[#B38B6D] mb-2">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="text-base sm:text-lg font-semibold text-[#1A2332]">
                  {title}
                </h3>
                {desc ? (
                  <p className="mt-2 text-sm text-[#5C6370] leading-6">{desc}</p>
                ) : null}
              </div>
            );
          })}
        </div>
        {image ? (
          <div className="relative mt-8 aspect-[21/9] rounded-2xl overflow-hidden bg-[#E8E4DC]">
            <Image
              src={image}
              alt={heading || "Highlights"}
              fill
              className="object-cover"
              sizes="100vw"
              unoptimized={image.startsWith("/uploads") || image.startsWith("http")}
            />
          </div>
        ) : null}
      </section>
    );
  }

  if (layout === "steps") {
    const steps = items.length ? items : [];
    return (
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div>
          <SectionEyebrow index={index} label="Process" />
          {heading ? (
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl sm:text-3xl md:text-4xl text-[#1A2332] mb-8 leading-tight">
              {heading}
            </h2>
          ) : null}
          <ol className="space-y-4">
            {steps.map((step, i) => {
              const { title, desc } = splitTitleDesc(step);
              return (
                <li key={`${title}-${i}`} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1A2332] text-white text-xs font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-[#1A2332] text-sm sm:text-base">
                      {title}
                    </p>
                    {desc ? (
                      <p className="mt-1 text-sm text-[#5C6370] leading-6">{desc}</p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
        {image ? (
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#E8E4DC]">
            <Image
              src={image}
              alt={heading || "Process"}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              unoptimized={image.startsWith("/uploads") || image.startsWith("http")}
            />
          </div>
        ) : null}
      </section>
    );
  }

  if (layout === "stats") {
    const stats = items.length ? items : [];
    return (
      <section className="rounded-2xl sm:rounded-3xl bg-[#FAF8F5] border border-[#E8E4DC] px-5 sm:px-8 py-8 sm:py-10">
        {heading ? (
          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl sm:text-3xl text-[#1A2332] mb-6 text-center">
            {heading}
          </h2>
        ) : null}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {stats.map((label, i) => (
            <div
              key={`${label}-${i}`}
              className="text-center rounded-xl bg-white border border-[#EFEAE3] px-3 py-5"
            >
              <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[#B38B6D] mb-2">
                {String(i + 1).padStart(2, "0")}
              </p>
              <p className="text-sm sm:text-base font-semibold text-[#1A2332]">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (layout === "checklist") {
    const checks = items.length ? items : [];
    return (
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {image ? (
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#E8E4DC] lg:order-2">
            <Image
              src={image}
              alt={heading || "Checklist"}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              unoptimized={image.startsWith("/uploads") || image.startsWith("http")}
            />
          </div>
        ) : null}
        <div className={image ? "lg:order-1" : ""}>
          <SectionEyebrow index={index} label="What matters" />
          {heading ? (
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl sm:text-3xl md:text-4xl text-[#1A2332] mb-6 leading-tight">
              {heading}
            </h2>
          ) : null}
          <ul className="space-y-3">
            {checks.map((item, i) => (
              <li
                key={`${item}-${i}`}
                className="flex items-start gap-3 rounded-xl bg-white border border-[#E8E4DC] px-4 py-3"
              >
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2D6A4F] text-white text-[10px]"
                  aria-hidden
                >
                  ✓
                </span>
                <span className="text-sm sm:text-base text-[#1A2332] font-medium">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  if (layout === "split-dark") {
    return (
      <section className="grid grid-cols-1 lg:grid-cols-2 rounded-2xl sm:rounded-3xl overflow-hidden border border-[#E8E4DC]">
        <div className="bg-[#1A2332] text-white px-6 sm:px-10 py-10 sm:py-14 flex flex-col justify-center">
          <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#B38B6D] mb-3">
            Spotlight
          </p>
          {heading ? (
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl sm:text-3xl md:text-4xl leading-tight">
              {heading}
            </h2>
          ) : null}
          {body ? (
            <p className="mt-4 text-white/75 text-sm sm:text-base leading-7 whitespace-pre-line">
              {body}
            </p>
          ) : null}
        </div>
        <div className="relative min-h-[240px] sm:min-h-[320px] bg-[#E8E4DC]">
          {image ? (
            <Image
              src={image}
              alt={heading || "Spotlight"}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              unoptimized={image.startsWith("/uploads") || image.startsWith("http")}
            />
          ) : null}
        </div>
      </section>
    );
  }

  if (layout === "wide") {
    return (
      <section>
        {image ? (
          <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#E8E4DC] mb-6 sm:mb-8">
            <Image
              src={image}
              alt={heading || "Feature"}
              fill
              className="object-cover"
              sizes="100vw"
              unoptimized={image.startsWith("/uploads") || image.startsWith("http")}
            />
          </div>
        ) : null}
        <div className="max-w-3xl">
          <SectionEyebrow index={index} label="Feature" />
          {heading ? (
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl sm:text-3xl md:text-4xl text-[#1A2332] mb-4 leading-tight">
              {heading}
            </h2>
          ) : null}
          {body ? (
            <p className="text-[#5C6370] text-sm sm:text-base leading-7 sm:leading-8 whitespace-pre-line">
              {body}
            </p>
          ) : null}
        </div>
      </section>
    );
  }

  if (layout === "text") {
    return (
      <section className="max-w-3xl">
        <SectionEyebrow index={index} />
        {heading ? (
          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl sm:text-3xl md:text-4xl text-[#1A2332] mb-4">
            {heading}
          </h2>
        ) : null}
        {body ? (
          <div className="text-[#5C6370] text-sm sm:text-base leading-7 sm:leading-8 whitespace-pre-line">
            {body}
          </div>
        ) : null}
      </section>
    );
  }

  const imageLeft = layout !== "image-right";

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
      <div
        className={`relative aspect-[4/3] sm:aspect-[5/4] rounded-2xl overflow-hidden bg-[#E8E4DC] shadow-[0_12px_40px_rgba(26,35,50,0.08)] ${
          imageLeft ? "lg:order-1" : "lg:order-2"
        }`}
      >
        {image ? (
          <Image
            src={image}
            alt={heading || "Section image"}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            unoptimized={
              image.startsWith("/uploads") || image.startsWith("http")
            }
          />
        ) : null}
      </div>
      <div className={imageLeft ? "lg:order-2" : "lg:order-1"}>
        <SectionEyebrow index={index} />
        {heading ? (
          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl sm:text-3xl md:text-4xl text-[#1A2332] mb-4 leading-tight">
            {heading}
          </h2>
        ) : null}
        {body ? (
          <div className="text-[#5C6370] text-sm sm:text-base leading-7 sm:leading-8 whitespace-pre-line">
            {body}
          </div>
        ) : null}
      </div>
    </section>
  );
}

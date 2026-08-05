"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  footerLinks,
  contactInfo,
  socialLinks,
  type SocialIconName,
} from "./footerData";
import { useTranslation } from "../../i18n/LanguageProvider";
import { useCmsSection } from "../../lib/CmsHomeContext";

function SocialIcon({ name }: { name: SocialIconName }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "instagram":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...common}>
          <path
            d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H8v3h3v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      );
    case "whatsapp":
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <path d="M12.04 2C6.58 2 2.15 6.37 2.15 11.75c0 1.92.51 3.72 1.4 5.28L2 22l5.15-1.48a9.9 9.9 0 0 0 4.89 1.24h.01c5.46 0 9.89-4.37 9.89-9.76C21.94 6.37 17.5 2 12.04 2zm5.75 13.9c-.24.68-1.4 1.25-1.93 1.33-.49.07-1.12.1-1.81-.11-.42-.13-.95-.31-1.64-.6-2.88-1.25-4.76-4.17-4.9-4.36-.14-.19-1.15-1.53-1.15-2.92 0-1.39.73-2.07.99-2.35.26-.28.56-.35.75-.35.19 0 .38 0 .54.01.17.01.41-.07.64.49.24.58.82 2 .89 2.14.07.14.12.31.02.5-.1.19-.14.31-.28.48-.14.17-.3.38-.42.51-.14.14-.28.29-.12.56.16.28.71 1.17 1.52 1.9 1.05.94 1.93 1.23 2.21 1.37.28.14.44.12.6-.07.16-.19.7-.81.88-1.09.19-.28.37-.23.63-.14.26.1 1.64.77 1.92.91.28.14.47.21.54.33.07.12.07.68-.17 1.36z" />
        </svg>
      );
    case "x":
      return (
        <svg {...common}>
          <path
            d="M4 4l7.2 8.4L4.5 20H7l5.2-5.8L17.5 20H20l-7.5-8.8L19.5 4H17l-4.8 5.4L7.5 4H4z"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      );
  }
}

function scrollToFooterTarget(href: string) {
  const hash = href.includes("#") ? href.split("#")[1] : "";

  const run = () => {
    if (hash) {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Allow route paint / query updates before scrolling
  window.setTimeout(run, 50);
  window.setTimeout(run, 250);
}

export default function Footer() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const footerCms = useCmsSection<{
    address?: string;
    email?: string;
    phone?: string;
    facebook?: string;
    instagram?: string;
    line?: string;
  }>("footer");

  // CMS address copy is English-only — use i18n for TH/PL.
  // Email and phone are the same in every language, so they stay on CMS.
  const address =
    locale === "EN"
      ? footerCms?.address || contactInfo[0].text
      : t("footer.address");

  const contactItems = [
    {
      icon: "/footer/location.png",
      text: address,
    },
    {
      icon: "/footer/email.png",
      text: footerCms?.email || contactInfo[1].text,
    },
    {
      icon: "/footer/calling.png",
      text: footerCms?.phone || contactInfo[2].text,
    },
  ];

  const cmsSocials = socialLinks.map((s) => {
    if (s.name === "facebook" && footerCms?.facebook) {
      return { ...s, link: footerCms.facebook };
    }
    if (s.name === "instagram" && footerCms?.instagram) {
      return { ...s, link: footerCms.instagram };
    }
    if (s.name === "whatsapp" && footerCms?.line) {
      return { ...s, link: footerCms.line };
    }
    return s;
  });

  const handleFooterNav = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();

    const url = new URL(href, window.location.origin);
    const nextPath = `${url.pathname}${url.search}`;
    const currentPath = `${window.location.pathname}${window.location.search}`;
    const samePage = nextPath === currentPath;

    if (samePage) {
      scrollToFooterTarget(href);
      return;
    }

    router.push(`${url.pathname}${url.search}${url.hash}`);
    scrollToFooterTarget(href);
  };

  return (
    <footer className="relative overflow-hidden bg-[#1A1A1A]">
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 lg:pt-20 pb-10">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-12 lg:gap-10">
          <div>
            <Image
              src="/footer/logo.png"
              alt="Thailand Kitchens"
              width={150}
              height={60}
            />

            <p className="mt-6 text-white/60 leading-7 text-sm max-w-xs">
              {t("footer.tagline")}
            </p>

            <div className="flex gap-3 mt-8">
              {cmsSocials.map((item) => (
                <a
                  href={item.link}
                  key={item.name}
                  aria-label={item.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-[#B38B6D]/60 text-[#B38B6D] flex items-center justify-center bg-transparent hover:bg-[#F5F3EF] hover:border-[#F5F3EF] hover:text-[#1A1A1A] transition-colors duration-300"
                >
                  <SocialIcon name={item.name} />
                </a>
              ))}
            </div>

            <p className="mt-6 mb-0 text-white text-sm leading-6 max-w-xs">
              {t("footer.partnered")}
            </p>
          </div>

          <div>
            <h3 className="text-[#B38B6D] text-sm font-semibold tracking-wider uppercase mb-6">
              {t("footer.section.home")}
            </h3>
            <ul className="space-y-4">
              {footerLinks.home.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    onClick={(e) => handleFooterNav(e, item.href)}
                    className="text-white/70 text-sm hover:text-white transition"
                  >
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[#B38B6D] text-sm font-semibold tracking-wider uppercase mb-6">
              {t("footer.section.product")}
            </h3>
            <ul className="space-y-4">
              {footerLinks.product.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    onClick={(e) => handleFooterNav(e, item.href)}
                    className="text-white/70 text-sm hover:text-white transition"
                  >
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[#B38B6D] text-sm font-semibold tracking-wider uppercase mb-6">
              {t("footer.section.getInTouch")}
            </h3>
            <div className="space-y-5">
              {contactItems.map((item, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <div className="w-9 h-9 rounded-full border border-[#B38B6D]/50 flex items-center justify-center shrink-0">
                    <Image src={item.icon} alt="" width={16} height={16} />
                  </div>
                  <p className="text-white/70 text-sm whitespace-pre-line leading-6">
                    {item.text}
                  </p>
                </div>
              ))}
              <div className="pl-12 flex flex-row flex-wrap items-center gap-x-4 gap-y-1">
                <Link
                  href="/privacy"
                  className="text-white/70 text-[11px] leading-4 hover:text-white transition"
                >
                  {t("footer.privacy")}
                </Link>
                <Link
                  href="/terms"
                  className="text-white/70 text-[11px] leading-4 hover:text-white transition"
                >
                  {t("footer.terms")}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-10 pt-8 border-t border-white/10">
          <div
            aria-hidden
            className="pointer-events-none select-none w-full mb-3"
          >
            <svg
              viewBox="0 0 1200 90"
              className="w-full h-[clamp(2.5rem,7vw,5.5rem)]"
              preserveAspectRatio="none"
            >
              <text
                x="0"
                y="68"
                textLength="1200"
                lengthAdjust="spacingAndGlyphs"
                fill="rgba(255,255,255,0.04)"
                style={{ fontSize: 72, fontWeight: 600, fontFamily: "inherit" }}
              >
                Thailand Kitchen
              </text>
            </svg>
          </div>
          <p className="relative z-10 text-center text-white/40 text-xs">
            {t("footer.rights", { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}

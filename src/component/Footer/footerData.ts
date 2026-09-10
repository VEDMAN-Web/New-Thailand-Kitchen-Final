import type { TranslationKey } from "../../i18n/translations";

export const footerLinks: {
  home: { key: TranslationKey; href: string }[];
  product: { key: TranslationKey; href: string }[];
} = {
  home: [
    { key: "footer.link.ourStory", href: "/#our-story" },
    { key: "footer.link.freeCatalogue", href: "/catalogue" },
    { key: "footer.link.globalPartner", href: "/#brands" },
    { key: "footer.link.contact", href: "/contact" },
  ],

  product: [
    { key: "footer.link.bestSeller", href: "/products?tab=best-seller" },
    { key: "footer.link.ourProducts", href: "/products" },
  ],
};

export const contactInfo = [
  {
    icon: "/footer/location.png",
    text: "Cyber City, 610, Surat, Gujarat 394105",
  },
  {
    icon: "/footer/email.png",
    text: "hello@thailandkitchens.com",
  },
  {
    icon: "/footer/calling.png",
    text: "+66 99 359 6916",
  },
];

export type SocialIconName = "instagram" | "facebook" | "whatsapp" | "x";

export const socialLinks: { name: SocialIconName; link: string; label: string }[] = [
  { name: "instagram", link: "https://www.facebook.com/ThailandKitchens/", label: "Instagram" },
  { name: "facebook", link: "https://www.facebook.com/ThailandKitchens/", label: "Facebook" },
  { name: "whatsapp", link: "https://wa.me/99 359 6916", label: "WhatsApp" },
];

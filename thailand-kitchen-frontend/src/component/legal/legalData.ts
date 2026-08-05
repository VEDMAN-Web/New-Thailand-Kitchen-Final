export type LegalSection = {
  title: string;
  body: string;
};

export type LegalPageContent = {
  title: string;
  subtitle: string;
  updated: string;
  sections: LegalSection[];
};

export const privacyPageContent: LegalPageContent = {
  title: "PRIVACY POLICY",
  subtitle: "HOW WE COLLECT, USE, AND PROTECT YOUR PERSONAL INFORMATION.",
  updated: "Last Updated: July 2026",
  sections: [
    {
      title: "1. Information We Collect",
      body: "When you request a kitchen consultation, design quote, or contact our support team, we may collect your name, email address, phone number, property address, and project requirements. This information is used solely to provide you with our modular kitchen services.",
    },
    {
      title: "2. How We Use Your Information",
      body: "We use your data to deliver custom modular kitchen designs, coordinate site measurements and installation, and provide project updates. Your information helps us craft kitchens that perfectly match your lifestyle and Thai island home.",
    },
    {
      title: "3. Information Sharing & Security",
      body: "We do not sell or rent your personal data. Information is only shared with trusted installation partners and hardware suppliers necessary to complete your kitchen project. We implement industry-standard security measures to protect your data.",
    },
    {
      title: "4. Your Privacy Rights & Contact",
      body: "You have the right to access, correct, or delete your personal data at any time. For privacy-related inquiries or to exercise your rights, please contact us at thailandkichens@gmail.com.",
    },
  ],
};

export const termsPageContent: LegalPageContent = {
  title: "TERMS & CONDITIONS",
  subtitle: "TERMS OF USE AND SERVICE AGREEMENT FOR OUR KITCHEN SERVICES.",
  updated: "Last Updated: July 2026",
  sections: [
    {
      title: "1. Acceptance of Terms",
      body: "By accessing our website, booking a consultation, or placing an order for a modular kitchen, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our services.",
    },
    {
      title: "2. Quotations, Orders & Payment Terms",
      body: "All quotations are valid for 30 days from the date of issue. A deposit is required to commence manufacturing. The remaining balance is due upon completion of manufacturing and prior to delivery/installation, unless otherwise agreed in writing.",
    },
    {
      title: "3. Site Measurement & Installation",
      body: "Accurate site preparation (including plumbing and electrical readiness) is the client's responsibility unless otherwise contracted. Our technical team will schedule measurements and installation windows in coordination with you.",
    },
    {
      title: "4. Warranty & After-Sales Support",
      body: "We provide a 10-year structural warranty on HDMR carcase construction and Blum/Hettich hardware (subject to manufacturer terms and fair use). Cosmetic finishes and consumables may carry separate coverage as stated in your order documents.",
    },
  ],
};

/** Convert admin/CMS plain text into numbered sections when possible */
export function parseLegalContent(raw: string): LegalSection[] | null {
  const text = String(raw || "").trim();
  if (!text) return null;

  const parts = text.split(/\n(?=\d+\.\s+)/);
  if (parts.length < 2) {
    return [{ title: "Overview", body: text }];
  }

  return parts
    .map((block) => {
      const trimmed = block.trim();
      const match = trimmed.match(/^(\d+\.\s+[^\n]+)\n?([\s\S]*)$/);
      if (!match) return null;
      return {
        title: match[1].trim(),
        body: match[2].trim(),
      };
    })
    .filter(Boolean) as LegalSection[];
}

"use client";

import { ScrollText } from "lucide-react";
import LegalEditor from "@/components/LegalEditor";

export default function AdminTermsPage() {
  return (
    <div className="space-y-4">
        <div className="flex items-center gap-2 text-[#5C6370]">
          <ScrollText className="w-4 h-4" />
          <p className="text-sm">
            Manage English / Thai / Polish terms shown on the public site.
          </p>
        </div>
        <LegalEditor
          type="terms"
          defaultTitle="TERMS & CONDITIONS"
          defaultSubtitle="TERMS OF USE AND SERVICE AGREEMENT FOR OUR KITCHEN SERVICES."
        />
      </div>
    
  );
}

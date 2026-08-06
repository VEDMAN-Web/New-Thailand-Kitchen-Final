"use client";

import { Shield } from "lucide-react";
import LegalEditor from "@/components/LegalEditor";

export default function AdminPrivacyPage() {
  return (
    <div className="space-y-4">
        <div className="flex items-center gap-2 text-[#5C6370]">
          <Shield className="w-4 h-4" />
          <p className="text-sm">
            Manage English / Thai / Polish privacy policy on the public site.
          </p>
        </div>
        <LegalEditor
          type="privacy"
          defaultTitle="PRIVACY POLICY"
          defaultSubtitle="HOW WE COLLECT, USE, AND PROTECT YOUR PERSONAL INFORMATION."
        />
      </div>
    
  );
}

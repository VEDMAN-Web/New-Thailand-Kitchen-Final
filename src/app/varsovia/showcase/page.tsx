"use client";

import ShowcaseHubEditor from "@/components/ShowcaseHubEditor";
import { ResourceManager } from "@/app/varsovia/page";

/**
 * Showcase hub — listing + mega-menu copy, then project cards that match
 * live /projects and /projects/[id].
 */
export default function VarsoviaShowcasePage() {
  return (
    <div className="space-y-6">
      <ShowcaseHubEditor />

      <div>
        <h2 className="text-sm font-semibold text-[#1A2332] mb-1">
          Showcase projects
        </h2>
        <p className="text-xs text-[#6B7280] mb-3">
          Each card is a listing on /projects and a detail page at /projects/[id].
          Cover + 10 gallery slots (Kitchen 5, Bathroom 5) match the live photos.
        </p>
        <ResourceManager resource="showcases" embedded />
      </div>
    </div>
  );
}

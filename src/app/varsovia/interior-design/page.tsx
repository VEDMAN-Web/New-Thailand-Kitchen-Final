"use client";

import VarsoviaHubLandingEditor from "@/components/VarsoviaHubLandingEditor";
import { ResourceManager } from "@/app/varsovia/page";

const HUB_KEY = "interiorDesign";

/**
 * Interior Design hub — same CMS stack as Furniture (banner → intro → blocks →
 * Explore). Explore cards are the `projects` catalogue, not IA children.
 */
export default function VarsoviaInteriorDesignPage() {
  return (
    <div className="space-y-6">
      <VarsoviaHubLandingEditor
        hubKey={HUB_KEY}
        label="Interior Design"
        helpText="Matches live /interior-design from top to bottom: banner, intro, content blocks, then the project catalogue."
      />

      <div>
        <h2 className="text-sm font-semibold text-[#1A2332] mb-1">
          Explore — interior projects
        </h2>
            <p className="text-xs text-[#6B7280] mb-3">
          Each card is a listing on /interior-design and a detail page at
          /interior-design/[slug]. Save the card sheet (or the page Save while
          the sheet is open) so live uses these fields — Card description is the
          overlay sentence on the photo.
        </p>
        <ResourceManager resource="projects" embedded />
      </div>
    </div>
  );
}

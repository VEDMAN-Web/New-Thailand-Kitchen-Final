"use client";

import VarsoviaHubLandingEditor from "@/components/VarsoviaHubLandingEditor";
import { ResourceManager } from "@/app/varsovia/page";

const HUB_KEY = "interiorDesign";

/**
 * Interior Design hub. Unlike Furniture/Complete Interiors/etc, this hub's item
 * list is NOT `pages.interiorDesign.children[]` — it's backed by the separate
 * `projects` resource (see src/services/varsoviaAPI.ts), same data used by the
 * "Interior catalogue" library and the homepage "featured" section. So the hero
 * uses the same generic VarsoviaHubLandingEditor as every other hub, but the
 * item list below reuses the existing generic ResourceManager for "projects"
 * instead of the children-array editor the other hubs use.
 */
export default function VarsoviaInteriorDesignPage() {
  return (
    <div className="space-y-6">
      <VarsoviaHubLandingEditor hubKey={HUB_KEY} label="Interior Design" />

      <div>
        <h2 className="text-sm font-semibold text-[#1A2332] mb-3">
          Interior Design projects
        </h2>
        <ResourceManager resource="projects" embedded />
      </div>
    </div>
  );
}

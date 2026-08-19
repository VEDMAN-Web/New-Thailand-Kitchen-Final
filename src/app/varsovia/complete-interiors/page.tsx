"use client";

import VarsoviaIaChildrenHubPage from "@/app/varsovia/VarsoviaIaChildrenHubPage";

export default function VarsoviaCompleteInteriorsPage() {
  return (
    <VarsoviaIaChildrenHubPage
      hubKey="completeInteriors"
      label="Complete Interiors"
      pathLabel="/complete-interiors"
      helpText="Matches live /complete-interiors from top to bottom: banner, intro, story blocks, then programme cards (villas, condos, hotels & resorts, developers). Each card is /complete-interiors/[slug]."
      itemNoun="programme"
      addLabel="Add programme page"
      searchPlaceholder="Search programmes… villas, condos…"
      emptyLabel="No programme pages yet"
      slugPlaceholder="villas"
      cardFallbackImage="/home/stories/story-1.jpg"
      savedToast="Complete Interiors page saved"
      loadError="Failed to load Complete Interiors pages"
    />
  );
}

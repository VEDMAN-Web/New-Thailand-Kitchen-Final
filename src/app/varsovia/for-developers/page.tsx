"use client";

import VarsoviaIaChildrenHubPage from "@/app/varsovia/VarsoviaIaChildrenHubPage";

export default function VarsoviaForDevelopersPage() {
  return (
    <VarsoviaIaChildrenHubPage
      hubKey="forDevelopers"
      label="For Developers"
      pathLabel="/for-developers"
      helpText="1:1 with live /for-developers: 1 banner → 2 intro → 3 photo+copy blocks → 4 Google (title ≤60, description ≤160, indexable). Sync from DB fills all of these in EN / TH / PL. Indexable stays ON if already enabled. No sub-page cards on the live site."
      itemNoun="page"
      addLabel="Add page"
      searchPlaceholder=""
      emptyLabel=""
      slugPlaceholder=""
      cardFallbackImage="/home/core/core-4.jpg"
      savedToast="For Developers page saved"
      loadError="Failed to load For Developers page"
      showExplore={false}
      showChildren={false}
    />
  );
}

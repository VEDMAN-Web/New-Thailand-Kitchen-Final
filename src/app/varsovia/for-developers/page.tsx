"use client";

import VarsoviaIaChildrenHubPage from "@/app/varsovia/VarsoviaIaChildrenHubPage";

export default function VarsoviaForDevelopersPage() {
  return (
    <VarsoviaIaChildrenHubPage
      hubKey="forDevelopers"
      label="For Developers"
      pathLabel="/for-developers"
      helpText="Matches live /for-developers: banner, intro, story blocks, then Google. This is a standalone page — no sub-page cards on the live site."
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

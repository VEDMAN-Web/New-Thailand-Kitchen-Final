"use client";

import { ResourceManager } from "@/app/varsovia/page";
import VarsoviaIaChildrenHubPage from "@/app/varsovia/VarsoviaIaChildrenHubPage";

export default function VarsoviaJournalPage() {
  return (
    <VarsoviaIaChildrenHubPage
      hubKey="journal"
      label="Journal"
      pathLabel="/journal"
      helpText="Matches live /journal: banner, intro, story blocks, topic cards, then all articles. Each topic is /journal/topic/[slug]."
      itemNoun="topic"
      addLabel="Add journal topic"
      searchPlaceholder="Search topics… kitchens, materials…"
      emptyLabel="No journal topics yet"
      slugPlaceholder="kitchens"
      cardFallbackImage="/blog/blog1.jpg"
      savedToast="Journal topic saved"
      loadError="Failed to load journal pages"
      childPath={(slug) => `/journal/topic/${slug}`}
      defaultRelatedTitle="Articles in this topic"
      extraAfterCards={
        <div className="rounded-2xl border border-[#E8EAED] bg-white p-5">
          <p className="mb-4 text-sm font-semibold text-[#1A2332]">
            All articles — same cards as live /journal
          </p>
          <ResourceManager resource="blogs" embedded />
        </div>
      }
    />
  );
}

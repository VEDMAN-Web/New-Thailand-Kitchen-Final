"use client";

import { ResourceManager } from "@/app/varsovia/page";
import VarsoviaIaChildrenHubPage from "@/app/varsovia/VarsoviaIaChildrenHubPage";
import JournalArticleFooterCtasEditor from "@/components/JournalArticleFooterCtasEditor";

export default function VarsoviaJournalPage() {
  return (
    <VarsoviaIaChildrenHubPage
      hubKey="journal"
      label="Journal"
      pathLabel="/journal"
      helpText="Matches live /journal and every /journal/p/[id]: banner, intro, stories, topics, all articles, then Contact Varsovia + kitchen offer. Sync from DB fills the same copy."
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
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#E8EAED] bg-white p-5">
            <p className="mb-4 text-sm font-semibold text-[#1A2332]">
              All articles — same cards as live /journal
            </p>
            <ResourceManager resource="blogs" embedded />
          </div>
          <JournalArticleFooterCtasEditor />
        </div>
      }
    />
  );
}

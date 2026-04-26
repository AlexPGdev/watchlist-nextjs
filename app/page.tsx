"use client";

import { FilterTab } from "./components/FilterTab";
import { Header } from "./components/Header";
import { ContentDetailsModal } from "./components/modals/ContentDetailsModal";
import { ContentCard } from "./components/ContentCard";
import { ContentGrid } from "./components/ContentGrid";
import { Stats } from "./components/Stats";
import settings from "./constants/settings.json";
import { useContent } from "./hooks/useContent";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Content } from "./types/content";
import { LayoutGroup } from "motion/react";


export default function Home() {
  const { 
    content, 
    stats,
    addContent,
    toggleWatched,
    removeContent
  } = useContent();

  const [showModal, setShowModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);

  const scrollToSection = (section: number) => {
    return () => {
      const sectionElement = document.getElementById(`section-${section}`)
      if (!sectionElement) return

      const offset = sectionElement.offsetTop - 100
      window.scrollTo({ top: offset, behavior: 'smooth' })
    }
  }

  const handleContentClick = useCallback((content: Content) => {
    setSelectedContent(content)
    setShowModal(true)
  }, []);

  const handleStatusChange = useCallback((id: number) => {
      toggleWatched(id);
  }, [toggleWatched]);

  const handleRemoveContent = useCallback((id: number) => {
      removeContent(id);
  }, [removeContent]);

  // const handleAddContent = (tmdbId: number, mediaType: string, logged: boolean) => {
  //   addContent(tmdbId, mediaType, logged)
  // }

  return (
    <div className="page flex flex-col p-4 sm:p-6 md:p-10 md:px-[15%] lg:px-[20%] gap-6 md:gap-10">
      <Header />
      <Stats stats={stats} />

      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">Watchlist</h1>
        <input type="text" placeholder="Search..." className="w-full bg-black/50 rounded-2xl border-1 border-cyan-800 p-2 px-4 shadow-xs shadow-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-500" />

        <FilterTab scrollToSection={scrollToSection} />

        <LayoutGroup>
          <ContentGrid
            content={content} 
            onContentClick={handleContentClick}
            onStatusChange={handleStatusChange}
            onRemoveContent={handleRemoveContent}
          />
        </LayoutGroup>

        <ContentDetailsModal content={selectedContent} onClose={() => setShowModal(false)} open={showModal} />


      </div>
    </div>
  )
}
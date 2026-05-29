"use client";

import { FilterTab } from "./components/FilterTab";
import { Header } from "./components/Header";
import { ContentDetailsModal } from "./components/modals/ContentDetailsModal";
import { ContentCard } from "./components/ContentCard";
import { ContentGrid } from "./components/ContentGrid";
import { Stats } from "./components/Stats";
import settings from "./constants/settings.json";
import { useContent } from "./hooks/useContent";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Content } from "./types/content";
import { LayoutGroup } from "motion/react";
import { LoginModal } from "./components/modals/LoginModal";
import { useRouter } from "next/navigation";


export default function Home() {
  const { 
    content, 
    stats,
    addContent,
    toggleWatched,
    removeContent
  } = useContent();

  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);

  const [showLoginModal, setShowLoginModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentScrollIndex, setCurrentScrollIndex] = useState(0);
  const [focusedTitle, setFocusedTitle] = useState('');

  useEffect(() => {
    let debounceTimeout = setTimeout(() => {
      setSearchResults([])
      // console.log("Search query:", searchQuery)
      document.querySelectorAll('.content-card').forEach((card) => {
        if(`${card.id}`.toLowerCase().includes(searchQuery.toLowerCase())) {
          // card.classList.add('active')
          // card.scrollIntoView({ behavior: 'smooth', block: 'center' })
          setSearchResults(prevResults => {
            if(!prevResults.some(result => result.id === card.id)) {
              return [...prevResults, { card }]
            } else {
              return prevResults
            }
          })

          setFocusedTitle(searchQuery.toLowerCase())
        }
      })
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery])

  useEffect(() => {
    if(searchResults.length > 0) {
      if(searchResults[currentScrollIndex]){
        searchResults[currentScrollIndex].card.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } else {
        setCurrentScrollIndex(0)
      }
    }
  }, [searchResults, currentScrollIndex]);
  

  const scrollToSection = (section: number) => {
    return () => {
      const sectionElement = document.getElementById(`section-${section}`)
      if (!sectionElement) return

      const offset = sectionElement.offsetTop - 100
      window.scrollTo({ top: offset, behavior: 'smooth' })
    }
  }

  const handleContentClick = useCallback((content: Content) => {
    console.log(`Content clicked: ${content.title}`)
    router.push(`?${content.contentType.toLowerCase()}=${content.tmdbId}`, { scroll: false })
    setSelectedContent(content)
    setShowModal(true)

    // setTimeout(() => {
    //   setSelectedContent(newContent[0])
    // }, 5000)
  }, []);

  const handleStatusChange = useCallback((id: number) => {
      toggleWatched(id);
  }, [toggleWatched]);

  const handleRemoveContent = useCallback((id: number) => {
      removeContent(id);
  }, [removeContent]);

  const handleOpenSearchResult = useCallback((result: any) => {
    router.push(`?${result.mediaType.toLowerCase()}=${result.id}`, { scroll: false })
    setSelectedContent(result)
    setShowModal(true)
  }, []);



  // const handleAddContent = (tmdbId: number, mediaType: string, logged: boolean) => {
  //   addContent(tmdbId, mediaType, logged)
  // }

  return (
    <div className="page flex flex-col p-4 sm:p-4 md:p-4 md:px-[15%] lg:px-[18%] gap-5 md:gap-5">
      <Header onOpen={() => setShowLoginModal(true)} onOpenSearchResult={handleOpenSearchResult} />
      <Stats stats={stats} />

      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">Watchlist</h1>

        <FilterTab scrollToSection={scrollToSection} searchQuery={searchQuery} onSearchChange={(query) => setSearchQuery(query)} onEnterPress={() => setCurrentScrollIndex(currentScrollIndex + 1)} />

        <LayoutGroup>
          <ContentGrid
            content={content} 
            onContentClick={handleContentClick}
            onStatusChange={handleStatusChange}
            onRemoveContent={handleRemoveContent}
            fromWatchlist={true}
            focusedTitle={focusedTitle}
          />
        </LayoutGroup>

        <Suspense fallback={null}>
          <ContentDetailsModal selectedContent={selectedContent} onClose={() => setShowModal(false)} open={showModal} />
        </Suspense>

        
        <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />

      </div>
    </div>
  )
}
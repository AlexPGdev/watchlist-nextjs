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

  const [filteredContent, setFilteredContent] = useState<Content[]>(content)

  const [showModal, setShowModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);

  const [showLoginModal, setShowLoginModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentScrollIndex, setCurrentScrollIndex] = useState(0);
  const [focusedTitle, setFocusedTitle] = useState('');

  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({})

  const [showRecentWatched, setShowRecentWatched] = useState(false)
  const [quickViewRemainingMs, setQuickViewRemainingMs] = useState(0)

  useEffect(() => {
    setFilteredContent(content)
  }, [content])

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

  useEffect(() => {
    setFilteredContent(content.filter((c) => {
      let matches = true

      if (selectedFilters.year && selectedFilters.year.length > 0) {
        matches = matches && selectedFilters.year.includes(c.releaseDate?.substring(0, 4) ?? "")
      }

      if (selectedFilters.genre && selectedFilters.genre.length > 0) {
        matches = matches && selectedFilters.genre.some((g) => c.genres?.includes(g))
      }

      return matches
    }))
  }, [content, selectedFilters])
  
  const recentWatched = useMemo(() => {
    const watchedItems = content.filter((c) => c.watched && c.watchDate)
    if (watchedItems.length === 0) return null
    return watchedItems.reduce((a, b) => (a.watchDate > b.watchDate ? a : b))
  }, [content])

  const quickViewDurationMs = useMemo(() => {
    if (!recentWatched) return 0
    return ((recentWatched.runtime || 0) + 30) * 60_000
  }, [recentWatched])

  const quickViewExpiresIn = useMemo(() => {
    if (!showRecentWatched || quickViewRemainingMs <= 0) return ""
    const totalMinutes = Math.ceil(quickViewRemainingMs / 60_000)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    if (hours === 0) {
      return `${minutes}m`
    }

    return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`
  }, [quickViewRemainingMs, showRecentWatched])

  const quickViewProgress = useMemo(() => {
    if (!quickViewDurationMs || quickViewRemainingMs <= 0) return 0
    return (quickViewRemainingMs / quickViewDurationMs) * 100
  }, [quickViewDurationMs, quickViewRemainingMs])

  useEffect(() => {
    const updateRecentWatched = () => {
      if (!recentWatched?.watchDate || quickViewDurationMs <= 0) {
        setShowRecentWatched(false)
        setQuickViewRemainingMs(0)
        return false
      }

      const elapsed = Date.now() - recentWatched.watchDate
      const remaining = quickViewDurationMs - elapsed
      const isActive = remaining > 0

      setQuickViewRemainingMs(Math.max(0, remaining))
      setShowRecentWatched(isActive)
      return isActive
    }

    const isActive = updateRecentWatched()
    if (!isActive) return

    const interval = setInterval(() => {
      if (!updateRecentWatched()) {
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [content, recentWatched, quickViewDurationMs])
  

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
    <div className="page flex flex-col p-4 sm:p-4 md:p-4 lg:px-[10%] xl:px-[18%] gap-5 md:gap-5 tracking-wider">
      <Header onOpen={() => setShowLoginModal(true)} onOpenSearchResult={handleOpenSearchResult} />
      <Stats stats={stats} />

      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">Watchlist</h1>

        
        {showRecentWatched ? (
          <button className="flex flex-col gap-2 p-2 text-start rounded-2xl bg-cyan-800/40 hover:bg-cyan-700/60 transition-all select-none cursor-pointer" onClick={handleContentClick.bind(null, recentWatched as Content)}>
            <p className="text-lg font-semibold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>Quick View</p>
            <div className="flex gap-2">
              <img src={`https://image.tmdb.org/t/p/original/${recentWatched?.posterPath}`} className="h-25 w-auto rounded-lg" alt={recentWatched?.title} />
              <div className="flex flex-col justify-between">
                <div>
                  <p className="text-lg font-bold leading-none" style={{ color: `rgba(${settings.primaryColor}, 1)` }}>{recentWatched?.title}</p>
                  <p className="text-sm font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>{recentWatched?.releaseDate.substring(0, 4)}</p>
                </div>

                  <p className="text-xs font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>
                    Marked as watched at {recentWatched?.watchDate ? new Date(recentWatched?.watchDate).toLocaleTimeString([], { timeStyle: 'short', hourCycle: 'h24' }) : ''}
                  </p>
                <div>
                  {showRecentWatched ? (
                    <div className="flex flex-col gap-1">
                      <p className="text-xs font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>
                        Quick View expires in {quickViewExpiresIn}
                      </p>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                        <div
                          className="h-full rounded-full bg-cyan-400 transition-all duration-300"
                          style={{ width: `${quickViewProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </button>
        ) : null}

        <FilterTab content={content} scrollToSection={scrollToSection} searchQuery={searchQuery} onSearchChange={(query) => setSearchQuery(query)} onEnterPress={() => setCurrentScrollIndex(currentScrollIndex + 1)} onChangeFilters={(filters) => setSelectedFilters(filters)} />

        <LayoutGroup>
          <ContentGrid
            content={filteredContent} 
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
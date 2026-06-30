"use client";

import { FilterTab } from "@/components/FilterTab";
import { Header } from "@/components/Header";
import { ContentDetailsModal } from "@/components/modals/ContentDetailsModal";
import { ContentGrid, ContentGridHandle } from "@/components/ContentGrid";
import { Stats } from "@/components/Stats";
import settings from "@/constants/settings.json";
import { useContent } from "@/hooks/useContent";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Content } from "@/types/content";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useAuth as useWorkOSAuth } from "@workos-inc/authkit-nextjs/components";
import { useAuth } from "./hooks/useAuth";

export default function Home() {
  const { 
    page, 
    stats,
    toggleWatched,
    removeContent,
    setUsername,
  } = useContent();

  const { user, loading, refreshAuth } = useWorkOSAuth();
  const { user: customUser, authLoaded } = useAuth();

  const router = useRouter();

  const [filteredContent, setFilteredContent] = useState<Content[]>(page.pageContentDTOS);

  const [showModal, setShowModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [hasDismissedUsernameModal, setHasDismissedUsernameModal] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameError, setUsernameError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentScrollIndex, setCurrentScrollIndex] = useState(0);
  const [focusedTitle, setFocusedTitle] = useState('');

  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({})

  const [showRecentWatched, setShowRecentWatched] = useState(false)
  const [quickViewRemainingMs, setQuickViewRemainingMs] = useState(0)

  const searchParams = useSearchParams();
  const [type, id] = [...searchParams.entries()][0] || [];

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, [user, loading]);

  useEffect(() => {
    if (authLoaded && customUser?.usernameSet === false && !hasDismissedUsernameModal) {
      setShowUsernameModal(true);
    }
  }, [authLoaded, customUser?.usernameSet, hasDismissedUsernameModal]);

  // console.log({type, id})

  useEffect(() => {
    if(type && id) {
      setSelectedContent({id: id, type: type})
      setShowModal(true)
    }
  }, [])

  useEffect(() => {
    setFilteredContent(page.pageContentDTOS)
  }, [page])

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
    if(!page.pageContentDTOS || page.pageContentDTOS.length === 0) return
    
    setFilteredContent(page.pageContentDTOS.filter((c) => {
      let matches = true

      if (selectedFilters.year && selectedFilters.year.length > 0) {
        matches = matches && selectedFilters.year.includes(c.releaseDate?.substring(0, 4) ?? "")
      }

      if (selectedFilters.genre && selectedFilters.genre.length > 0) {
        matches = matches && selectedFilters.genre.some((g) => c.genres?.includes(g))
      }

      return matches
    }))
  }, [page.pageContentDTOS, selectedFilters])
  
  const recentWatched = useMemo(() => {
    if(!page.pageContentDTOS || page.pageContentDTOS.length === 0) return null
    const watchedItems = page.pageContentDTOS.filter((c) => c.watched && c.watchDate)
    if (watchedItems.length === 0) return null
    return watchedItems.reduce((a, b) => (a.watchDate > b.watchDate ? a : b))
  }, [page.pageContentDTOS])

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
  }, [page.pageContentDTOS, recentWatched, quickViewDurationMs])
  

  const contentGridRef = useRef<ContentGridHandle>(null);

  const scrollToSection = (section: number) => {
    return () => {
      contentGridRef.current?.scrollToSection(section);
    };
  };

  const handleContentClick = useCallback((content: Content) => {
    let scrollY = window.scrollY

    let contentType = content.movies ? "collection" : content.contentType.toLowerCase()

    router.push(`?${contentType}=${content.tmdbId ? content.tmdbId : content.id}`, { scroll: false })
    setSelectedContent(content)
    setShowModal(true)

    setTimeout(() => {
      window.scrollTo(0, scrollY)
      scrollY = 0
    }, 300)
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

  const handleUsernameSubmit = useCallback(() => {
    const trimmedUsername = usernameInput.trim();

    if (!trimmedUsername) {
      setUsernameError("Please enter a username.");
      return;
    }

    if (trimmedUsername.length < 2 || trimmedUsername.length > 20) {
      setUsernameError("Username must be between 2 and 20 characters.");
      return;
    }

      setUsername(trimmedUsername)
      .then((data) => {
        if (data.error) {
          setUsernameError(data.error);
        } else {
          setUsernameError("");
          void refreshAuth({ ensureSignedIn: true });
        }
      })
      .catch((error) => {
        console.error("Error setting username:", error);
        setUsernameError("An error occurred. Please try again.");
      });

    setUsernameError("");
    setUsernameInput("");
    setShowUsernameModal(false);
    setHasDismissedUsernameModal(true);
  }, [usernameInput]);

  return (
    <div className="page flex flex-col p-4 sm:p-4 md:p-4 lg:px-[10%] xl:px-[18%] gap-5 md:gap-5 tracking-wider">
      <Header onOpenSearchResult={handleOpenSearchResult} />
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

        <FilterTab content={page.pageContentDTOS} scrollToSection={scrollToSection} searchQuery={searchQuery} onSearchChange={(query) => setSearchQuery(query)} onEnterPress={() => setCurrentScrollIndex(currentScrollIndex + 1)} onChangeFilters={(filters) => setSelectedFilters(filters)} />

        {mounted && !loading && !user && (
          <div className="text-center text-xl font-semibold flex flex-col gap-2 justify-center items-center">
            <p>Log in to view your watchlist</p>
            <button
                className="p-3 px-6 w-fit uppercase rounded-full bg-cyan-800/80 font-bold tracking-widest text-sm shadow-inner shadow-cyan-200/30 cursor-pointer hover:scale-105 transition-all"
                style={{color: `rgba(${settings.primaryColor}, 1)`}}
                onClick={() => void refreshAuth({ ensureSignedIn: true })}
            >
                Login
            </button>
          </div>
        )}

        <AnimatePresence>
          {showUsernameModal && (
            <motion.div
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-full max-w-md rounded-3xl border border-cyan-400/30 bg-black/80 p-6 shadow-2xl shadow-cyan-900/40"
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">One last step</p>
                    <h2 className="text-2xl font-semibold text-white">Set your username</h2>
                  </div>

                  <p className="text-sm text-zinc-300">
                    The username will be your unique identifier throughout the app.
                  </p>

                  <label className="flex flex-col gap-2 text-sm font-medium text-zinc-200">
                    Username
                    <input
                      value={usernameInput}
                      onChange={(event) => {
                        setUsernameInput(event.target.value);
                        if (usernameError) setUsernameError("");
                      }}
                      placeholder="Enter your username"
                      className="rounded-2xl border border-cyan-400/30 bg-white/10 px-3 py-2 text-white outline-none ring-0 placeholder:text-zinc-500 focus:border-cyan-400"
                    />
                  </label>

                  {usernameError ? <p className="text-sm text-rose-400">{usernameError}</p> : null}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={handleUsernameSubmit}
                      className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-cyan-400"
                    >
                      Save username
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <LayoutGroup>
          <ContentGrid
            ref={contentGridRef}
            content={filteredContent}
            onContentClick={handleContentClick}
            onStatusChange={handleStatusChange}
            onRemoveContent={handleRemoveContent}
            fromWatchlist={true}
            focusedTitle={focusedTitle}
            ownerPage={true}
          />
        </LayoutGroup>

        <Suspense fallback={null}>
          <ContentDetailsModal selectedContent={selectedContent} onClose={() => setShowModal(false)} open={showModal} />
        </Suspense>

      </div>
    </div>
  )
}
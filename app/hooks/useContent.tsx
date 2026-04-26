"use client"

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, memo } from "react"
import type { Content } from "../types/content";
import Cookies from 'js-cookie'

interface ContentContextType {
  content: Content[]
  stats: {
      total: number
      watched: number
      toWatch: number
      dailyStreak: number
  }
  currentFilter: string
  searchQuery: string
  setSearchQuery: (q: string) => void
  setCurrentFilter: (f: string) => void
  loadContent: () => Promise<void>
  setContent: React.Dispatch<React.SetStateAction<Content[]>>
  loading: boolean,
  addContent: (tmdbId: number, mediaType: string, logged: boolean) => Promise<Content>
  removeContent: (id: number) => Promise<void>
  toggleWatched: (id: number) => Promise<void>
  addToFavorites: (id: number) => Promise<Content>
  filterContentType: (index: number) => void
  filterType: number
}

function useDailyStreak(content: Content[]) {
    return useMemo(() => {
        if (!content || content.length === 0) return 0;

        const watchedDays = Array.from(
        new Set(
            content
            .filter((m) => m.watched && m.watchDate)
            .map((m) => {
                const d = new Date(m.watchDate);
                d.setHours(0, 0, 0, 0);
                return d.getTime();
            })
        )
        );

        if (watchedDays.length === 0) return 0;

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let currentDay = new Date(today);
        if (!watchedDays.includes(today.getTime())) {
            currentDay.setDate(currentDay.getDate() - 1);
        }

        while (watchedDays.includes(currentDay.getTime())) {
            streak++;
            currentDay.setDate(currentDay.getDate() - 1);
        }

        return streak;
    }, [content]);
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider = memo(function ContentProvider({ children }: { children: React.ReactNode }) {
    const [content, setContent] = React.useState<Content[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [currentFilter, setCurrentFilter] = React.useState('toWatch');
    const [filterType, setFilterType] = React.useState(0);

    const dailyStreak = useDailyStreak(content);

    const stats = useMemo(
        () => ({
            total: (content && content.length > 0) ? content.length : 0,
            watched: (content && content.length > 0) ? content.filter((c) => c.watched).length : 0,
            toWatch: (content && content.length > 0) ? content.filter((c) => !c.watched).length : 0,
            dailyStreak: (content && content.length > 0) ? dailyStreak : 0,
        }),
        [content, dailyStreak]
    );

    React.useEffect(() => {
        loadContent();
    }, []);

    const loadContent = useCallback(async () => {
        setLoading(true);
        fetch(`https://api.spectaer.com/watchlist/api/page`, {
            "method": "GET",
            "headers": {
                "Content-Type": "application/json",
                "Authorization": `RememberMe ${Cookies.get('rememberMeToken')}`
            },
        })
        .then(response => response.json())
        .then(data => {
            setContent(data.pageContentDTOS)

            setError(null);
        })
        .finally(() => {
            setLoading(false)
        });
    }, [])

    const filterAndSearchContent = useCallback(() => {
        if(content && content.length > 0) {
            let filtered = [...content];
            
            if (searchQuery) {
                filtered = filtered.filter(content => 
                    content.title.toLowerCase().includes(searchQuery.toLowerCase())
                );
            };
            setContent(filtered);
        } else {
            setContent([]);
        }
    }, [content, searchQuery])

    const addContent = async (tmdbId: number, mediaType: string, logged: boolean) => {
        try {
            const response = await fetch(`https://api.spectaer.com/watchlist/api/page-content?tmdbId=${tmdbId}&type=${mediaType}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `RememberMe ${Cookies.get('rememberMeToken')}`
                },
                // body: JSON.stringify({ ...content, force }),
            })

            if (!response.ok) {
                if (response.status === 409) {
                    const error = new Error("duplicate") as any
                    error.content = content
                    throw error
                }
                throw new Error("Failed to add content")
            }
            
            const addedContent = await response.json()

            if(logged) {
                const response = await fetch(`https://api.spectaer.com/watchlist/api/page-content/${addedContent.id}/watch?logged=${logged}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `RememberMe ${Cookies.get('rememberMeToken')}`
                    },
                    // body: JSON.stringify({ ...content, force }),
                })

                if (!response.ok) {
                    throw new Error("Failed to update watch status")
                }
            }

            // loadContent()

            setContent(prev => [...prev, addedContent])

            // loadExternalRatings(addedContent.tmdbId, addedContent.title, mediaType, addedContent.id, onRatingsUpdated)

            // if(addedContent.imdbRating === 0 || addedContent.rtRating === null) {
            //     loadExtraDetails(addedContent.id, addedContent.tmdbId, addedContent.posterPath, onRatingsUpdated)
            // }
            // loadAmbientColor(addedContent.id, addedContent.posterPath)

            // loadExternalRatings(addedContent.imdbId, addedContent.id, onRatingsUpdated)

            return addedContent
        } catch (error) {
            throw error
        }
    }

    const removeContent = useCallback(async (id: number) => {
        setContent(prev => prev.filter(m => m.id !== id));
        
        fetch(`https://api.spectaer.com/watchlist/api/page-content/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `RememberMe ${Cookies.get('rememberMeToken')}`
            }
        }).catch(err => console.error("Error removing content:", err));
    }, []);

    const toggleWatched = useCallback(async (id: number) => {
        let type: "started" | "watched" | undefined;

        setContent(prev => {
            const contentToToggle = prev.find(c => c.id === id);
            if (!contentToToggle) return prev;

            type = (() => {
                if (contentToToggle.contentType === "tv_series" && !contentToToggle.started && !contentToToggle.watched) {
                    return "started";
                } else if (contentToToggle.contentType === "movie" || contentToToggle.started) {
                    return "watched";
                }
            })();

            if (!type) return prev;

            const index = prev.findIndex(m => m.id === id);
            if (index === -1) return prev;
            const updated = [...prev];
            if (type === "started") {
                const nowStarted = !updated[index].started;
                updated[index] = { ...updated[index], started: nowStarted, startedDate: nowStarted ? Date.now() : 0, toggled: true };
            } else {
                const nowWatched = !updated[index].watched;
                updated[index] = { 
                    ...updated[index], 
                    watched: nowWatched, 
                    watchDate: nowWatched ? Date.now() : 0,
                    started: false,
                    startedDate: 0,
                    toggled: true 
                };
            }
            return updated;
        });

        if (type) {
            fetch(`https://api.spectaer.com/watchlist/api/page-content/${id}/${type === "started" ? "start" : "watch"}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `RememberMe ${Cookies.get('rememberMeToken')}`
                },
            }).catch(err => console.error("Error toggling watched status:", err));
        }
    }, []);

    const loadExternalRatings = async (tmdbId: string, title: string, type: string, contentId: number, onRatingsUpdated?: (ratings: any) => void) => {
        try {
            const response = await fetch(`https://api.spectaer.com/watchlist/api/content/${tmdbId}/ratings?title=${title}&type=${type}`, {
                credentials: "include",
                method: "PATCH"
            })
            const ratings = await response.json()
            
            if (onRatingsUpdated) {
                onRatingsUpdated(ratings)
            }
            
            return ratings
        } catch (error) {
            console.error("Error loading external ratings:", error)
            throw error
        }
    }

    const filterContentType = (index: number) => {
        setFilterType(index)
        if(index === 0){
            setContent([...content.filter(m => m.contentType === "movie" || m.contentType === "tv_series")])
        } else if(index === 1){
            setContent([...content.filter(m => m.contentType === "movie")])
        } else if(index === 2){
            setContent([...content.filter(m => m.contentType === "tv_series")])
        }
    }

    const addToFavorites = async (id: number) => {
        setContent(prev => {
            const index = prev.findIndex(m => m.id === id);
            if (index === -1) return prev;
            const updated = [...prev];
            updated[index] = { ...updated[index], favorite: updated[index].favorite > 0 ? 0 : 1 };
            return updated;        
        });

        try {
            const response = await fetch(`https://api.spectaer.com/watchlist/api/page-content/${id}/favorite`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `RememberMe ${Cookies.get('rememberMeToken')}`
                },
                // body: JSON.stringify({ ...content, force }),
            })

            if (!response.ok) {
                if (response.status === 409) {
                    const error = new Error("duplicate") as any
                    error.content = content
                    throw error
                }
                throw new Error("Failed to add content")
            }
            
            const addedContent = await response.json()

            // if(addedContent.imdbRating === 0 || addedContent.rtRating === null) {
            //     loadExtraDetails(addedContent.id, addedContent.tmdbId, addedContent.posterPath, onRatingsUpdated)
            // }
            // loadAmbientColor(addedContent.id, addedContent.posterPath)

            // loadExternalRatings(addedContent.imdbId, addedContent.id, onRatingsUpdated)

            return addedContent
        } catch (error) {
            throw error
        }
    }

    const value = useMemo<ContentContextType>(() => ({
        content,
        stats,
        currentFilter,
        searchQuery,
        setSearchQuery,
        setCurrentFilter,
        loadContent,
        setContent,
        loading,
        addContent,
        removeContent,
        toggleWatched,
        loadExternalRatings,
        addToFavorites,
        filterContentType,
        filterType
    }), [
        content,
        stats,
        currentFilter,
        searchQuery,
        setSearchQuery,
        setCurrentFilter,
        loadContent,
        setContent,
        loading,
        addContent,
        removeContent,
        toggleWatched,
        loadExternalRatings,
        addToFavorites,
        filterContentType,
        filterType
    ]);

    return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
})

export function useContent() {
    const context = useContext(ContentContext)
    if (!context) {
        throw new Error("useContent must be used within a ContentProvider")
    }
    return context
}
"use client"

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, memo } from "react"
import type { Movie } from "@/types/movie"
import Cookies from 'js-cookie';

interface MoviesContextType {
  movies: Movie[]
  filteredMovies: Movie[]
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
  sortMovies: (s: string) => void
  loadMovies: () => Promise<void>
  setMovies: React.Dispatch<React.SetStateAction<Movie[]>>
  loading: boolean,
  addMovie: (movie: Partial<Movie>, mediaType?: string, logged?: boolean) => Promise<Movie>
  removeMovie: (id: any) => Promise<void>
  toggleWatched: (content: Content) => Promise<void>
  addToFavorites: (id: number) => Promise<Movie>
  filterContentType: (index: number) => void
  filterType: number
}

function useDailyStreak(movies: Movie[]) {
    return useMemo(() => {
        if (!movies || movies.length === 0 || movies.error) return 0;

        console.log("PASSED HCEKAKCER")
        // console.log(movies)

        const watchedDays = Array.from(
        new Set(
            movies
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
    }, [movies]);
}

const MoviesContext = createContext<MoviesContextType | undefined>(undefined);

export const MoviesProvider = memo(function MoviesProvider({ children }: { children: React.ReactNode }) {
    const [movies, setMovies] = React.useState<Movie[]>([]);
    const [filteredMovies, setFilteredMovies] = React.useState<Movie[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [currentFilter, setCurrentFilter] = React.useState('toWatch');
    const [filterType, setFilterType] = React.useState(0);

    const dailyStreak = useDailyStreak(movies);

    const stats = useMemo(
        () => ({
            total: (movies && movies.length > 0) ? movies.length : 0,
            watched: (movies && movies.length > 0) ? movies.filter((m) => m.watched).length : 0,
            toWatch: (movies && movies.length > 0) ? movies.filter((m) => !m.watched).length : 0,
            dailyStreak: (movies && movies.length > 0) ? dailyStreak : 0,
        }),
        [movies, dailyStreak]
    );

    const sortMovies = (sort: string) => {
        console.log("SORTING MOVIES")
        setFilteredMovies(filteredMovies.sort((a, b) =>
            (a[sort] ? new Date(a[sort]).getTime() : 0) -
            (b[sort] ? new Date(b[sort]).getTime() : 0)
        ));
    }

    React.useEffect(() => {
        console.log("LOAD MOVIES EFFECT")
        loadMovies();
    }, []);

    React.useEffect(() => {
        console.log("FILTER MOVIES EFFECT")
        // filterAndSearchMovies();
    }, [movies, searchQuery]);

    const loadMovies = useCallback(async () => {
        console.log("LOADING MOVIES 1")
        setLoading(true);
        fetch(`http://localhost:8080/api/page`, {
            "method": "GET",
            "headers": {
                "Content-Type": "application/json",
                "Authorization": `RememberMe ${Cookies.get('rememberMeToken')}`
            },
        })
        .then(response => response.json())
        .then(data => {
            console.log("LOADING MOVIES 2")
            // console.log(data)
            setMovies(data.pageContentDTOS)
            setFilteredMovies(data.pageContentDTOS);

            console.log({loool: data})

            setError(null);
        })
        .finally(() => {
            console.log("FINALLY");
            setLoading(false)
        });
    }, [])

    const filterAndSearchMovies = useCallback(() => {
        if(movies && movies.length > 0) {
            let filtered = [...movies];
            
            if (searchQuery) {
                console.log("SEARCHING")
                filtered = filtered.filter(movie => 
                    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
                );
            };
            setFilteredMovies(filtered);
        } else {
            setFilteredMovies([]);
        }
    }, [movies, searchQuery])

    const addMovie = async (tmdbId: number, mediaType: string, logged: boolean) => {
        try {
            console.log(tmdbId)
            console.log(mediaType)
            
            const response = await fetch(`http://localhost:8080/api/page-content?tmdbId=${tmdbId}&type=${mediaType}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `RememberMe ${Cookies.get('rememberMeToken')}`
                },
                // body: JSON.stringify({ ...movie, force }),
            })

            if (!response.ok) {
                if (response.status === 409) {
                    const error = new Error("duplicate") as any
                    error.movie = movie
                    throw error
                }
                throw new Error("Failed to add movie")
            }
            
            const addedMovie = await response.json()

            console.log(addedMovie)

            if(logged) {
                const response = await fetch(`http://localhost:8080/api/page-content/${addedMovie.id}/watch?logged=${logged}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `RememberMe ${Cookies.get('rememberMeToken')}`
                    },
                    // body: JSON.stringify({ ...movie, force }),
                })

                if (!response.ok) {
                    throw new Error("Failed to update watch status")
                }
            }

            // loadMovies()

            setMovies(prev => [...prev, addedMovie])
            setFilteredMovies(prev => [...prev, addedMovie])

            // loadExternalRatings(addedMovie.tmdbId, addedMovie.title, mediaType, addedMovie.id, onRatingsUpdated)

            // if(addedMovie.imdbRating === 0 || addedMovie.rtRating === null) {
            //     loadExtraDetails(addedMovie.id, addedMovie.tmdbId, addedMovie.posterPath, onRatingsUpdated)
            // }
            // loadAmbientColor(addedMovie.id, addedMovie.posterPath)

            // loadExternalRatings(addedMovie.imdbId, addedMovie.id, onRatingsUpdated)

            return addedMovie
        } catch (error) {
            throw error
        }
    }

      const removeMovie = async (id: any) => {
        setMovies(prev => prev.filter(m => m.id !== id));
        setFilteredMovies(prev => prev.filter(m => m.id !== id));
        
        try {
            const response = await fetch(`http://localhost:8080/api/page-content/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `RememberMe ${Cookies.get('rememberMeToken')}`
                }
            })

            if (!response.ok) {
                throw new Error("Failed to update watch status")
            }
        } catch (error) {
            console.error("Error toggling watched status:", error)
        }
    }

    const toggleWatched = async (content: Content) => {

        function toggleType() {
            if(content.contentType === "tv_series" && !content.started && !content.watched){
                return "started"
            } else if( content.contentType === "movie" || (content.started && !content.watched || content.started && content.watched) ) {
                return "watched"
            }
        }

        if(toggleType() === "started") {
            console.log("TOGGLING STARTED")
            setMovies( prev => {
                const index = prev.findIndex(m => m.id === content.id);
                if (index === -1) return prev;
                const updated = [...prev];
                updated[index] = { ...updated[index], started: !updated[index].started, startedDate: !updated[index].started ? Date.now() : 0, toggled: true };
                return updated;        
            });
    
            setFilteredMovies( prev => {
                const index = prev.findIndex(m => m.id === content.id);
                if (index === -1) return prev;
                const updated = [...prev];
                updated[index] = { ...updated[index], started: !updated[index].started, startedDate: !updated[index].started ? Date.now() : 0, toggled: true };
                return updated;        
            });
        } else if(toggleType() === "watched") {
            console.log("TOGGLING WATCHED")
            setMovies( prev => {
                const index = prev.findIndex(m => m.id === content.id);
                if (index === -1) return prev;
                const updated = [...prev];
                updated[index] = { ...updated[index], watched: !updated[index].watched, watchDate: !updated[index].watched ? Date.now() : 0, toggled: true };
                if(!updated[index].watched) {
                    console.log('LWW1')
                    updated[index] = { ...updated[index], started: false, startedDate: 0, toggled: true };
                }
                return updated;        
            });
    
            setFilteredMovies( prev => {
                const index = prev.findIndex(m => m.id === content.id);
                if (index === -1) return prev;
                const updated = [...prev];
                updated[index] = { ...updated[index], watched: !updated[index].watched, watchDate: !updated[index].watched ? Date.now() : 0, toggled: true };
                if(!updated[index].watched) {
                    console.log('LWW')
                    updated[index] = { ...updated[index], started: false, startedDate: 0, toggled: true };
                }
                return updated;        
            });
        }

        try {
            const response = await fetch(`http://localhost:8080/api/page-content/${content.id}/${toggleType() === "started" ? "start" : "watch"}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `RememberMe ${Cookies.get('rememberMeToken')}`
                },
                // body: JSON.stringify({ ...movie, force }),
            })

            if (!response.ok) {
                throw new Error("Failed to update watch status")
            }
        } catch (error) {
            console.error("Error toggling watched status:", error)
        }
    }

    const loadExternalRatings = async (tmdbId: string, title: string, type: string, movieId: number, onRatingsUpdated?: (ratings: any) => void) => {
        try {
            console.log("LOADING EXTERNAL RATINGS")
            const response = await fetch(`http://localhost:8080/api/content/${tmdbId}/ratings?title=${title}&type=${type}`, {
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
        console.log({index})
        setFilterType(index)
        if(index === 0){
            setMovies([...filteredMovies.filter(m => m.contentType === "movie" || m.contentType === "tv_series")])
        } else if(index === 1){
            setMovies([...filteredMovies.filter(m => m.contentType === "movie")])
        } else if(index === 2){
            setMovies([...filteredMovies.filter(m => m.contentType === "tv_series")])
        }
    }

    const addToFavorites = async (id: number) => {
        setMovies(prev => {
            const index = prev.findIndex(m => m.id === id);
            if (index === -1) return prev;
            const updated = [...prev];
            updated[index] = { ...updated[index], favorite: updated[index].favorite > 0 ? 0 : 1 };
            return updated;        
        });

        setFilteredMovies(prev => {
            const index = prev.findIndex(m => m.id === id);
            if (index === -1) return prev;
            const updated = [...prev];
            updated[index] = { ...updated[index], favorite: updated[index].favorite > 0 ? 0 : 1 };
            return updated;        
        });

        try {
            const response = await fetch(`http://localhost:8080/api/page-content/${id}/favorite`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `RememberMe ${Cookies.get('rememberMeToken')}`
                },
                // body: JSON.stringify({ ...movie, force }),
            })

            if (!response.ok) {
                if (response.status === 409) {
                    const error = new Error("duplicate") as any
                    error.movie = movie
                    throw error
                }
                throw new Error("Failed to add movie")
            }
            
            const addedMovie = await response.json()

            // if(addedMovie.imdbRating === 0 || addedMovie.rtRating === null) {
            //     loadExtraDetails(addedMovie.id, addedMovie.tmdbId, addedMovie.posterPath, onRatingsUpdated)
            // }
            // loadAmbientColor(addedMovie.id, addedMovie.posterPath)

            // loadExternalRatings(addedMovie.imdbId, addedMovie.id, onRatingsUpdated)

            return addedMovie
        } catch (error) {
            throw error
        }
    }

    const value = useMemo<MoviesContextType>(() => ({
        movies,
        filteredMovies,
        stats,
        currentFilter,
        searchQuery,
        setSearchQuery,
        setCurrentFilter,
        sortMovies,
        loadMovies,
        setMovies,
        loading,
        addMovie,
        removeMovie,
        toggleWatched,
        loadExternalRatings,
        addToFavorites,
        filterContentType,
        filterType
    }), [
        movies,
        filteredMovies,
        stats,
        currentFilter,
        searchQuery,
        setSearchQuery,
        setCurrentFilter,
        sortMovies,
        loadMovies,
        setMovies,
        loading,
        addMovie,
        removeMovie,
        toggleWatched,
        loadExternalRatings,
        addToFavorites,
        filterContentType,
        filterType
    ]);

    return <MoviesContext.Provider value={value}>{children}</MoviesContext.Provider>
})

export function useMovies() {
    const context = useContext(MoviesContext)
    if (!context) {
        throw new Error("useMovies must be used within a MoviesProvider")
    }
    return context
}
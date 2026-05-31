import React, { useEffect, useRef, useState } from "react";
import settings from "../constants/settings.json";
import { IoFilter, IoCheckmark } from "react-icons/io5";
import { Content } from "../types/content";

interface FilterTabProps {
    content: Content[];
    scrollToSection: (section: number) => () => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onEnterPress: () => void;
    onChangeFilters: (filters: Record<string, string[]>) => void;
}

export const FilterTab = React.memo(function FilterTab( { scrollToSection, searchQuery, onSearchChange, onEnterPress, content, onChangeFilters }: FilterTabProps) {
    const [selectedFilter, setSelectedFilter] = useState<number | null>(null)
    const [filterOpen, setFilterOpen] = useState(false)
    const [filterOptionSelected, setFilterOptionSelected] = useState<string | null>(null)
    const dropdownRef = useRef<HTMLDivElement | null>(null)

    const [filterItems, setFilterItems] = useState<{ key: string, count: number }[]>([])
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({})

    const handleScroll = () => {
        let watchedGridElement = document.getElementById('section-0') as HTMLElement
        let startedGridElement = document.getElementById('section-1') as HTMLElement
        let toWatchGridElement = document.getElementById('section-2') as HTMLElement

        if(watchedGridElement && startedGridElement && toWatchGridElement) {
            const scrollPosition = window.scrollY + 150
            
            if(scrollPosition >= toWatchGridElement.offsetTop) {
                setSelectedFilter(2)
            } else if(scrollPosition >= startedGridElement.offsetTop) {
                setSelectedFilter(1)
            } else if(scrollPosition >= watchedGridElement.offsetTop) {
                setSelectedFilter(0)
            }
        }
    }
    
    useEffect(() => {
        document.addEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setFilterOpen(false);
                setFilterOptionSelected(null)
            }
        };

        window.addEventListener("pointerdown", handleClickOutside);
        return () => window.removeEventListener("pointerdown", handleClickOutside);
    }, [filterOpen]);

    useEffect(() => {
        if (filterOptionSelected === null || filterOpen === false) {
            setFilterItems([])
            return
        }

        const sourceContent = content.filter((item) => {
            let matches = true

            if (filterOptionSelected !== "year" && selectedFilters.year?.length > 0) {
                matches = matches && selectedFilters.year.includes(item.releaseDate?.substring(0, 4) ?? "")
            }

            if (filterOptionSelected !== "genre" && selectedFilters.genre?.length > 0) {
                matches = matches && selectedFilters.genre.some((g) => item.genres?.includes(g))
            }

            return matches
        })

        if (sourceContent.length === 0) {
            setFilterItems([])
            return
        }

        const currentSelected = selectedFilters[filterOptionSelected] ?? []
        const sortSelectedOnOpen = <T extends { key: string }>(items: T[]) => {
            const selectedSet = new Set(currentSelected)
            const selected = items.filter((item) => selectedSet.has(item.key))
            const unselected = items.filter((item) => !selectedSet.has(item.key))
            return [...selected, ...unselected]
        }

        if (filterOptionSelected === "year") {
            const yearCounts = sourceContent.reduce<Record<string, number>>((acc, item) => {
                const year = item.releaseDate?.substring(0, 4)
                if (year) {
                    acc[year] = (acc[year] ?? 0) + 1
                }
                return acc
            }, {})

            const yearItems = Object.entries(yearCounts)
                .map(([key, count]) => ({ key, count }))
                .sort((a, b) => parseInt(b.key, 10) - parseInt(a.key, 10))

            setFilterItems(sortSelectedOnOpen(yearItems))
        } else if (filterOptionSelected === "genre") {
            const genreCounts = sourceContent.reduce<Record<string, number>>((acc, item) => {
                item.genres?.forEach((genre) => {
                    if (genre) {
                        acc[genre] = (acc[genre] ?? 0) + 1
                    }
                })
                return acc
            }, {})

            const genreItems = Object.entries(genreCounts)
                .map(([key, count]) => ({ key, count }))
                .sort((a, b) => a.key.localeCompare(b.key))

            setFilterItems(sortSelectedOnOpen(genreItems))
        }
    }, [content, filterOptionSelected, filterOpen])

    useEffect(() => {
        onChangeFilters(selectedFilters)
    }, [selectedFilters, onChangeFilters])

    return (
        <div className="flex flex-col gap-2  sticky top-2 z-10">

            <div className="flex w-full gap-2">
                <input 
                    type="text" 
                    placeholder="Search in watchlist..." 
                    className="w-full bg-black/50 backdrop-blur-sm rounded-2xl border-1 border-cyan-800 p-2 px-4 shadow-xs shadow-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-500" 
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onEnterPress()}
                />

                <div className="relative" ref={dropdownRef}>
                    <button
                        className={`h-fit p-2 justify-center items-center mt-auto mb-auto rounded-full bg-cyan-800/40 shadow-inner shadow-cyan-200/30 cursor-pointer hover:scale-105 transition-all`}
                        style={{color: `rgba(${settings.primaryColor}, 1)`}}
                        onClick={() => {setFilterOpen(!filterOpen); filterOpen === true && setFilterOptionSelected(null)}}
                    >
                        <IoFilter size={25} />
                    </button>

                    {filterOpen && (
                        <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-cyan-800 bg-[#06050d] shadow-xl shadow-cyan-900/50 overflow-hidden z-10 max-h-50 overflow-y-scroll no-scrollbar">
                            {filterOptionSelected === null ? (
                                <>
                                    <button
                                        type="button"
                                        className="block w-full px-4 py-3 text-left text-sm text-cyan-300 cursor-pointer hover:bg-cyan-900/80 transition-colors"
                                        onClick={() => setFilterOptionSelected("year")}
                                    >
                                        Year {selectedFilters.year?.length > 0 && `(${selectedFilters.year.length})`}
                                    </button>
                                    <button
                                        type="button"
                                        className="block w-full px-4 py-3 text-left text-sm text-cyan-300 cursor-pointer hover:bg-cyan-900/80 transition-colors"
                                        onClick={() => setFilterOptionSelected("genre")}
                                    >
                                        Genre {selectedFilters.genre?.length > 0 && `(${selectedFilters.genre.length})`}
                                    </button>
                                </>
                            ) : (
                                filterItems.map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        className="block w-full px-4 py-3 text-left text-sm text-cyan-300 cursor-pointer hover:bg-cyan-900/80 transition-colors"
                                        onClick={() => {
                                            if (!filterOptionSelected) return

                                            setSelectedFilters((prev) => {
                                                const current = prev[filterOptionSelected] ?? []
                                                const updated = current.includes(item.key)
                                                    ? current.filter((value) => value !== item.key)
                                                    : [...current, item.key]

                                                const nextFilters = {
                                                    ...prev,
                                                    [filterOptionSelected]: updated,
                                                }

                                                if (updated.length === 0) {
                                                    delete nextFilters[filterOptionSelected]
                                                }

                                                return nextFilters
                                            })
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{item.key} ({item.count})</span>
                                            {filterOptionSelected && selectedFilters[filterOptionSelected]?.includes(item.key) && (
                                                <IoCheckmark className="text-cyan-300" />
                                            )}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>

            </div>
            
            <div className="flex flex-wrap justify-center sm:justify-start w-full bg-black/50 backdrop-blur-sm rounded-2xl border-1 border-cyan-800 p-2 gap-2">
                <button 
                    className={`p-2 px-4 uppercase rounded-xl ${selectedFilter === 0 ? "bg-cyan-600/80" : "bg-cyan-800/40"} font-bold tracking-widest text-sm shadow-inner shadow-cyan-200/30 cursor-pointer hover:scale-105 transition-all`}
                    style={{color: `rgba(${settings.primaryColor}, 1)`}}
                    onClick={scrollToSection(0)}
                >            
                    Watched
                </button>
                <button 
                    className={`p-2 px-4 uppercase rounded-xl ${selectedFilter === 1 ? "bg-cyan-600/80" : "bg-cyan-800/40"} font-bold tracking-widest text-sm shadow-inner shadow-cyan-200/30 cursor-pointer hover:scale-105 transition-all`}
                    style={{color: `rgba(${settings.primaryColor}, 1)`}}
                    onClick={scrollToSection(1)}
                >
                    Started
                </button>
                <button 
                    className={`p-2 px-4 uppercase rounded-xl ${selectedFilter === 2 ? "bg-cyan-600/80" : "bg-cyan-800/40"} font-bold tracking-widest text-sm shadow-inner shadow-cyan-200/30 cursor-pointer hover:scale-105 transition-all`}
                    style={{color: `rgba(${settings.primaryColor}, 1)`}}
                    onClick={scrollToSection(2)}
                >
                    To Watch
                </button>
            </div>
        </div>
    )
});
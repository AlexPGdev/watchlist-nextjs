"use client";

import React, { useState, useRef, useEffect } from "react";
import SvgComponent from "../components/HomeIcon";
import settings from "../constants/settings.json";
import { useAuth } from "../hooks/useAuth";


interface HeaderProps {
    onOpen: () => void;
    onOpenSearchResult: (result: any) => void;
}

export const Header = React.memo(function Header({ onOpen, onOpenSearchResult }: HeaderProps) {

    const { isLoggedIn, user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const searchRef = useRef<HTMLDivElement | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [yearFilter, setYearFilter] = useState("");

    const getResultTitle = (result: any) => {
        return result.username ?? result.title ?? result.name ?? "Unknown";
    };

    const getResultSubtext = (result: any) => {
        return result.release_date?.substring(0, 4) ?? result.first_air_date?.substring(0, 4) ?? result.year ?? "";
    };

    useEffect(() => {

        const effectiveQuery = searchQuery;

        if(effectiveQuery.startsWith("@")) {
            if (effectiveQuery.trim().length < 2) {
                setSearchResults([])
                setShowResults(false)
                return
            }

            const debounceTimeout = setTimeout(async () => {
                try {
                    const response = await fetch(`https://api.spectaer.com/watchlist/api/search?q=${encodeURIComponent(effectiveQuery.replace('@', ''))}`)
                    const data = await response.json()

                    if (data.Error) {
                        setSearchResults([])
                    } else {
                        setSearchResults(data)
                    }

                    setShowResults(true)
                } catch (error) {
                    console.error("Error searching users:", error)
                }
            }, 300);

            return () => clearTimeout(debounceTimeout);
        }

        
        if (effectiveQuery.trim().length < 2) {
            setSearchResults([])
            setShowResults(false)
            return
        }

        const debounceTimeout = setTimeout(async () => {
            try {
                const response = await fetch(`https://api.spectaer.com/watchlist/api/content/searchContent?query=${encodeURIComponent(effectiveQuery.trim())}${yearFilter ? `&year=${yearFilter}` : ''}`)
                const data = await response.json()

                if (data.Error) {
                    setSearchResults([])
                } else {
                    setSearchResults(data)
                }
                
                setShowResults(true)
            } catch (error) {
                setSearchResults([])
                console.error("Error searching movies:", error)
            }
        }, 300)

        return () => clearTimeout(debounceTimeout)
    }, [searchQuery])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchFocused(false);
            }
        };

        window.addEventListener("pointerdown", handleClickOutside);
        return () => window.removeEventListener("pointerdown", handleClickOutside);
    }, [menuOpen]);
    
    return (
        <div className="flex flex-col items-center text-center relative select-none">
            <div className="flex flex-row items-center flex-wrap justify-center w-full gap-5">
                <a href="/" className="flex items-center gap-2.5 flex-wrap justify-center">
                    <SvgComponent width={100} height={60} fill="#fff" />

                    <span
                        className="text-4xl tracking-[6px] text-transparent bg-clip-text font-bold"
                        style={{
                            // backgroundImage: `linear-gradient(135deg, rgba(${settings.primaryColorDark},1), rgba(${settings.secondaryColor},1))`
                            backgroundColor: `rgba(${settings.primaryColorDark},1)`
                        }}
                    >
                        SPECTAER
                    </span>
                </a>

                <div
                    ref={searchRef}
                    className="relative flex-1 min-w-[200px]"
                    onFocus={() => setIsSearchFocused(true)}
                >
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        className="bg-black/50 rounded-2xl w-full border-1 border-cyan-800 p-2 px-4 shadow-xs shadow-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-500" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onClick={() => setIsSearchFocused(true)}
                    />

                    {showResults && isSearchFocused && (
                        <div
                            className="absolute left-0 right-0 top-full z-50 mt-3 max-h-80 w-full overflow-hidden overflow-y-auto rounded-3xl border border-cyan-800 bg-[#050814]/95 p-2 shadow-xl shadow-cyan-900/60 backdrop-blur-xl no-scrollbar"
                        >
                            {searchResults.length > 0 ? (
                                searchResults.map((result: any) => (
                                    <button 
                                        key={result.id}
                                        onClick={() => {onOpenSearchResult(result)}}
                                        className="w-full rounded-3xl mb-2 border border-cyan-800/70 bg-[#081029] px-4 py-3 text-left cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-500 hover:bg-cyan-950/90"
                                        style={{ boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)' }}
                                    >
                                        <div className="flex gap-2 w-full h-20 items-center">
                                            <div className="w-15">
                                                <img
                                                    src={result.mediaType.toLowerCase() === "person" ? `https://image.tmdb.org/t/p/w500/${result.profile_path}` : result.poster_path === undefined ? `https://alexpgdev.com/peepoHey.gif` :`https://image.tmdb.org/t/p/w500/${result.poster_path}`} 
                                                    className="w-full h-full object-cover rounded-lg" 
                                                    alt={result.title}
                                                    draggable={false}
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-md font-bold line-clamp-2" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>
                                                    {getResultTitle(result)}
                                                </p>
                                                <p className="text-sm uppercase text-cyan-300/80">
                                                    {getResultSubtext(result)}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-4 text-center text-sm text-cyan-200/80">
                                    No results found.
                                </div>
                            )}
                        </div>
                    )}
                </div>



                <a href="/explore" className="text-cyan-400 text-lg hover:text-cyan-500 hover:underline transition-all duration-300">
                    Explore
                </a>

                {!isLoggedIn ? (
                    <button 
                        className="p-3 px-6 uppercase rounded-full bg-cyan-800/80 font-bold tracking-widest text-sm shadow-inner shadow-cyan-200/30 cursor-pointer hover:scale-105 transition-all" 
                        style={{color: `rgba(${settings.primaryColor}, 1)`}}
                        onClick={onOpen}
                    >
                        Login
                    </button>
                ) : (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={() => setMenuOpen((prev) => !prev)}
                            className="inline-flex items-center gap-2 font-bold text-base p-1 rounded-2xl cursor-pointer hover:bg-cyan-800 transition-all"
                            style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}
                        >
                            {user}
                        </button>

                        {menuOpen && (
                            <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-cyan-800 bg-[#06050d] shadow-xl shadow-cyan-900/50 overflow-hidden">
                                <a
                                    href="/profile"
                                    className="block w-full px-4 py-3 text-left text-sm text-cyan-300 cursor-pointer hover:bg-cyan-900/80 transition-colors"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Profile
                                </a>
                                <button
                                    type="button"
                                    className="block w-full px-4 py-3 text-left text-sm text-fuchsia-300 cursor-pointer hover:bg-fuchsia-900/80 transition-colors"
                                    onClick={async () => {
                                        setMenuOpen(false);
                                        await logout();
                                    }}
                                >
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
});
import React, { useEffect, useState } from "react";
import settings from "../constants/settings.json";

interface FilterTabProps {
    scrollToSection: (section: number) => () => void;
}

export const FilterTab = React.memo(function FilterTab( { scrollToSection }: FilterTabProps) {
    const [selectedFilter, setSelectedFilter] = useState<number | null>(null)

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

    return (
        <div className="flex flex-wrap w-full bg-black/50 backdrop-blur-sm rounded-2xl border-1 border-cyan-800 p-2 gap-2 sticky top-2 z-10">
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
    )
});
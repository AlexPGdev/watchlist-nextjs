import React from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import settings from '../constants/settings.json'
import { ContentCard } from "./ContentCard";
import { Content } from "../types/content";

interface RecommendationsProps {
    recommendations: { title: string; subtitle: string; objects: any[] }[];
    onContentClick?: (content: Content) => void;
}

export const Recommendations = React.memo(function Recommendations({ recommendations, onContentClick }: RecommendationsProps) {

    const scrollRefs = React.useRef({}) as React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>
    const [scrollState, setScrollState] = React.useState<{ [key: string]: { isAtLeft: boolean; isAtRight: boolean } }>({})

    const updateScrollState = (key: string) => {
        const el = scrollRefs.current[key]

        if (!el) return

        const isAtLeft = el.scrollLeft <= 0

        const isAtRight =
            el.scrollLeft + el.clientWidth >= el.scrollWidth - 1

        setScrollState((prev) => ({
            ...prev,
            [key]: {
                isAtLeft,
                isAtRight,
            },
        }))
    }

    return (
        recommendations.map((item: any) => (
            item.cacheKey !== 'trending' && (
                <div key={item.cacheKey} className="flex flex-col select-none">
                    <div>
                        <h1 className="text-xl font-bold" style={{ color: `rgba(${settings.primaryColor}, 1)` }}>{item.title}</h1>
                        <h1 className="text-lg font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>{item.subtitle}</h1>
                    </div>

                    <div className="relative w-full h-[270px]">
                        <div
                            ref={(el) => {
                                scrollRefs.current[item.cacheKey] = el

                                // initialize state
                                if (el && !scrollState[item.cacheKey]) {
                                    setTimeout(() => updateScrollState(item.cacheKey), 0)
                                }
                            }}
                            onScroll={() => updateScrollState(item.cacheKey)}
                            className="relative flex gap-2 [mask-image:linear-gradient(to_right,black_90%,transparent)] py-2 overflow-x-scroll no-scrollbar overflow-y-visible"
                        >
                            {item.objects.map((object: any) => (
                                <div key={object.movie ? object.movie.id : object.id} className="shrink-0 w-[180px]">
                                    <ContentCard content={object.movie ? object.movie : object} onClick={onContentClick} onStatusChange={() => { }} onRemoveContent={() => { }} fromWatchlist={false} focusedTitle={''} />
                                </div>
                            ))}
                        </div>


                        <button
                            disabled={scrollState[item.cacheKey]?.isAtLeft}
                            className="absolute left-[5px] top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-[36px] h-[36px] bg-cyan-800/60 rounded-full backdrop-blur-sm rounded-2xl cursor-pointer hover:scale-105 active:scale-100 disabled:cursor-default disabled:opacity-50 transition-all"
                            style={{ boxShadow: '-2px 2px 10px rgb(0, 0, 0, 0.5)' }}
                            onClick={() => {
                                scrollRefs.current[item.cacheKey]?.scrollBy({
                                    left: -300,
                                    behavior: 'smooth',
                                })
                            }}
                        >
                            <HiChevronLeft color={`rgba(${settings.primaryColorDark}, 1)`} style={{ marginRight: '2px' }} size={36} />
                        </button>


                        <button
                            disabled={scrollState[item.cacheKey]?.isAtRight}
                            className="absolute right-[5px] lg:right-[15px] top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-[36px] h-[36px] bg-cyan-800/60 rounded-full backdrop-blur-sm rounded-2xl cursor-pointer hover:scale-105 active:scale-100 disabled:cursor-default disabled:opacity-50 transition-all"
                            style={{ boxShadow: '-2px 2px 10px rgb(0, 0, 0, 0.5)' }}
                            onClick={() => {
                                scrollRefs.current[item.cacheKey]?.scrollBy({
                                    left: 300,
                                    behavior: 'smooth',
                                })
                            }}
                        >
                            <HiChevronRight color={`rgba(${settings.primaryColorDark}, 1)`} style={{ marginLeft: '2px' }} size={36} />
                        </button>
                    </div>
                </div>
            )
        ))
    )
});
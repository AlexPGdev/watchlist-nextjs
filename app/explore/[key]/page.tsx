"use client";

import { Header } from "@/app/components/Header";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Cookies from 'js-cookie'
import { ContentCard } from "@/app/components/ContentCard";
import settings from "@/app/constants/settings.json";
import { FaInfoCircle } from "react-icons/fa";
import { ContentDetailsModal } from "@/app/components/modals/ContentDetailsModal";
import { Content } from "@/app/types/content";

export default function Page() {
    const router = useRouter();

    const params = useParams();

    const key = params.key as string;

    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedContent, setSelectedContent] = useState<any>(null);
    const [activeExplanationIndex, setActiveExplanationIndex] = useState<number | null>(null);

    const [recommendedContent, setRecommendedContent] = useState<any>([]);

    const searchParams = useSearchParams();
    const [type, id] = [...searchParams.entries()][0] || [];

    useEffect(() => {
        if(type && id) {
            setShowModal(true)
        }

        fetch(`http://192.168.178.131:8080/api/page-content/recommended?section=${key}&page=0&size=100`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `RememberMe ${Cookies.get("rememberMeToken")}`,
            },
        })
        .then(response => response.json())
        .then(data => {
            setRecommendedContent(data[0])
        })
        .catch(err => console.error("Error loading recommended movies:", err));


    }, []);

    const handleOpenSearchResult = useCallback((result: any) => {
        router.push(`?${result.mediaType.toLowerCase()}=${result.id}`, { scroll: false })
        setSelectedContent(result)
        setShowModal(true)
    }, []);

    const handleContentClick = useCallback((content: Content) => {
        let scrollY = window.scrollY
    
        router.push(`?${content.contentType.toLowerCase()}=${content.tmdbId}`, { scroll: false })
        setSelectedContent(content)
        setShowModal(true)
    
        setTimeout(() => {
            window.scrollTo(0, scrollY)
            scrollY = 0
        }, 300)
    }, []);

    return (
        <div className="page flex flex-col p-4 sm:p-4 md:p-4 lg:px-[10%] xl:px-[18%] gap-5 md:gap-5 tracking-wider">
            <Header onOpen={() => setShowLoginModal(true)} onOpenSearchResult={handleOpenSearchResult} />

            <div>
                <h1 className="text-xl font-bold" style={{ color: `rgba(${settings.primaryColor}, 1)` }}>{recommendedContent?.title}</h1>
                <p className="text-lg font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>{recommendedContent?.subtitle}</p>
            </div>

            <ul className="grid gap-3 md:gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
                {recommendedContent?.objects && recommendedContent?.objects.map((content: any, index: number) => (
                    <li
                        key={content.movie ? content.movie.id : content.id}
                        className="relative content-card"
                        id={`${content.movie ? content.movie.title : content.title}`}
                    >
                        {content.becauseYouWatched && (
                            <>
                                <button
                                    type="button"
                                    className="absolute top-1 right-1 z-10 rounded-full shadow-md shadow-black/50 bg-black/80 cursor-pointer"
                                    onMouseEnter={() => setActiveExplanationIndex(index)}
                                    onMouseLeave={() => setActiveExplanationIndex(prev => prev === index ? null : prev)}
                                    onFocus={() => setActiveExplanationIndex(index)}
                                    onBlur={() => setActiveExplanationIndex(prev => prev === index ? null : prev)}
                                    onClick={(e) => { e.stopPropagation(); setActiveExplanationIndex(prev => prev === index ? null : index); }}
                                >
                                    <FaInfoCircle size={20} color={`rgba(${settings.primaryColorDark}, 1)`} />
                                </button>

                                {(activeExplanationIndex === index && content.becauseYouWatched?.length > 0) && (
                                    <div className="absolute left-[90%] top-[10%] z-20 w-[240px] max-w-xs ml-3 rounded-2xl border border-cyan-700/80 bg-slate-950/95 p-3 shadow-xl text-slate-100">
                                        <div className="mb-2 text-xs uppercase tracking-widest text-cyan-300">
                                            Recommended because you watched
                                        </div>
                                        <ul className="space-y-1">
                                            {content.becauseYouWatched.map((item: any, itemIndex: number) => (
                                                <li key={`${content.movie.id}-because-${itemIndex}`} className="truncate text-sm">
                                                    {item.title}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </>
                        )}

                        <ContentCard content={content.movie ? content.movie : content} onClick={handleContentClick} onStatusChange={() => {}} onRemoveContent={() => {}} fromWatchlist={false} focusedTitle={''}  ownerPage={false}/>
                    </li>
                ))}
            </ul>

            <Suspense fallback={null}>
                <ContentDetailsModal selectedContent={selectedContent} onClose={() => setShowModal(false)} open={showModal} />
            </Suspense>

        </div>
    )
}
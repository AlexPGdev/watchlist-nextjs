"use client";

import { useAuth } from "@/app/hooks/useAuth";
import { Header } from "@/components/Header";
import { useRouter, useSearchParams } from "next/navigation";
import settings from "@/constants/settings.json";
import { Stats } from "@/app/components/Stats";
import { useContent } from "@/app/hooks/useContent";
import { GoChevronRight } from "react-icons/go";
import { ContentCard } from "@/app/components/ContentCard";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { ContentDetailsModal } from "@/app/components/modals/ContentDetailsModal";
import { Content } from "@/app/types/content";
import Image from "next/image";

export default function Page() {
    const { getProfile, profile } = useAuth();

    const router = useRouter();

    const [stats, setStats] = useState<{ total: number; watched: number; toWatch: number; dailyStreak: number; }>({ total: 0, watched: 0, toWatch: 0, dailyStreak: 0 })

    const [showModal, setShowModal] = useState(false);
    const [selectedContent, setSelectedContent] = useState<any>(null);

    const searchParams = useSearchParams();
    const [type, id] = [...searchParams.entries()][0] || [];

    useEffect(() => {
        if(type && id) {
            setSelectedContent({id: id, type: type})
            setShowModal(true)
        }
        getProfile()
    }, [])

    useEffect(() => {
        if(!profile) return

        setStats({
            total: profile?.total,
            watched: profile?.watched,
            toWatch: profile?.toWatch,
            dailyStreak: 0,
        })
    }, [profile])

    const handleContentClick = useCallback((content: Content) => {

        let isMovie = content.runtime !== null || content.totalSeasons <= 0;

        let contentType = content.movies ? "collection" : content.contentType.toLowerCase()
    
        console.log({content})
        router.push(`?${contentType}=${content.tmdbId ? content.tmdbId : content.id}`, { scroll: false })
        setSelectedContent(content)
        setShowModal(true)
    }, []);

    return (
        <div className="page flex flex-col p-4 sm:p-4 md:p-4 lg:px-[10%] xl:px-[18%] gap-5 md:gap-5 tracking-wider">
            <Header onOpenSearchResult={() => {}} />

            <div className="flex flex-col gap-3 justify-center w-full items-center">
                <img src="/peepoHey.gif" alt="user" className="w-30 h-30 rounded-full border-2 border-cyan-800" />

                <div className="flex flex-col text-center">
                    <p className="text-xl font-bold tracking-wider" style={{ color: `rgba(${settings.primaryColor}, 1)` }}>{profile?.username}</p>
                    <p className="text-md font-semibold tracking-wider" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>Joined on {new Date(profile?.createdAt || 0).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
            </div>
            
            <Stats stats={stats} />

            <div className="flex flex-col gap-2 w-fit ml-auto mr-auto">
                {profile?.watchlist?.length > 0 && (
                    <div>
                        <a className="flex cursor-pointer group items-center border-b border-cyan-800 pb-2" href={`/user/${profile?.username}/watchlist`}>
                            <h1 className="text-xl font-bold leading-none hover:brightness-225" style={{ color: `rgba(${settings.primaryColor}, 1)` }}>Watchlist</h1>
                            <GoChevronRight className="cursor-pointer text-cyan-500 group-hover:text-cyan-100 transition-all" size={30} />
                        </a>

                        <div className="relative h-full flex gap-2 py-2 no-scrollbar overflow-visible">
                            {profile?.watchlist?.map((content: any) => (
                                <button key={content.id} className="max-w-[120px] cursor-pointer hover:scale-105 active:scale-95 transition-all" onClick={() => handleContentClick(content)}>
                                    {/* <img src={`https://image.tmdb.org/t/p/w500/${content.posterPath}`} className="w-full h-full object-cover rounded-lg" alt={content.title} /> */}
                                    <Image src={`https://image.tmdb.org/t/p/w500/${content.posterPath}`} className="w-full h-full object-cover rounded-lg" alt={content.title} width={500} height={750} />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {profile?.favorites?.length > 0 && (
                    <div>
                        <a className="flex gap-1 group items-center border-b border-cyan-800 pb-2">
                            <h1 className="text-xl font-bold leading-none" style={{ color: `rgba(${settings.primaryColor}, 1)` }}>Favorite Picks</h1>
                        </a>

                        <div className="relative h-full flex gap-2 py-2 no-scrollbar overflow-y-visible">
                            {profile?.favorites?.map((content: any) => (
                                <button key={content.id} className="max-w-[120px] cursor-pointer hover:scale-105 active:scale-95 transition-all" onClick={() => handleContentClick(content)}>
                                    {/* <img src={`https://image.tmdb.org/t/p/w500/${content.posterPath}`} className="w-full h-full object-cover rounded-lg" alt={content.title} /> */}
                                    <Image src={`https://image.tmdb.org/t/p/w500/${content.posterPath}`} className="w-full h-full object-cover rounded-lg" alt={content.title} width={500} height={750} />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {profile?.recentlyWatched?.length > 0 && (                    
                    <div>
                        <a className="flex gap-1 group items-center border-b border-cyan-800 pb-2">
                            <h1 className="text-xl font-bold leading-none" style={{ color: `rgba(${settings.primaryColor}, 1)` }}>Recently Watched</h1>
                        </a>

                        <div className="relative h-full flex gap-2 py-2 no-scrollbar overflow-y-visible">
                            {profile?.recentlyWatched?.map((content: any) => (
                                <button key={content.id} className="max-w-[120px] cursor-pointer hover:scale-105 active:scale-95 transition-all" onClick={() => handleContentClick(content)}>
                                    {/* <img src={`https://image.tmdb.org/t/p/w500/${content.posterPath}`} className="w-full h-full object-cover rounded-lg" alt={content.title} /> */}
                                    <Image src={`https://image.tmdb.org/t/p/w500/${content.posterPath}`} className="w-full h-full object-cover rounded-lg" alt={content.title} width={500} height={750} />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Suspense fallback={null}>
                <ContentDetailsModal selectedContent={selectedContent} onClose={() => setShowModal(false)} open={showModal} />
            </Suspense>
        </div>
    );
}
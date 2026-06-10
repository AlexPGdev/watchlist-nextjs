"use client";

import { useAuth } from "@/app/hooks/useAuth";
import { Header } from "@/components/Header";
import { useRouter } from "next/navigation";
import settings from "@/constants/settings.json";
import { Stats } from "@/app/components/Stats";
import { useContent } from "@/app/hooks/useContent";
import { GoChevronRight } from "react-icons/go";
import { ContentCard } from "@/app/components/ContentCard";
import { useEffect, useMemo, useState } from "react";

export default function Page() {
    const { getProfile, profile } = useAuth();
    const [stats, setStats] = useState<{ total: number; watched: number; toWatch: number; dailyStreak: number; }>({ total: 0, watched: 0, toWatch: 0, dailyStreak: 0 })

    useEffect(() => {
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

    return (
        <div className="page flex flex-col p-4 sm:p-4 md:p-4 lg:px-[10%] xl:px-[18%] gap-5 md:gap-5 tracking-wider">
            <Header onOpen={() => {}} onOpenSearchResult={() => {}} />
            <Stats stats={stats} />

            <div className="flex flex-col gap-3 justify-center w-full items-center">
                <img src={`https://alexpgdev.com/peepoHey.gif`} alt="user" className="w-30 h-30 rounded-full border-2 border-cyan-800" />

                <div className="flex flex-col text-center">
                    <p className="text-xl font-bold tracking-wider" style={{ color: `rgba(${settings.primaryColor}, 1)` }}>{profile?.username}</p>
                    <p className="text-md font-semibold tracking-wider" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>Joined on {new Date(profile?.createdAt || 0).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
            </div>

            <div className="flex flex-col gap-2 w-fit ml-auto mr-auto">
                {profile?.watchlist?.length > 0 && (
                    <div>
                        <a className="flex gap-1 cursor-pointer group items-center border-b border-cyan-800 pb-2" href={`/user/${profile?.username}/watchlist`}>
                            <h1 className="text-xl font-bold leading-none hover:brightness-225" style={{ color: `rgba(${settings.primaryColor}, 1)` }}>Watchlist</h1>
                            <GoChevronRight className="cursor-pointer text-cyan-500 group-hover:text-cyan-100 transition-all" size={30} />
                        </a>

                        <div className="relative h-full flex gap-2 py-2 overflow-x-scroll no-scrollbar overflow-y-visible">
                            {profile?.watchlist?.map((content: any) => (
                                <div key={content.id} className="max-w-[120px]">
                                    <img src={`https://image.tmdb.org/t/p/w500/${content.posterPath}`} className="w-full h-full object-cover rounded-lg" alt={content.title} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {profile?.favorites?.length > 0 && (
                    <div>
                        <a className="flex gap-1 group items-center border-b border-cyan-800 pb-2">
                            <h1 className="text-xl font-bold leading-none hover:brightness-225" style={{ color: `rgba(${settings.primaryColor}, 1)` }}>Favorite Picks</h1>
                        </a>

                        <div className="relative h-full flex gap-2 py-2 overflow-x-scroll no-scrollbar overflow-y-visible">
                            {profile?.favorites?.map((content: any) => (
                                <div key={content.id} className="shrink-0 w-[120px]">
                                    <img src={`https://image.tmdb.org/t/p/w500/${content.posterPath}`} className="w-full h-full object-cover rounded-lg" alt={content.title} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {profile?.recentlyWatched?.length > 0 && (                    
                    <div>
                        <a className="flex gap-1 group items-center border-b border-cyan-800 pb-2">
                            <h1 className="text-xl font-bold leading-none hover:brightness-225" style={{ color: `rgba(${settings.primaryColor}, 1)` }}>Recently Watched</h1>
                        </a>

                        <div className="relative h-full flex gap-2 py-2 overflow-x-scroll no-scrollbar overflow-y-visible">
                            {profile?.recentlyWatched?.map((content: any) => (
                                <div key={content.id} className="shrink-0 w-[120px]">
                                    <img src={`https://image.tmdb.org/t/p/w500/${content.posterPath}`} className="w-full h-full object-cover rounded-lg" alt={content.title} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}


            </div>
        </div>
    );
}
import React, { useState, useEffect, useRef, useCallback } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import settings from "../constants/settings.json";
import { Swiper } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { SwiperSlide } from "swiper/react";
import { Content } from "../types/content";
import { IoIosExpand } from "react-icons/io";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useContent } from "../hooks/useContent";
import Image from "next/image";

interface TrendingProps {
    item: { title: string; subtitle: string; objects: any[] };
    onContentClick?: (content: Content) => void;
}

export const Trending = React.memo(function Trending({ item, onContentClick }: TrendingProps) {
    const { page } = useContent();
    const [activeIndex, setActiveIndex] = useState(0);
    const isLastSlideActive = item?.objects?.length ? activeIndex === item.objects.length - 1 : false;

    return (
        <div className="flex flex-col select-none gap-2 ">
            <div>
                <h1 className="text-2xl font-bold h-[30px]" style={{ color: `rgba(${settings.primaryColor}, 1)` }}>{item.title}</h1>
                <h1 className="text-xl font-bold h-[28px]" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>{item?.subtitle}</h1>
            </div>

            <div className="relative w-full">
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    simulateTouch={false}
                    navigation={{
                        nextEl: '.custom-swiper-button-next',
                        prevEl: '.custom-swiper-button-prev',
                    }}
                    slidesPerView={1}
                    spaceBetween={-110}
                    breakpoints={{
                        1024: {
                            slidesPerView: 1.15,
                        },
                    }}
                    draggable={false}
                    pagination={{
                        clickable: true,
                    }}
                    autoplay={{
                        delay: 10000,
                        disableOnInteraction: false,
                    }}
                    onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                    className={`w-full rounded-2xl ${!isLastSlideActive ? 'lg:[mask-image:linear-gradient(to_right,black_90%,transparent)]' : ''}`}
                >
                    {item?.objects.map((item, index) => (
                        <SwiperSlide
                            key={index}
                            className="rounded-2xl group"
                            style={{ width: '500px', position: 'relative', overflow: 'hidden' }}
                        >
                            <div className="relative w-full aspect-[1.778]" onClick={() => onContentClick && onContentClick(item)}>

                                {item?.backdrops && item?.backdrops[0] ? (
                                    // <img src={`https://image.tmdb.org/t/p/original/${item?.backdrops[0]}`} className="w-full h-full transition-all group-hover:brightness-50" style={{ objectFit: 'cover' }} />
                                    <Image src={`https://image.tmdb.org/t/p/original/${item?.backdrops[0]}`} width={500} height={500} className="w-full h-full transition-all group-hover:brightness-50" style={{ objectFit: 'cover' }} alt={item?.title || item?.name} />
                                ) : (
                                    <div className="w-full h-full bg-black transition-all group-hover:brightness-50">
                                        <img src={`https://image.tmdb.org/t/p/original/${item?.posterPath}`} className="w-full h-full" style={{ objectFit: 'cover', filter: "blur(30px)" }} />
                                    </div>
                                )}
                                
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <IoIosExpand size={40} color={`rgba(${settings.primaryColor}, 1)`} />
                                </div>

                                <div className="absolute flex rounded-tr-2xl bottom-0 left-0 gap-3 bg-gradient-to-t from-black/80 to-transparent" style={{ height: '100%', width: '100%' }} draggable={false}>
                                    
                                    <div className="absolute top-0 right-0 flex flex-col items-end z-10">
                                        {(() => {
                                            const itemInWatchlist = page.pageContentDTOS.find(c => c.tmdbId === item.tmdbId && c.contentType === item.contentType)
                                            if(!itemInWatchlist) return null

                                            return (
                                                <div className={`p-1 px-2 bg-cyan-800/80 group-hover:brightness-50 transition-all ${item?.nextEpisode !== null && new Date(item?.nextEpisode) >= new Date() ? "w-full border-b-1 border-b-cyan-400" : "rounded-bl-lg"}`}>
                                                    <p className="text-sm font-semibold flex items-center justify-end h-full" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>
                                                        {itemInWatchlist.watched ? `Watched ${new Date(itemInWatchlist.watched ? itemInWatchlist.watchDate : (itemInWatchlist.started && !itemInWatchlist.watched) ? itemInWatchlist.startedDate : 0).toLocaleDateString('en-GB')}` : "In your watchlist"}
                                                    </p>
                                                </div>
                                            )
                                        })()}

                                        {(item?.nextEpisode !== null && new Date(item?.nextEpisode) >= new Date()) && (
                                            <div className={`p-1 px-2 bg-cyan-800/80 group-hover:brightness-50 transition-all rounded-bl-lg`}>
                                                <p className="text-sm font-semibold flex items-center justify-center h-full" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>
                                                    New episode on {new Date(item?.nextEpisode).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <Image 
                                        src={`https://image.tmdb.org/t/p/original/${item.posterPath}`} 
                                        width={500} 
                                        height={500} 
                                        className="object-cover rounded-2xl w-full h-full mt-auto group-hover:brightness-50 transition-all mb-4 ml-4" 
                                        style={{ height: '60%', width: 'auto', objectFit: "cover", boxShadow: '2px 2px 10px rgb(0, 0, 0, 1)' }}
                                        alt={item.title || item.name} 
                                        draggable={false} 
                                    />

                                    <div className="flex flex-col self-end mb-6 gap-1 tracking-wider group-hover:brightness-50 transition-all">
                                        <h1
                                            className="text-lg sm:text-xl md:text-2xl font-bold leading-[1.2] -mb-1"
                                            style={{ color: `rgba(${settings.primaryColor}, 1)` }}
                                        >
                                            {item.title}
                                        </h1>
                                        <div className="flex gap-2 text-sm sm:text-lg md:text-lg font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)`, textShadow: `2px 2px 2px rgba(0, 0, 0, 0.5)` }}>
                                            <p>{item.releaseDate.substring(0, 4)}</p>
                                            {item.certification && (
                                                <>                                                
                                                    <p>•</p>
                                                    <p>{item.certification}</p>
                                                </>
                                            )}
                                            {item.contentType === 'movie' ? (
                                                <>
                                                    <p>•</p>
                                                    <p>{item.runtime > 60 ? `${Math.floor(item.runtime / 60)}h ${item.runtime % 60}m` : `${item.runtime} mins`}</p>
                                                </>
                                            ) : item.totalSeasons > 0 ? (
                                                <>                                                
                                                    <p>•</p>
                                                    <p>{item.totalSeasons} seasons</p>
                                                </>
                                            ) : null}
                                        </div>
                                        <div className="flex gap-2 overflow-hidden whitespace-nowrap max-w-full">
                                            {(() => {
                                                const visibleGenres = [];
                                                let totalLength = 0;

                                                for (const genre of item.genres) {
                                                    totalLength += genre.length;

                                                    if (totalLength > 25) break;

                                                    visibleGenres.push(genre);
                                                }

                                                return (
                                                    <div className="flex gap-2 overflow-hidden">
                                                        {visibleGenres.map((genre) => (
                                                            <p
                                                                key={genre}
                                                                className="text-sm p-0.5 px-1.5 bg-cyan-800/30 rounded-full border border-cyan-500/80 whitespace-nowrap shrink-0"
                                                                style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}
                                                            >
                                                                {genre}
                                                            </p>
                                                        ))}
                                                        {item.genres.length > visibleGenres.length && (
                                                            <p
                                                                className="text-sm p-0.5 px-2 bg-cyan-800/30 rounded-full border border-cyan-500/80 whitespace-nowrap shrink-0"
                                                                style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}
                                                            >
                                                                {`+${item.genres.length - visibleGenres.length}`}
                                                            </p>
                                                        )}
                                                    </div>
                                                )
                                            })()}
                                            {/* {item.genres.map((genre: string) => (
                                                <p
                                                    key={genre}
                                                    className="text-sm p-0.5 px-2 bg-cyan-800/30 rounded-full border border-cyan-500/80 text-nowrap shrink-0"
                                                    style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}
                                                >
                                                    {genre}
                                                </p>
                                            ))} */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                <button 
                    className="custom-swiper-button-next absolute right-[5px] lg:right-[15px] top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-[36px] h-[36px] bg-cyan-800/60 rounded-full backdrop-blur-sm rounded-2xl cursor-pointer hover:scale-105 active:scale-100 disabled:cursor-default disabled:opacity-50 transition-all" 
                    style={{ boxShadow: '-2px 2px 10px rgb(0, 0, 0, 0.5)' }}
                >
                    <HiChevronRight color={`rgba(${settings.primaryColorDark}, 1)`} style={{ marginLeft: '2px' }} size={36} />
                </button>

                <button 
                    className="custom-swiper-button-prev absolute left-[5px] top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-[36px] h-[36px] bg-cyan-800/60 rounded-full backdrop-blur-sm rounded-2xl cursor-pointer hover:scale-105 active:scale-100 disabled:cursor-default disabled:opacity-50 transition-all"
                    style={{ boxShadow: '-2px 2px 10px rgb(0, 0, 0, 0.5)' }}
                >
                    <HiChevronLeft color={`rgba(${settings.primaryColorDark}, 1)`} style={{ marginRight: '2px' }} size={36} />
                </button>
            </div>
        </div>

    )
});
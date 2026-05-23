import React, { useState, useEffect, useRef, useCallback } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import settings from "../constants/settings.json";
import { Swiper } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { SwiperSlide } from "swiper/react";
import { Content } from "../types/content";
import { IoIosExpand } from "react-icons/io";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface TrendingProps {
    item: { title: string; subtitle: string; objects: any[] };
    onContentClick?: (content: Content) => void;
}

export const Trending = React.memo(function Trending({ item, onContentClick }: TrendingProps) {
    return (
        <div className="flex flex-col select-none gap-2 ">
            <div>
                <h1 className="text-2xl font-bold h-[30px]" style={{ color: `rgba(${settings.primaryColor}, 1)` }}>{item.title}</h1>
                <h1 className="text-xl font-bold h-[28px]" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>{item?.subtitle}</h1>
            </div>

            <div className="relative w-full">
                <Swiper
                    modules={[Navigation, Pagination]}
                    simulateTouch={false}
                    navigation={{
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    }}
                    slidesPerView={1.15}
                    draggable={false}
                    spaceBetween={-110}
                    pagination={{
                        clickable: true,
                    }}
                    className="w-full rounded-2xl [mask-image:linear-gradient(to_right,black_90%,transparent)]"
                >
                    {item?.objects.map((item, index) => (
                        <SwiperSlide
                            key={index}
                            className="rounded-2xl group"
                            style={{ width: '500px', position: 'relative', overflow: 'hidden' }}
                        >
                            <div className="relative w-full aspect-[1.778]" onClick={() => onContentClick && onContentClick(item)}>
                                {item?.backdrops && item?.backdrops[0] ? (
                                    <img src={`https://image.tmdb.org/t/p/original/${item?.backdrops[0]?.file_path}`} className="w-full h-full transition-all group-hover:brightness-50" style={{ objectFit: 'cover' }} />
                                ) : (
                                    <div className="w-full h-full bg-black transition-all group-hover:brightness-50">
                                        <img src={`https://image.tmdb.org/t/p/original/${item?.posterPath}`} className="w-full h-full" style={{ objectFit: 'cover', filter: "blur(30px)" }} />
                                    </div>
                                )}
                                
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <IoIosExpand size={40} color={`rgba(${settings.primaryColor}, 1)`} />
                                </div>

                                <div className="absolute flex rounded-tr-2xl bottom-0 left-0 gap-3 bg-gradient-to-t from-black/80 to-transparent" style={{ height: '100%', width: '100%' }} draggable={false}>
                                    <img
                                        src={`https://image.tmdb.org/t/p/original/${item.posterPath}`}
                                        className="object-cover rounded-2xl w-full h-full mt-auto group-hover:brightness-50 transition-all mb-4 ml-4"
                                        style={{ height: '60%', width: 'auto', objectFit: "cover", boxShadow: '2px 2px 10px rgb(0, 0, 0, 1)' }}
                                        draggable={false}
                                    />

                                    <div className="flex flex-col self-end mb-6 gap-2 tracking-wider group-hover:brightness-50 transition-all">
                                        <h1 className="text-2xl font-bold -mb-2" style={{ color: `rgba(${settings.primaryColor}, 1)`, textShadow: `2px 2px 2px rgba(0, 0, 0, 0.5)` }}>{item.title}</h1>
                                        <div className="flex gap-2 text-lg font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)`, textShadow: `2px 2px 2px rgba(0, 0, 0, 0.5)` }}>
                                            <p>{item.releaseDate.substring(0, 4)}</p>
                                            <p>•</p>
                                            <p>{item.certification}</p>
                                            <p>•</p>
                                            {item.contentType === 'movie' ? (
                                                <p>{item.runtime > 60 ? `${Math.floor(item.runtime / 60)}h ${item.runtime % 60}m` : `${item.runtime} mins`}</p>
                                            ) : (
                                                <p>{item.totalSeasons} seasons</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            {item.genres.map((genre: string) => (
                                                <p className="text-sm p-0.5 px-2 bg-cyan-800/30 rounded-full border-1 border-cyan-500/80" key={genre} style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>
                                                    {genre}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                <button className="swiper-button-next absolute right-15 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-7 h-7 bg-cyan-800/60 rounded-full backdrop-blur-sm rounded-2xl hover:scale-105 active:scale-100" style={{ boxShadow: '-2px 2px 10px rgb(0, 0, 0, 0.5)' }}>
                    <HiChevronRight color={`rgba(${settings.primaryColorDark}, 1)`} style={{ marginLeft: '2px' }} />
                </button>

                <button className="swiper-button-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-7 h-7 bg-cyan-800/60 rounded-full backdrop-blur-sm rounded-2xl hover:scale-105 active:scale-100" style={{ boxShadow: '-2px 2px 10px rgb(0, 0, 0, 0.5)' }}>
                    <HiChevronLeft color={`rgba(${settings.primaryColorDark}, 1)`} style={{ marginRight: '2px' }} />
                </button>
            </div>
        </div>

    )
});
'use client';

import React from "react";
import settings from "../constants/settings.json";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { BiTrash } from "react-icons/bi";
import { HiOutlinePlayCircle } from "react-icons/hi2";
import { CgCheck } from "react-icons/cg";
import Tilt from 'react-parallax-tilt';
import { useIsMobile } from "../hooks/useMobile";
import { Content } from "../types/content";

interface ContentCardProps {
    content: Content;
    onClick?: (content: Content) => void;
    onStatusChange?: (id: number) => void;
    onRemoveContent?: (id: number) => void;
    fromWatchlist?: boolean;
    focusedTitle: string;
    ownerPage: boolean;
}

export const ContentCard = React.memo(function ContentCard({ content, onClick, onStatusChange, onRemoveContent, fromWatchlist, focusedTitle, ownerPage }: ContentCardProps) {
    const [isButtonActive, setIsButtonActive] = React.useState(false);
    const isMobile = useIsMobile();

    const handleCardPointerDown = (e: React.PointerEvent) => {
        if ((e.target as HTMLElement).closest('button')) return;
        setIsButtonActive(false);
    };

    const handleButtonPointerDown = () => {
        setIsButtonActive(true);
    };

    const handlePointerUp = () => {
        setIsButtonActive(false);
    };

    // console.log(ownerPage)

    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const renderTitleWithHighlight = () => {
        const title = content.name ? content.name : content.title;
        const query = typeof focusedTitle === 'string' ? focusedTitle.trim() : '';
        if (!query) return <h2 className="font-bold leading-none line-clamp-1 text-md tracking-wider" style={{ color: `rgba(${settings.primaryColorDark}, 1)`, textShadow: `2px 2px 4px rgba(0, 0, 0, 1)` }} title={title}>{title}</h2>;

        try {
            const q = query.toLowerCase();
            const regex = new RegExp("(" + escapeRegex(q) + ")", 'i');

            const match = title.match(regex);

            if (!match || match.index === undefined) {
                return <h2 className="font-bold leading-none line-clamp-1 text-md tracking-wider" style={{ color: `rgba(${settings.primaryColorDark}, 1)`, textShadow: `2px 2px 4px rgba(0, 0, 0, 1)` }} title={title}>{title}</h2>;
            }

            const start = match.index;
            const matchedText = match[0];
            const before = title.substring(0, start);
            const after = title.substring(start + matchedText.length);

            return (
                <h2 className="font-bold leading-none line-clamp-1 text-md tracking-wider" style={{ color: `rgba(${settings.primaryColorDark}, 1)`, textShadow: `2px 2px 4px rgba(0, 0, 0, 1)` }} title={title}>
                    {before}
                    <span className="font-bold text-md tracking-wider inline" style={{ color: `#fff7a8`, textShadow: `2px 2px 4px rgba(0, 0, 0, 1)` }}>{matchedText}</span>
                    {after}
                </h2>
            );
        } catch (e) {
            return <h2 className="font-bold leading-none line-clamp-1 text-md tracking-wider" style={{ color: `rgba(${settings.primaryColorDark}, 1)`, textShadow: `2px 2px 4px rgba(0, 0, 0, 1)` }} title={title}>{title}</h2>;
        }
    }

    const cardContent = (
        <div className="flex rounded-2xl shadow-inner shadow-zinc-200/30 cursor-pointer transform-gpu transition-all will-change-transform overflow-hidden" onClick={() => onClick && onClick(content)} onPointerDown={handleCardPointerDown} onPointerUp={handlePointerUp}>
            <div className={`relative flex flex-col p-4`}>
                
                <div className="absolute w-full h-full top-0 left-0 rounded-xl overflow-hidden -z-10">
                    <img
                        src={content.posterPath ? content.posterPath : `https://image.tmdb.org/t/p/w500//${content?.posterPath}`}
                        style={{ width: '100%', height: "100%", zIndex: -1, opacity: 1, filter: "blur(15px)" }}
                    />
                </div>

                <div className="flex flex-col gap-5">
                    {(content.watched || (content.started && !content.watched)) && (
                        <div className="absolute flex w-full p-1 bg-black/60 z-10 top-0 left-0 justify-center text-nowrap items-center border-b-1 border-cyan-800 backdrop-blur-sm">
                            <CgCheck size={20} style={{ color: `rgba(${settings.primaryColorDark}, 1)` }} />
                            <p className="text-xs font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>{content.watched ? "Watched" : (content.started && !content.watched) ? "Started" : ""} on {new Date(content.watched ? content.watchDate : (content.started && !content.watched) ? content.startedDate : 0).toLocaleDateString('en-GB')}</p>
                        </div>
                    )}

                    <div className="relative rounded-xl overflow-hidden">
                        {(content.posterPath && content.posterPath !== null) ? (
                            <img src={`https://image.tmdb.org/t/p/w500/${content.posterPath}`} className="w-full h-full object-cover rounded-xl" alt={content.title} draggable={false} />
                        ) : (
                            content.movies && (
                                <div className="relative w-full h-full rounded-xl overflow-hidden">
                                    <div className="grid grid-cols-2 relative w-full h-full rounded-xl overflow-hidden brightness-50 backdrop-blur-sm">
                                        {content.movies.slice(0, 4).map((movie: any) => (
                                            <img key={movie.id} src={`https://image.tmdb.org/t/p/w500/${movie.posterPath}`} className="w-full h-full object-cover" alt={movie.title} draggable={false} />
                                        ))}
                                    </div>
                                    <p className="absolute top-0 w-full h-full font-bold content-center text-center" style={{ color: `rgba(${settings.primaryColorDark}, 1)`, textShadow: `2px 2px 4px rgba(0, 0, 0, 1)` }}>{content.name}</p>
                                </div>
                            )
                        )}

                        <div className="absolute w-full h-20 bottom-0 bg-gradient-to-t from-black to-transparent"></div>
                        <div className="flex flex-col absolute bottom-2 left-2 gap-1 ">
                            {renderTitleWithHighlight()}
                            <div className="flex gap-1 flex-nowrap">
                                {content.movies ? (
                                    <>
                                        <p className="text-xs text-nowrap tracking-wider font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)`, textShadow: `2px 2px 4px rgba(0, 0, 0, 1)` }}>
                                            {(() => {
                                                const years = content.movies.map((m: any) => parseInt(m.releaseDate?.substring(0, 4) || '0')).filter((y: number) => y > 0);
                                                const minYear = Math.min(...years);
                                                const maxYear = Math.max(...years);
                                                return minYear === maxYear ? minYear : `${minYear}-${maxYear}`;
                                            })()}
                                        </p>

                                        <p className="text-xs text-nowrap tracking-wider font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)`, textShadow: `2px 2px 4px rgba(0, 0, 0, 1)` }}>•</p>
                                        <p className="text-xs text-nowrap tracking-wider font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)`, textShadow: `2px 2px 4px rgba(0, 0, 0, 1)` }}>{content.movies.length} movies</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-xs text-nowrap tracking-wider font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)`, textShadow: `2px 2px 4px rgba(0, 0, 0, 1)` }}>{content?.releaseDate?.substring(0, 4)}</p>
                                        {content.certification && (
                                            <>                                    
                                                <p className="text-xs text-nowrap tracking-wider font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)`, textShadow: `2px 2px 4px rgba(0, 0, 0, 1)` }}>•</p>
                                                <p className="text-xs text-nowrap tracking-wider font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)`, textShadow: `2px 2px 4px rgba(0, 0, 0, 1)` }}>{content.certification}</p>
                                            </>
                                        )}
                                        {content.contentType === 'movie' ? (
                                            <>                                    
                                                <p className="text-xs text-nowrap tracking-wider font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)`, textShadow: `2px 2px 4px rgba(0, 0, 0, 1)` }}>•</p>
                                                <p className="text-xs text-nowrap tracking-wider font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)`, textShadow: `2px 2px 4px rgba(0, 0, 0, 1)` }}>{content.runtime > 60 ? `${Math.floor(content.runtime / 60)}h ${content.runtime % 60}m` : `${content.runtime} mins`}</p>
                                            </>
                                        ) : (
                                            content.totalSeasons > 0 && (
                                                <>                                        
                                                    <p className="text-xs text-nowrap tracking-wider font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)`, textShadow: `2px 2px 4px rgba(0, 0, 0, 1)` }}>•</p>
                                                    <p className="text-xs text-nowrap tracking-wider font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)`, textShadow: `2px 2px 4px rgba(0, 0, 0, 1)` }}>{content.totalSeasons} seasons</p>
                                                </>
                                            )
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {(fromWatchlist && ownerPage) && (
                        <div className="flex justify-between gap-2">
                            <button className="p-1.5 px-3 flex-1 uppercase rounded-xl bg-cyan-800/80 font-bold tracking-widest text-sm shadow-inner shadow-cyan-200/30 cursor-pointer hover:scale-105 active:scale-95 transition-all" style={{color: `rgba(${settings.primaryColor}, 1)`}} onClick={(e) => { e.stopPropagation(); onStatusChange && onStatusChange(content.id); }} onPointerDown={handleButtonPointerDown}>
                                {content.watched ? (
                                    <BsEyeSlash size={20} className="ml-auto mr-auto" />
                                ) : (
                                    content.contentType === 'movie' || (content.started && !content.watched) ? (
                                        <BsEye size={20} className="ml-auto mr-auto" />
                                    ) : (
                                        <HiOutlinePlayCircle size={20} className="ml-auto mr-auto" />
                                    )
                                )}
                                
                            </button>
                            <button className="p-1.5 px-3 uppercase rounded-xl bg-fuchsia-800/80 font-bold tracking-widest text-sm shadow-inner shadow-fuchsia-200/30 cursor-pointer hover:scale-105 active:scale-95 transition-all" style={{color: `rgba(${settings.secondaryColor}, 1)`}} onClick={(e) => { e.stopPropagation(); onRemoveContent && onRemoveContent(content.id); }} onPointerDown={handleButtonPointerDown}>
                                <BiTrash size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )

    return isMobile ? (
        <div className={`${content.watched || content.started ? "opacity-80" : ""} rounded-2xl overflow-hidden select-none hover:scale-105 active:scale-95 transition-all duration-150`}>
            {cardContent}
        </div>
    ) : (
        <Tilt tiltReverse={true} tiltMaxAngleX={5} tiltMaxAngleY={5} transitionSpeed={500} scale={1.05} glareEnable={true} glareMaxOpacity={0.1} glareColor="#ffffff" glarePosition="all" glareBorderRadius="16px" className={`${content.watched || content.started ? "opacity-80" : ""} select-none parallax-effect-img ${!isButtonActive ? "active:scale-95" : ""}`}>
            {cardContent}
        </Tilt>
    )
});
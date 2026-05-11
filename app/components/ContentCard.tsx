import React from "react";
import settings from "../constants/settings.json";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { BiTrash } from "react-icons/bi";
import { HiOutlinePlayCircle } from "react-icons/hi2";
import { CgCheck } from "react-icons/cg";
import Tilt from 'react-parallax-tilt';
import { Content } from "../types/content";

interface ContentCardProps {
    content: Content;
    onClick?: (content: Content) => void;
    onStatusChange?: (id: number) => void;
    onRemoveContent?: (id: number) => void;
    fromWatchlist?: boolean;
}

export const ContentCard = React.memo(function ContentCard({ content, onClick, onStatusChange, onRemoveContent, fromWatchlist }: ContentCardProps) {
    return (
        <Tilt tiltReverse={true} tiltMaxAngleX={5} tiltMaxAngleY={5} transitionSpeed={500} scale={1.05} glareEnable={true} glareMaxOpacity={0.1} glareColor="#ffffff" glarePosition="all" glareBorderRadius="16px" className={`${content.watched || content.started ? "opacity-80" : ""} select-none parallax-effect-img active:scale-95`}>
            <div className="flex rounded-2xl shadow-inner shadow-zinc-200/30 cursor-pointer transform-gpu transition-all will-change-transform overflow-hidden" onClick={() => onClick && onClick(content)}>
                <div className={`relative flex flex-col p-4`}>
                    
                    <div className="absolute w-full h-full top-0 left-0 rounded-xl overflow-hidden -z-10">
                        <img
                            src={content.posterPath ? content.posterPath : `https://image.tmdb.org/t/p/w500//${content?.posterPath}`}
                            style={{ width: '100%', height: "100%", zIndex: -1, opacity: 1, filter: "blur(15px)" }}
                        />
                    </div>

                    <div className="flex flex-col gap-5">
                        {content.watched && (
                            <div className="absolute flex w-full p-1 bg-black/60 z-10 top-0 left-0 justify-center items-center border-b-1 border-cyan-800 backdrop-blur-sm">
                                <CgCheck size={20} className="absolute left-1" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }} />
                                <p className="text-xs font-bold text-center" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>Watched on {new Date(content.watchDate).toLocaleDateString('en-GB')}</p>
                            </div>
                        )}

                        {(content.started && !content.watched) && (
                            <div className="absolute flex w-full p-1 bg-black/60 z-10 top-0 left-0 justify-center items-center border-b-1 border-cyan-800 backdrop-blur-sm">
                                <CgCheck size={20} className="absolute left-1" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }} />
                                <p className="text-xs font-bold text-center" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>Started on {new Date(content.startedDate).toLocaleDateString('en-GB')}</p>
                            </div>
                        )}

                        <div className="relative rounded-xl overflow-hidden">
                            <img src={`https://image.tmdb.org/t/p/w500/${content.posterPath}`} className="w-full h-full object-cover rounded-xl" alt={content.title} draggable={false} />
                            <div className="absolute w-full h-20 bottom-0 bg-gradient-to-t from-black to-transparent"></div>
                            <div className="flex flex-col absolute bottom-2 left-2 gap-1 ">
                                <h2 className="font-bold leading-none line-clamp-1 text-md tracking-wider" style={{ color: `rgba(${settings.primaryColorDark}, 1)`, textShadow: `2px 2px 4px rgba(0, 0, 0, 1)` }} title={content.title}>
                                    {content.title}
                                </h2>
                                <div className="flex gap-1 flex-nowrap">
                                    <p className="text-xs text-nowrap tracking-wider font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)`, textShadow: `2px 2px 4px rgba(0, 0, 0, 1)` }}>{content.releaseDate.substring(0, 4)}</p>
                                    <p className="text-xs text-nowrap tracking-wider font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)`, textShadow: `2px 2px 4px rgba(0, 0, 0, 1)` }}>•</p>
                                    <p className="text-xs text-nowrap tracking-wider font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)`, textShadow: `2px 2px 4px rgba(0, 0, 0, 1)` }}>{content.certification}</p>
                                    <p className="text-xs text-nowrap tracking-wider font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)`, textShadow: `2px 2px 4px rgba(0, 0, 0, 1)` }}>•</p>
                                    {content.contentType === 'movie' ? (
                                        <p className="text-xs text-nowrap tracking-wider font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)`, textShadow: `2px 2px 4px rgba(0, 0, 0, 1)` }}>{content.runtime > 60 ? `${Math.floor(content.runtime / 60)}h ${content.runtime % 60}m` : `${content.runtime} mins`}</p>
                                    ) : (
                                        <p className="text-xs text-nowrap tracking-wider font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)`, textShadow: `2px 2px 4px rgba(0, 0, 0, 1)` }}>{content.totalSeasons} seasons</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {fromWatchlist && (
                            <div className="flex justify-between gap-2">
                                <button className="p-1.5 px-3 flex-1 uppercase rounded-xl bg-cyan-800/80 font-bold tracking-widest text-sm shadow-inner shadow-cyan-200/30 cursor-pointer hover:scale-105 transition-all" style={{color: `rgba(${settings.primaryColor}, 1)`}} onClick={(e) => { e.stopPropagation(); onStatusChange && onStatusChange(content.id); }}>
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
                                <button className="p-1.5 px-3 uppercase rounded-xl bg-fuchsia-800/80 font-bold tracking-widest text-sm shadow-inner shadow-fuchsia-200/30 cursor-pointer hover:scale-105 transition-all" style={{color: `rgba(${settings.secondaryColor}, 1)`}} onClick={(e) => { e.stopPropagation(); onRemoveContent && onRemoveContent(content.id); }}>
                                    <BiTrash size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Tilt>
    )
});
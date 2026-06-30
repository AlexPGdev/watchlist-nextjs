
import { memo, useEffect, useRef, useState } from "react";
import settings from "../../../constants/settings.json";
import { BiArrowBack, BiX } from "react-icons/bi";
// import { Person } from "../../../types/person";
import { useSearchParams, useRouter } from "next/navigation";

interface PersonViewProps {
    info: { id: string, type: string };
    onClick?: (content: any, type: string) => void;
    onClose?: () => void;
    onBack?: () => void;
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const PersonView = memo(function PersonView({ onClick, info, onClose, onBack }: PersonViewProps) {

    const [ person, setPerson ] = useState<any>(null);
    const [ images, setImages ] = useState<any[]>([]);
    const [ cast, setCast ] = useState<any[]>([]);
    const [ crew, setCrew ] = useState<any[]>([]);
    const [ upcoming, setUpcoming ] = useState<any[]>([]);
    const [ showMore, setShowMore ] = useState(false);
    const [ biographyShowMore, setBiographyShowMore ] = useState(false);
    const [fullPoster, setFullPoster] = useState(false);

    const [castScrollable, setCastScrollable] = useState(false);
    const castScrollRef = useRef<HTMLDivElement | null>(null);


    useEffect(() => {
        if (!info.id || !info.type) return

        fetch(`https://api.spectaer.com/watchlist/api/content/person/${info.id}`, {
            "method": "GET"
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {

                setPerson(data.details)
                setImages(data.details.images)
                setCast(data.details.combined_credits.cast)
                setCrew(data.details.combined_credits.crew)
                setUpcoming(data.upcoming)
            })
    }, [info.id, info.type])

    useEffect(() => {
        if (!fullPoster) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setFullPoster(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [fullPoster]);


    useEffect(() => {
        const isScrollable = (element: HTMLDivElement | null) => Boolean(element && element.scrollWidth > element.clientWidth);

        const updateScrollables = () => {
            setCastScrollable(isScrollable(castScrollRef.current));
        };

        updateScrollables();
        window.addEventListener('resize', updateScrollables);

        return () => {
            window.removeEventListener('resize', updateScrollables);
        };
    }, [cast?.length]);

    const handleOnClose = () => {
        onClose && onClose()
    }

    return (
        <>

            <div className="absolute inset-0 rounded-2xl overflow-hidden -z-10">
                {person?.profile_path && (
                    <img src={`https://image.tmdb.org/t/p/w500/${person?.profile_path}`} className="w-full h-full object-cover" style={{ opacity: 0.5, filter: "blur(100px)" }} />
                )}
            </div>

            {fullPoster && person?.profile_path && (
                <div
                    className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-3 sm:p-6"
                    onClick={() => setFullPoster(false)}
                >
                    <button
                        type="button"
                        className="absolute top-4 right-4 z-10 rounded-full bg-black/60 p-2 text-white shadow-lg backdrop-blur-sm hover:bg-black/80"
                        onClick={(event) => {
                            event.stopPropagation();
                            setFullPoster(false);
                        }}
                        aria-label="Close poster preview"
                    >
                        <BiX size={24} className={`cursor-pointer`} />
                    </button>

                    <div className="relative flex max-h-[90vh] max-w-[95vw] items-center justify-center">
                        <img
                            src={`https://image.tmdb.org/t/p/original/${person?.profile_path}`}
                            alt={`${person?.name} poster`}
                            className="max-h-[90vh] max-w-[95vw] rounded-2xl object-contain shadow-2xl"
                        />
                    </div>
                </div>
            )}

            <div className="flex flex-col overflow-y-scroll p-5 px-5 no-scrollbar gap-2">
                <button className="absolute z-10 top-3 left-3 cursor-pointer hover:scale-105 active:scale-95 transition-all text-zinc-200 bg-zinc-800/60 shadow-inner shadow-zinc-200/30 rounded-full backdrop-blur-sm" onClick={onBack}>
                    <BiArrowBack size={35} className="p-1" />
                </button>
                
                <button className="absolute z-10 top-3 right-3 cursor-pointer hover:scale-105 active:scale-95 transition-all bg-fuchsia-500/20 rounded-full backdrop-blur-sm" onClick={handleOnClose}>
                    <BiX size={35} color={`rgba(${settings.secondaryColor}, 1)`} />
                </button>

                <div className="flex flex-col gap-1 w-full border-b-2 border-cyan-500/30 pb-2">
                    <button className="flex ml-auto mr-auto justify-center gap-2 rounded-2xl w-[100px] overflow-hidden cursor-pointer hover:scale-105 transition-all" onClick={() => setFullPoster(true)}>
                        <img src={`https://image.tmdb.org/t/p/w500/${person?.profile_path}`} className="w-full h-full object-cover" alt={person?.name} />
                    </button>

                    <div className="flex flex-col">
                        <h1 className="text-lg font-bold text-center tracking-wider leading-none" style={{ color: `rgba(${settings.primaryColor}, 1)` }}>{person?.name}</h1>

                        <div className="flex gap-1 justify-center text-center text-md"  style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>
                            <p>Born {months[new Date(person?.birthday).getMonth()]} {new Date(person?.birthday).getDate()}, {new Date(person?.birthday).getFullYear()}</p>
                            {person?.deathday !== null && (
                                <>                                
                                    <p>•</p>
                                    <p>Died {months[new Date(person?.deathday).getMonth()]} {new Date(person?.deathday).getDate()}, {new Date(person?.deathday).getFullYear()}</p>
                                </>
                            )}

                            {person?.place_of_birth && (
                                <>                                        
                                    <p>•</p>
                                    <p title={person?.place_of_birth}>{person?.place_of_birth.split(", ").length > 1 ? person?.place_of_birth.split(", ")[person?.place_of_birth.split(",").length - 1] : person?.place_of_birth}</p>
                                </>
                            )}
                        </div>

                        <div className="flex justify-center gap-2 mt-2 max-w-3/4 flex-wrap ml-auto mr-auto">
                            {person?.known_for_department === "Acting" && (
                                <>
                                    <p className="text-xs py-0.5 px-1.5 content-center bg-cyan-800/30 rounded-full border-1 border-cyan-500/80 text-nowrap" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>Actor</p>
                                </>
                            )}

                            {[...new Set(crew.filter(c => c.job !== "Thanks").map(c => c.job))].slice(0, showMore ? crew.filter(c => c.job !== "Thanks").length : 2).map((g, i) => (
                                <p key={i} className="text-xs py-0.5 px-1.5 content-center bg-cyan-800/30 rounded-full border-1 border-cyan-500/80 text-nowrap" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>{g}</p>
                            ))}

                            {([...new Set(crew.filter(c => c.job !== "Thanks").map(c => c.job))].length > 2 && !showMore) && (
                                <button 
                                    className="text-xs py-0.5 px-1.5 content-center bg-cyan-800/30 rounded-full border-1 border-cyan-500/80 text-nowrap cursor-pointer hover:scale-105 active:scale-95 transition-all" 
                                    style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}
                                    onClick={() => setShowMore(prev => !prev)}
                                >
                                    +{[...new Set(crew.filter(c => c.job !== "Thanks").map(c => c.job))].length - 2} more
                                </button>
                            )}
                        </div>

                        <div className="flex gap-6 justify-center mt-4 max-w-3/4 flex-wrap ml-auto mr-auto">
                            <div className="flex flex-col text-center">
                                <p className="uppercase text-sm tracking-wider font-semibold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>Age</p>
                                <p className="text-md font-semibold" style={{ color: `rgba(${settings.primaryColor}, 1)` }}>
                                    {person?.birthday && (
                                        (() => {
                                            const today = new Date();
                                            const dob = new Date(person?.birthday);

                                            let age = today.getFullYear() - dob.getFullYear();
                                            const m = today.getMonth() - dob.getMonth();
                                            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                                                age--;
                                            }

                                            return `${age}`;
                                        })()
                                    )}
                                </p>
                            </div>
                            <div className="flex flex-col text-center">
                                <p className="uppercase text-sm tracking-wider font-semibold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>Casts</p>
                                <p className="text-md font-semibold" style={{ color: `rgba(${settings.primaryColor}, 1)` }}>
                                    {cast.length}
                                </p>
                            </div>
                            <div className="flex flex-col text-center">
                                <p className="uppercase text-sm tracking-wider font-semibold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>Credits</p>
                                <p className="text-md font-semibold" style={{ color: `rgba(${settings.primaryColor}, 1)` }}>
                                    {crew.filter(c => c.job !== "Actor").length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-6 w-full">
                    <div className="flex flex-col gap-1">
                        <h1 className="uppercase text-md font-semibold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>Biography</h1>
                        <div className="flex flex-col">
                            <p className={`text-sm ${biographyShowMore ? "" : "line-clamp-7"}`}>
                                {person?.biography}
                            </p>

                            <button className="self-start text-sm text-cyan-500 cursor-pointer hover:underline text-nowrap select-none" onClick={() => setBiographyShowMore(prev => !prev)}>
                                {biographyShowMore ? "Show less" : "Show more"}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        {person?.known_for_department === "Acting" && (
                            <div>
                                <h1 className="uppercase text-md font-semibold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>Known for</h1>
                                <div className="relative flex flex-col text-zinc-200 text-md gap-1 rounded-2xl" style={{ textShadow: `2px 2px 2px rgba(0, 0, 0, 0.5)` }}>
                                    <div className="rounded-2xl overflow-hidden">
                                        <div ref={castScrollRef} className="relative p-1 flex gap-2 overflow-x-scroll no-scrollbar">                                                
                                            {cast && cast.length > 0 && (
                                                (() => {
                                                        const seen = new Map<number, { member: any; characters: { character: string, year: number }[]; }>();
                                                        const result: any[] = [];
                            
                                                        cast?.forEach((c) => {
                                                            if (!seen.has(c.id)) {
                                                                seen.set(c.id, { member: c, characters: [{ character: c.character, year: c.first_credit_air_date?.substring(0, 4) || c.release_date?.substring(0, 4) || "N/A" }] });
                                                                result.push(seen.get(c.id));
                                                            } else {
                                                                seen.get(c.id)?.characters.push({ character: c.character, year: c.first_credit_air_date?.substring(0, 4) || c.release_date?.substring(0, 4) || "N/A" });
                                                            }
                                                        });

                                                        function getSortedCredits(creditsArray: any) {
                                                            return creditsArray.filter((c: any) => !`${c?.member.character}`.toLowerCase().includes('self') && `${c?.member.character}`.length > 0)
                                                                .map((credit: any) => {
                                                                let roleWeight = 10; // Default fallback for unknown billing / minor roles
                                                                if (credit.member.media_type === 'movie' || credit.member.mediaType === "movie") {
                                                                    // For movies, rely heavily on the explicit billing order
                                                                    if (typeof credit.member.order === 'number') {
                                                                        roleWeight = credit.member.order; 
                                                                        if(credit.member.order <= 1) {
                                                                            roleWeight = 0;
                                                                        }else if(credit.member.order <= 2) {
                                                                            roleWeight = 1;
                                                                        } else if(credit.member.order <= 5) {
                                                                            roleWeight = 2;
                                                                        } else {
                                                                            roleWeight = credit.member.order;
                                                                        }
                                                                    }
                                                                } else if (credit.member.media_type === 'tv' || credit.member.mediaType === "tv") {
                                                                    // For TV, use episode counts to determine star status
                                                                    // A main cast member in a long show has a high episode count
                                                                    if (credit.member.episode_count > 50) {
                                                                        roleWeight = 0; // Absolute main star (e.g., Jennifer Aniston in Friends)
                                                                    } else if (credit.member.episode_count > 20) {
                                                                        roleWeight = 1; // Major recurring star
                                                                    } else if (credit.member.episode_count > 5) {
                                                                        roleWeight = 5; // Supporting/Guest arc
                                                                    } else {
                                                                        roleWeight = 10; // Cameo or single episode
                                                                    }
                                                                }
                                                                // Safety net: Leverage project popularity to help rank the project.
                                                                // We divide by popularity so that highly popular shows lower the total score.
                                                                const popularityBonus = credit.member.popularity ? (Math.log10(credit.member.popularity) * 5) : 0;
                                                                
                                                                // Calculate final composite score (Lower score = higher importance)
                                                                const finalScore = roleWeight - popularityBonus;
                                                                return {
                                                                    ...credit,
                                                                    custom_importance_score: finalScore
                                                                };
                                                                })
                                                                // Sort ascending by your new importance score
                                                                .sort((a: any, b: any) => a.custom_importance_score - b.custom_importance_score);
                                                        }
                            
                            
                                                    // return result.filter(c => !`${c?.member.character}`.toLowerCase().includes('self') && `${c?.member.character}`.length > 0).sort(compare).map((c, i) => {
                                                    return getSortedCredits(result).slice(0, result.length >= 6 ? 6 : result.length).map((c: any, i: number) => {
                                                        return (
                                                        <button key={i} className={`flex flex-col w-[100px] shrink-0 ${i === result.length - 1 ? "mr-2" : ""} text-left cursor-pointer hover:scale-105 transition-all`} onClick={() => onClick && onClick(c.member, c.member?.mediaType)}>
                                                            <div className="flex rounded-lg shrink-0 overflow-hidden">
                                                                <img src={`https://image.tmdb.org/t/p/original/${c?.member?.poster_path}`} className="w-full h-full object-cover" alt={c?.member?.title || c?.member?.name} />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <p className="text-sm font-bold line-clamp-2 text-zinc-300">{c?.member?.title || c?.member?.name} ({c?.characters?.map((char: any) => char.year).sort((a: number, b: number) => a - b).join(", ")})</p>
                                                                {
                                                                    c?.characters?.map((char: any) => char)
                                                                        .sort((a: {year: number}, b: {year: number}) => a.year - b.year)
                                                                        .map((char: any) => 
                                                                            <div key={char.character} className="flex gap-1">
                                                                                <span
                                                                                    className="flex h-[1lh] shrink-0 items-center text-sm"
                                                                                    style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}
                                                                                >
                                                                                    •
                                                                                </span>
                                                                                <p
                                                                                    className="text-sm leading-none font-semibold"
                                                                                    style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}
                                                                                >
                                                                                    {char.character}
                                                                                </p>
                                                                            </div>
                                                                        )
                                                                }
                                                            </div>
                                                        </button>
                                                        )
                                                    })
                                                })()
                                            )}
                                        </div>
                                        {castScrollable && (
                                            <div className="absolute top-0 right-0 bottom-0 w-[60px] rounded-r-2xl select-none pointer-events-none" style={{ background: `linear-gradient(to left, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0))`, zIndex: 1 }} />
                                        )}
                                    </div>
                                </div>

                                {upcoming.length > 0 && (
                                    <>                                    
                                        <h1 className="uppercase text-md font-semibold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>Upcoming</h1>
                                        <div className="relative flex flex-col text-zinc-200 text-md gap-1 rounded-2xl" style={{ textShadow: `2px 2px 2px rgba(0, 0, 0, 0.5)` }}>
                                            <div className="rounded-2xl overflow-hidden">
                                                <div className="relative p-1 flex gap-2 overflow-x-scroll no-scrollbar">                                                
                                                    {upcoming.sort((a, b) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime()).slice(0, upcoming.length >= 6 ? 6 : upcoming.length).map((c, i) => (
                                                        <button key={i} className={`flex flex-col w-[100px] shrink-0 ${i === upcoming.length - 1 ? "mr-2" : ""} text-left cursor-pointer hover:scale-105 transition-all`} onClick={() => onClick && onClick(c, "movie")}>
                                                            <div className="flex rounded-lg shrink-0 overflow-hidden">
                                                                <img src={`https://image.tmdb.org/t/p/original/${c?.poster_path}`} className="w-full h-full object-cover" alt={c?.title || c?.name} />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <p className="text-sm font-bold line-clamp-2 text-zinc-300">{c?.title || c?.name}</p>
                                                                <p className="text-xs line-clamp-2 leading-none font-semibold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>{c?.release_date?.substring(0, 4)}</p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {person?.known_for_department === "Directing" && ( 
                            <div>
                                <h1 className="uppercase text-md font-semibold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>Known for directing</h1>
                                <div className="relative flex flex-col text-zinc-200 text-md gap-1 rounded-2xl" style={{ textShadow: `2px 2px 2px rgba(0, 0, 0, 0.5)` }}>
                                    <div className="rounded-2xl overflow-hidden">
                                        <div ref={castScrollRef} className="relative p-1 flex gap-2 overflow-x-scroll no-scrollbar">                                          
                                            {crew && crew.length > 0 && (
                                                crew.filter(c => c.job === "Director").sort((a, b) => b.popularity - a.popularity).map((c, i) => (
                                                    <button key={i} className={`flex flex-col w-[100px] shrink-0 ${i === upcoming.length - 1 ? "mr-2" : ""} text-left cursor-pointer hover:scale-105 transition-all`} onClick={() => onClick && onClick(c, c.mediaType)}>
                                                        <div className="flex rounded-lg shrink-0 overflow-hidden">
                                                            <img src={`https://image.tmdb.org/t/p/original/${c?.poster_path}`} className="w-full h-full object-cover" alt={c?.title || c?.name} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <p className="text-sm font-bold line-clamp-2 text-zinc-300">{c?.title || c?.name}</p>
                                                            <p className="text-xs line-clamp-2 leading-none font-semibold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>{c?.job}</p>
                                                        </div>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                        {castScrollable && (
                                            <div className="absolute top-0 right-0 bottom-0 w-[60px] rounded-r-2xl select-none pointer-events-none" style={{ background: `linear-gradient(to left, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0))`, zIndex: 1 }} />
                                        )}
                                    </div>                             
                                </div>

                                {upcoming.length > 0 && (
                                    <>                                    
                                        <h1 className="uppercase text-md font-semibold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>Upcoming</h1>
                                        <div className="relative flex flex-col text-zinc-200 text-md gap-1 rounded-2xl" style={{ textShadow: `2px 2px 2px rgba(0, 0, 0, 0.5)` }}>
                                            <div className="rounded-2xl overflow-hidden">
                                                <div className="relative p-1 flex gap-2 overflow-x-scroll no-scrollbar">                                                
                                                    {upcoming.sort((a, b) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime()).slice(0, upcoming.length >= 6 ? 6 : upcoming.length).map((c, i) => (
                                                        <button key={i} className={`flex flex-col w-[100px] shrink-0 ${i === upcoming.length - 1 ? "mr-2" : ""} text-left cursor-pointer hover:scale-105 transition-all`} onClick={() => onClick && onClick(c, "movie")}>
                                                            <div className="flex rounded-lg shrink-0 overflow-hidden">
                                                                <img src={`https://image.tmdb.org/t/p/original/${c?.poster_path}`} className="w-full h-full object-cover" alt={c?.title || c?.name} />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <p className="text-sm font-bold line-clamp-2 text-zinc-300">{c?.title || c?.name}</p>
                                                                <p className="text-xs line-clamp-2 leading-none font-semibold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>{c?.release_date?.substring(0, 4)}</p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="h-10">

                </div>


            </div>


        </>
    )

})
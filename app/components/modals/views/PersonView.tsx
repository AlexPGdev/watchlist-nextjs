
import { memo, useEffect, useRef, useState } from "react";
import settings from "../../../constants/settings.json";
import { BiX } from "react-icons/bi";
// import { Person } from "../../../types/person";
import { useSearchParams, useRouter } from "next/navigation";

interface PersonViewProps {
    info: { id: string, type: string };
    onClick?: (content: any, type: string) => void;
    onClose?: () => void;
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const PersonView = memo(function PersonView({ onClick, info, onClose }: PersonViewProps) {

    const [ person, setPerson ] = useState<any>(null);
    const [ images, setImages ] = useState<any[]>([]);
    const [ cast, setCast ] = useState<any[]>([]);
    const [ crew, setCrew ] = useState<any[]>([]);
    const [ showMore, setShowMore ] = useState(false);
    const [ biographyShowMore, setBiographyShowMore ] = useState(false);

    useEffect(() => {
        if (!info.id || !info.type) return

        fetch(`https://api.spectaer.com/watchlist/api/content/person/${info.id}`, {
            "method": "GET"
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {

                setPerson(data)
                setImages(data.images)
                setCast(data.combined_credits.cast)
                setCrew(data.combined_credits.crew)
            })
    }, [info.id, info.type])

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

            <div className="flex flex-col overflow-y-scroll p-5 px-5 no-scrollbar gap-2">
                <button className="absolute z-10 top-3 right-3 cursor-pointer hover:scale-105 active:scale-95 transition-all bg-fuchsia-500/20 rounded-full backdrop-blur-sm" onClick={handleOnClose}>
                    <BiX size={35} color={`rgba(${settings.secondaryColor}, 1)`} />
                </button>

                <div className="flex flex-col gap-1 w-full border-b-2 border-cyan-500/30 pb-2">
                    <div className="flex ml-auto mr-auto justify-center gap-2 rounded-2xl w-[100px] overflow-hidden">
                        <img src={`https://image.tmdb.org/t/p/w500/${person?.profile_path}`} className="w-full h-full object-cover" alt={person?.name} />
                    </div>

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

                <div className="flex gap-6 w-full">
                    <div className="flex flex-col gap-1 max-w-1/2">
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
                            <>                            
                                <h1 className="uppercase text-md font-semibold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>Known for</h1>
                                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-scroll no-scrollbar p-2 rounded-2xl border-2 border-cyan-500/30">
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
                    
                    
                                            return result.filter(c => !`${c?.member.character}`.toLowerCase().includes('self') && `${c?.member.character}`.length > 0).sort((a, b) => b?.member.popularity - a?.member.popularity).map((c, i) => (
                                                <div key={i} className="flex gap-2 w-full items-center mb-2 cursor-pointer hover:scale-105 transition-all"  onClick={() => onClick && onClick(c.member, "tv_series")}>
                                                    <div className="flex rounded-lg shrink-0 overflow-hidden w-[70px]">
                                                        <img src={`https://image.tmdb.org/t/p/original/${c?.member.poster_path}`} className="w-full h-full object-cover" alt={c?.member.title || c?.member.name} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <p className="text-sm font-semibold" style={{ color: `rgba(${settings.primaryColor}, 1)` }}>{c?.member.title || c?.member.name} ({c?.characters.map((char: any) => char.year).sort((a: number, b: number) => a - b).join(", ")})</p>
                                                        {
                                                            c?.characters
                                                                .map((char: any) => char)
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
                                                                            className="text-sm"
                                                                            style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}
                                                                        >
                                                                            {char.character}
                                                                        </p>
                                                                    </div>
                                                                )
                                                        }
                                                    </div>
                                                </div>
                                            ))
                                        })()
                                    )}
                                </div>
                            </>
                        )}

                        {person?.known_for_department === "Directing" && ( 
                            <>
                                <h1 className="uppercase text-md font-semibold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>Known for directing</h1>
                                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-scroll no-scrollbar p-2 rounded-2xl border-2 border-cyan-500/30">                                
                                    {crew && crew.length > 0 && (
                                        crew.filter(c => c.job === "Director").map((c, i) => (
                                            <div key={i} className="flex gap-2 w-full items-center mb-2 cursor-pointer hover:scale-105 transition-all" onClick={() => onClick && onClick(c, "movie")}>
                                                <div className="flex rounded-lg shrink-0 overflow-hidden w-[70px]">
                                                    <img src={`https://image.tmdb.org/t/p/original/${c?.poster_path}`} className="w-full h-full object-cover" alt={c?.title || c?.name} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <p className="text-sm font-semibold" style={{ color: `rgba(${settings.primaryColor}, 1)` }}>{c?.title || c?.name}</p>
                                                    <p className="text-sm" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>{c?.job}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="h-10">

                </div>


            </div>


        </>
    )

})
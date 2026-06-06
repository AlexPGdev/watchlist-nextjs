
import { memo, useEffect, useRef, useState } from "react";
import settings from "../../../constants/settings.json";
import { RippleExplosion } from "../../RippleExplosion";
import { BiCheck, BiPlus, BiX } from "react-icons/bi";
import { Content } from "../../../types/content";
import { useSearchParams, useRouter } from "next/navigation";
import { useContent } from "@/app/hooks/useContent";

interface ContentViewProps {
    info: { id: string, type: string };
    onClose?: () => void;
    onClick?: (content: any, type: string) => void;
}

const MAX_LOGO_HEIGHT = 100;

export const ContentView = memo(function ContentView({ info, onClose, onClick }: ContentViewProps) {

    const { addContent, content } = useContent();

    const [selectedContent, setSelectedContent] = useState<any>(null);

    const [images, setImages] = useState < { backdrops: any[], posters: any[] } > ({ backdrops: [], posters: [] });
    const [streamingServices, setStreamingServices] = useState < any > (null);
    const [allServices, setAllServices] = useState < any > (null);
    const [showMore, setShowMore] = useState(false);
    const [cast, setCast] = useState < any > (null);
    const [crew, setCrew] = useState < any > (null);
    const [creators, setCreators] = useState < any[] > ([]);
    const [productionCompanies, setProductionCompanies] = useState < any > (null);
    const [alsoWatch, setAlsoWatch] = useState < any > (null);
    const [showRipple, setShowRipple] = useState(false);
    const [rippleKey, setRippleKey] = useState(0);
    const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
    const buttonRef = useRef < HTMLButtonElement | null > (null);
    const modalRef = useRef < HTMLDivElement | null > (null);

    const router = useRouter();

    useEffect(() => {
        if (!info.id || !info.type) return;

        fetch(`https://api.spectaer.com/watchlist/api/content/extended-details?id=${info.id}&type=${info.type}`, {
            "method": "GET"
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {

                const certification = data.release_dates?.results
                    ?.find((result: { iso_3166_1: string }) => result.iso_3166_1 === "US")
                    ?.release_dates
                    ?.find((rd: { certification: string }) => rd.certification?.trim())
                    ?.certification ||
                    data.content_ratings?.results?.find((result: { iso_3166_1: string }) => result.iso_3166_1 === "US")?.rating

                setSelectedContent({
                    id: data.id,
                    posterPath: data.images.posters[0]?.file_path,
                    logoPath: data.images.logos[0]?.file_path,
                    logoAspectRatio: data.images.logos[0]?.aspect_ratio,
                    description: data.overview,
                    releaseDate: data.release_date,
                    firstAirDate: data.first_air_date,
                    lastAirDate: data.last_air_date,
                    totalSeasons: data.seasons?.length,
                    trailerPath: data.videos?.results[0]?.key,
                    certification: certification,
                    runtime: data.runtime,
                    genres: data.genres?.map((g: { name: string }) => g.name) || [],
                })

                setImages(data.images)
                loadStreamingAvailability(data)
                setCast(data.credits.cast)
                setCrew(data.credits.crew)
                setCreators(data.created_by)
                setProductionCompanies(data.production_companies)
                setAlsoWatch(data.recommendations.results)
            })
    }, [info.id, info.type])

    const handleOnClose = () => {
        setSelectedContent(null)
        setStreamingServices(null)
        setAllServices(null)
        setImages({ backdrops: [], posters: [] })
        setCast(null)
        setCrew(null)
        setCreators([])
        setProductionCompanies(null)
        setAlsoWatch(null)
        setShowMore(false)
        onClose && onClose()
    }

    const logoSize = (aspect_ratio: number) => {
        let imageWidth = window.innerWidth > 500 ? 300 : window.innerWidth * 0.6;
        let imageHeight = imageWidth / (aspect_ratio || 1);

        if (imageHeight > MAX_LOGO_HEIGHT) {
            const scale = MAX_LOGO_HEIGHT / imageHeight;
            imageWidth = imageWidth * scale;
            imageHeight = imageHeight * scale;
        }

        return { width: imageWidth, height: imageHeight };
    }

    const normalizeName = (name: string) =>
        name
            .toLowerCase()
            .replace("with ads", "")
            .replace(/\s+/g, " ")
            .trim();

    async function loadStreamingAvailability(newContent: any) {
        try {
            const response1 = await fetch(
                `https://api.spectaer.com/watchlist/api/content/streaming-availability?id=${newContent?.id
                }&type=${`${(info.type)}`.toLowerCase()}`
            );

            const jwData = await response1.json();

            let allServices: any[] = [];

            if (jwData.DE?.flatrate) {
                jwData.DE.flatrate.sort(
                    (a: any, b: any) => a.display_priority - b.display_priority
                );
                allServices.push(...jwData.DE.flatrate);
            }

            if (jwData.DE?.buy) {
                jwData.DE.buy.sort(
                    (a: any, b: any) => a.display_priority - b.display_priority
                );
                allServices.push(...jwData.DE.buy);
            }

            if (jwData.DE?.rent) {
                jwData.DE.rent.sort(
                    (a: any, b: any) => a.display_priority - b.display_priority
                );
                allServices.push(...jwData.DE.rent);
            }

            const seen = new Set < number > ();
            allServices = allServices.filter(service => {
                if (seen.has(service.provider_id)) return false;
                seen.add(service.provider_id);
                return true;
            });

            const response2 = await fetch(
                `https://imdb.iamidiotareyoutoo.com/justwatch?q=${newContent?.title}&L=DE_de`
            );

            const imdbData = await response2.json();

            const offers =
                imdbData.description
                    .find((i: any) => i.imdbId === newContent.imdb_id)
                    ?.offers || [];

            const urlMap = new Map < string, string> ();

            offers.forEach((offer: any) => {
                const key = normalizeName(offer.name);

                if (!urlMap.has(key)) {
                    urlMap.set(key, offer.url);
                }
            });

            const mergedServices = allServices.map(service => {
                const normalizedProvider = normalizeName(service.provider_name);

                return {
                    ...service,
                    url: urlMap.get(normalizedProvider) || null
                };
            });

            setStreamingServices(jwData);
            setAllServices(mergedServices);

        } catch (err) {
            console.error("Streaming availability error:", err);
        }
    }

    const handleAddWatchlist = () => {
        if (!selectedContent) return;

        addContent(selectedContent?.id, info.type, false)

        const buttonRect = buttonRef.current?.getBoundingClientRect();
        const modalRect = modalRef.current?.getBoundingClientRect();

        if (buttonRect && modalRect) {
            setButtonPosition({
                x: buttonRect.left - modalRect.left + buttonRect.width / 2,
                y: buttonRect.top - modalRect.top + buttonRect.height / 2,
            });
        }

        setShowRipple(false);
        setRippleKey((prev) => prev + 1);

        window.setTimeout(() => {
            setShowRipple(true);
        }, 0);
    }

    return (
        <>
            <RippleExplosion
                key={rippleKey}
                isActive={showRipple}
                originX={buttonPosition.x}
                originY={buttonPosition.y}
                containerWidth={modalRef.current?.offsetWidth}
                containerHeight={modalRef.current?.offsetHeight}
                color="rgba(0, 255, 0, 0.4)"
                duration={1500}
                onComplete={() => setShowRipple(false)}
            />

            <div className="absolute inset-0 rounded-2xl overflow-hidden -z-10">
                {selectedContent?.posterPath && (
                    <img src={`https://image.tmdb.org/t/p/w500/${selectedContent?.posterPath}`} className="w-full h-full object-cover" style={{ opacity: 0.5, filter: "blur(30px)" }} />
                )}
            </div>

            <div ref={modalRef} className="flex flex-col overflow-y-scroll p-5 px-5 no-scrollbar gap-2">
                <img
                    src={`https://image.tmdb.org/t/p/w500//${selectedContent?.logoPath}`}
                    style={{ justifyContent: 'center', marginLeft: 'auto', marginRight: 'auto', width: logoSize(selectedContent?.logoAspectRatio).width, height: logoSize(selectedContent?.logoAspectRatio).height, marginBottom: 5 }}
                    alt={selectedContent?.title}
                />

                <button className="absolute z-10 top-3 right-3 cursor-pointer hover:scale-105 active:scale-95 transition-all bg-fuchsia-500/20 rounded-full backdrop-blur-sm" onClick={handleOnClose}>
                    <BiX size={35} color={`rgba(${settings.secondaryColor}, 1)`} />
                </button>

                <div className="flex justify-center gap-2">
                    {/* <p className="text-sm font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }} title={selectedContent?.releaseDate}>{selectedContent?.releaseDate?.substring(0, 4)}</p> */}
                    {selectedContent?.firstAirDate ? (
                        <div className="flex gap-0.5">
                            <p className="text-sm font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }} title={selectedContent.firstAirDate}>
                                {selectedContent?.firstAirDate?.substring(0, 4)}
                            </p>
                            {selectedContent?.lastAirDate && (
                                <>
                                    <p className="text-sm font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>-</p>
                                    <p className="text-sm font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }} title={selectedContent.lastAirDate}>
                                        {selectedContent?.lastAirDate?.substring(0, 4)}
                                    </p>
                                </>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }} title={selectedContent?.releaseDate}>{selectedContent?.releaseDate?.substring(0, 4)}</p>
                    )}

                    {selectedContent?.certification && (
                        <>
                            <p className="text-sm font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>•</p>
                            <p className="text-sm font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>{selectedContent?.certification}</p>
                        </>
                    )}
                    {selectedContent?.runtime && selectedContent?.runtime !== null ? (
                        <>
                            <p className="text-sm font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>•</p>
                            <p className="text-sm font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>{selectedContent?.runtime > 60 ? `${Math.floor(selectedContent?.runtime / 60)}h ${selectedContent?.runtime % 60}m` : `${selectedContent?.runtime} mins`}</p>
                        </>
                    ) : (
                        selectedContent?.totalSeasons && (
                            <>
                                <p className="text-sm font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>•</p>
                                <p className="text-sm font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>{selectedContent?.totalSeasons} seasons</p>
                            </>
                        )
                    )}
                </div>

                <div className="flex justify-center ml-auto mr-auto gap-2 max-w-1/2 flex-wrap">
                    {selectedContent?.genres?.map((genre: string, index: number) => (
                        <p className="text-xs p-1 px-2 bg-cyan-800/30 rounded-full border-1 border-cyan-500/80" key={genre+index} style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>
                            {genre}
                        </p>
                    ))}
                </div>

                {window.innerWidth > 650 ? (
                    <div className="flex justify-center gap-2">
                        <div className="flex w-[20%]">
                            <img src={`https://image.tmdb.org/t/p/w500/${selectedContent?.posterPath}`} className="w-full h-full object-cover rounded-xl" alt={selectedContent?.title} />
                        </div>

                        <div className="flex gap-2 rounded-2xl overflow-hidden w-[60%]">
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${selectedContent?.trailerPath}?autoplay=1&mute=1`}
                                style={{ aspectRatio: '16/9' }}
                            />
                        </div>

                        <div className="flex w-[20%] ">
                            <div className="z-2 w-full " style={{ boxShadow: '6px 2px 15px rgba(0, 0, 0, 0.8)' }}>
                                {(images && images.posters && images.posters[1]) && (
                                    <img src={`https://image.tmdb.org/t/p/w500/${images.posters[1].file_path}`} className="w-full h-full object-cover rounded-xl" alt={selectedContent?.title} />
                                )}
                            </div>
                            <div className=" z-1  w-[80%] -ml-[70px] scale-98" style={{ boxShadow: '6px 2px 15px rgba(0, 0, 0, 0.8)' }}>
                                {(images && images.posters && images.posters[2]) && (
                                    <img src={`https://image.tmdb.org/t/p/w500/${images.posters[2].file_path}`} className="w-full h-full object-cover rounded-xl" alt={selectedContent?.title} />
                                )}
                            </div>

                            <div className=" z-0  w-[80%] -ml-[70px] scale-96" style={{ boxShadow: '6px 2px 15px rgba(0, 0, 0, 0.8)' }}>
                                {(images && images.posters && images.posters[3]) && (
                                    <img src={`https://image.tmdb.org/t/p/w500/${images.posters[3].file_path}`} className="w-full h-full object-cover rounded-xl" alt={selectedContent?.title} />
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2 rounded-2xl overflow-hidden w-full">
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${selectedContent?.trailerPath}?autoplay=1&mute=1`}
                                style={{ aspectRatio: '16/9' }}
                            />
                        </div>

                        <div className="flex w-full justify-between">
                            <div className="flex w-[35%]">
                                <img src={`https://image.tmdb.org/t/p/w500/${selectedContent?.posterPath}`} className="w-full h-full object-cover rounded-xl" alt={selectedContent?.title} />
                            </div>

                            <div className="flex w-[55%] ">
                                <div className="z-2 w-[60%] " style={{ boxShadow: '6px 2px 15px rgba(0, 0, 0, 0.8)' }}>
                                    {(images && images.posters && images.posters[1]) && (
                                        <img src={`https://image.tmdb.org/t/p/w500/${images.posters[1].file_path}`} className="w-full h-full object-cover rounded-xl" alt={selectedContent?.title} />
                                    )}
                                </div>
                                <div className=" z-1  w-[60%] -ml-[70px] scale-98" style={{ boxShadow: '6px 2px 15px rgba(0, 0, 0, 0.8)' }}>
                                    {(images && images.posters && images.posters[2]) && (
                                        <img src={`https://image.tmdb.org/t/p/w500/${images.posters[2].file_path}`} className="w-full h-full object-cover rounded-xl" alt={selectedContent?.title} />
                                    )}
                                </div>

                                <div className=" z-0  w-[60%] -ml-[70px] scale-96" style={{ boxShadow: '6px 2px 15px rgba(0, 0, 0, 0.8)' }}>
                                    {(images && images.posters && images.posters[3]) && (
                                        <img src={`https://image.tmdb.org/t/p/w500/${images.posters[3].file_path}`} className="w-full h-full object-cover rounded-xl" alt={selectedContent?.title} />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}



                <div className="flex justify-between flex-col lg:flex-row">
                    <div className="flex flex-col gap-4 w-[full] lg:w-[70%]">
                        <div className="flex flex-col text-zinc-200 text-md text-justify gap-1" style={{ textShadow: `2px 2px 2px rgba(0, 0, 0, 0.5)` }}>
                            <h1 className="text-xl font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>Overview</h1>
                            <p className="p-1 text-sm md:text-lg">{selectedContent?.description}</p>
                        </div>

                        <div className="flex flex-col text-zinc-200 text-md gap-2" style={{ textShadow: `2px 2px 2px rgba(0, 0, 0, 0.5)` }}>
                            <h1 className="text-xl font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>Available on</h1>
                            {streamingServices && allServices?.length > 0 ? (
                                <div className="flex p-1 gap-4 flex-wrap select-none">
                                    {allServices?.slice(0, showMore ? allServices?.length : 3).map((service: any) => (
                                        <a href={service.url} key={service.provider_id} target="_blank" rel="noopener noreferrer" className="flex flex-col gap-1 w-16 h-16 rounded-lg cursor-pointer hover:scale-105 transition-all" style={{ color: `rgba(${settings.secondaryColor}, 1)`, boxShadow: '2px 2px 2px rgba(0, 0, 0, 0.5)', }}>
                                            <img src={`https://image.tmdb.org/t/p/original${service.logo_path}`} className="w-full h-full object-cover rounded-lg" alt={service.provider_name} />
                                        </a>
                                    ))}
                                    {(allServices?.length > 3 && !showMore) && (
                                        <button className="w-16 h-16 rounded-lg justify-center items-center flex gap-1 bg-fuchsia-800/30 text-md font-bold border-1 border-fuchsia-500/80 cursor-pointer hover:scale-105 transition-all" style={{ color: `rgba(${settings.secondaryColor}, 1)`, boxShadow: '2px 2px 2px rgba(0, 0, 0, 0.5)', textShadow: `2px 2px 2px rgba(0, 0, 0, 0.5)` }} onClick={() => setShowMore(true)}>
                                            <span> + {allServices?.length - 3} </span>
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <p>No streaming services available</p>
                            )}
                        </div>



                        <div className="relative flex flex-col text-md gap-1" style={{ textShadow: `2px 2px 2px rgba(0, 0, 0, 0.5)` }}>
                            <h1 className="text-xl font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>Cast</h1>

                            <div className="relative flex flex-col text-zinc-200 text-md gap-1 rounded-2xl" style={{ textShadow: `2px 2px 2px rgba(0, 0, 0, 0.5)` }}>
                                <div className="rounded-2xl overflow-hidden">
                                    <div className="relative p-1 flex gap-2 overflow-x-scroll no-scrollbar">
                                        {(() => {
                                            const seen = new Map<number, {
                                                member: any; characters: string[]
                                            }>();
                                            const result: any[] = [];

                                            cast?.forEach((c: any) => {
                                                if (!seen.has(c.id)) {
                                                    seen.set(c.id, { member: c, characters: [c.character] });
                                                    result.push(seen.get(c.id));
                                                } else {
                                                    seen.get(c.id)?.characters.push(c.character);
                                                }
                                            });
                                            return result.map((c) => (
                                                <div key={c.member.id ?? c.member.name} className="flex flex-col w-[100px] shrink-0 cursor-pointer hover:scale-105 transition-all" onClick={() => onClick && onClick(c.member, "person")}>
                                                    <img src={`https://image.tmdb.org/t/p/w500/${c.member.profile_path}`} className="w-[100px] h-[150px] rounded-lg mb-1" alt={c.member.name} />
                                                    <p className="text-sm font-bold line-clamp-2 text-zinc-200 ">{c.member.name}</p>
                                                    <p className="text-xs line-clamp-2 leading-none font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>{c.characters.join(", ")}</p>
                                                </div>
                                            ));
                                        })()}
                                    </div>

                                    <div className="absolute top-0 right-0 bottom-0 w-[60px] rounded-r-2xl" style={{ background: `linear-gradient(to left, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0))`, zIndex: 1 }} />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col text-zinc-200 text-md gap-1" style={{ textShadow: `2px 2px 2px rgba(0, 0, 0, 0.5)` }}>
                            <h1 className="text-xl font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>Crew</h1>
                            <div className="flex flex-wrap p-1 justify-between w-1/2 gap-2">
                                {(() => {
                                    return (
                                        (creators && creators.length > 0) && (
                                            <div>
                                                <p className="font-bold text-lg" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>Created By</p>
                                                <p className="text-md">{creators.map((c: { name: string; }) => c.name).join(', ')}</p>
                                            </div>
                                        )
                                    )
                                })()}
                                {(() => {
                                    const directors = crew?.filter((c: { job: string; name: string }) => c.job === 'Director') || [];
                                    return (
                                        directors.length > 0 && (
                                            <div>
                                                {directors.length > 0 && (
                                                    <div>
                                                        <p className="font-bold text-lg" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>{directors.length > 1 ? 'Directors' : 'Director'}</p>
                                                        {directors.map((c: { name: string; }) => <p className="text-md cursor-pointer" key={c.name} onClick={() => onClick && onClick(c, "person")}>{c.name}</p>)}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    )
                                })()}

                                {(() => {
                                    const novel = crew?.filter((c: { name: string; job: string }) => c.job === "Novel") || [];
                                    const uniqueNovelNames = Array.from(new Set(novel.map((c: any) => c.name)));
                                    return (
                                        <>
                                            {uniqueNovelNames.length > 0 && (
                                                <div>
                                                    <p className="font-bold text-lg" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>Novel</p>
                                                    <p className="text-md">{uniqueNovelNames.join(', ')}</p>
                                                </div>
                                            )}
                                        </>
                                    )
                                })()}

                                {(() => {
                                    const writing = crew?.filter((c: { department: string; name: string; job: string }) => c.department === 'Writing' && c.job !== "Novel") || [];
                                    const writers = writing?.filter((c: { job: string; name: string }) => c.job === 'Writer' || c.job === "Story") || [];
                                    const uniqueWritingNames = Array.from(new Set(writing.map((c: any) => c.name)));
                                    const uniqueWriterNames = Array.from(new Set(writers.map((c: any) => c.name)));

                                    return (
                                        <>
                                            {uniqueWriterNames.length > 0 ? (
                                                <div>
                                                    <p className="font-bold text-lg" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>{uniqueWriterNames.length > 1 ? "Writers" : "Writer"}</p>
                                                    <p className="text-md">{uniqueWriterNames.join(', ')}</p>
                                                </div>
                                            ) : (
                                                <>
                                                    {uniqueWritingNames.length > 0 && (
                                                        <div>
                                                            <p className="font-bold text-lg" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>{uniqueWritingNames.length > 1 ? "Writers" : "Writer"}</p>
                                                            <p className="text-md">{uniqueWritingNames.join(', ')}</p>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </>
                                    )
                                })()}
                                {(() => {
                                    const production = productionCompanies?.map((c: any) => c.name) || [];

                                    return (
                                        <>
                                            {production.length > 0 && (
                                                <div>
                                                    <p className="font-bold text-lg" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>{production.length > 1 ? "Production Companies" : "Production Company"}</p>
                                                    <p className="text-md">{production.join(', ')}</p>
                                                </div>
                                            )}
                                        </>
                                    )
                                })()}
                            </div>
                        </div>
                    </div>

                    {(alsoWatch && alsoWatch.length > 0) && (
                        <div className="flex flex-col text-zinc-200 text-md gap-1 w-full lg:w-[20%]" style={{ textShadow: `2px 2px 2px rgba(0, 0, 0, 0.5)` }}>
                            <h1 className="text-xl font-bold text-center" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>Also Watch</h1>

                            <div className="flex flex-row lg:flex-col gap-4 w-full ml-auto mr-auto">
                                {alsoWatch.slice(0, 3).map((c: any) => (
                                    <button
                                        key={c.id ?? c.tmdbId ?? c.title}
                                        className="flex flex-col gap-1 rounded-lg cursor-pointer hover:scale-105 transition-all p-2"
                                        style={{ color: `rgba(${settings.secondaryColor}, 1)`, }}
                                        onClick={() => router.push(`?${info.type}=${c.id}`)}
                                        // onClick={() => onClick && onClick(c, "movie")}
                                    >
                                        <img src={`https://image.tmdb.org/t/p/original${c.poster_path}`} className="w-full h-full object-cover rounded-lg" alt={c.title} />

                                        <p className="text-sm font-bold line-clamp-2 text-center" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>{c.title}</p>
                                        <p className="text-sm font-bold line-clamp-2 text-center" style={{ color: `rgba(${settings.secondaryColor}, 1)` }}>{c.release_date?.substring(0, 4)}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            </div>

            <div className="absolute bottom-10 w-full flex gap-2 justify-center z-10">
                <button
                    id="add-to-watchlist"
                    ref={buttonRef}
                    className="flex group relative overflow-hidden rounded-2xl bg-cyan-800/80 px-3 py-1.5 text-lg shadow-inner shadow-cyan-200/30 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:px-4 active:scale-95 disabled:opacity-60 disabled:cursor-default"
                    style={{ color: `rgba(${settings.primaryColor}, 1)` }}
                    onClick={() => handleAddWatchlist()}
                    disabled={content.find(c => c.tmdbId === selectedContent?.id) ? true : false}
                >
                    <span className="inline-block content-center text-center transition-transform duration-300 ">
                        {content.find(c => c.tmdbId === selectedContent?.id) ? <BiCheck size={20} /> : <BiPlus size={20} />}
                    </span>
                    <span className="ml-0 inline-block max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 group-hover:ml-2 group-hover:max-w-xs group-hover:opacity-100 opacity-0">
                        {content.find(c => c.tmdbId === selectedContent?.id) ? "In your watchlist" : "Add to watchlist"}
                    </span>
                </button>
            </div>
        </>
    )

})
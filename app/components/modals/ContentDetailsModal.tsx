
import { memo, useEffect, useRef, useState } from "react";
import settings from "../../constants/settings.json";
import { motion, AnimatePresence } from "framer-motion";
import { RippleExplosion } from "../RippleExplosion";
import { BiCheck, BiPlus } from "react-icons/bi";
import { Content } from "../../types/content";
import { useSearchParams, useRouter } from "next/navigation";
import { useContent } from "@/app/hooks/useContent";

interface ContentDetailsModalProps {
    selectedContent: Content;
    onClose: () => void;
    open: boolean;
}

const MAX_LOGO_HEIGHT = 100;

export const ContentDetailsModal = memo(function ContentDetailsModal({ selectedContent, onClose, open }: ContentDetailsModalProps) {

    const { addContent, content } = useContent();

    const [images, setImages] = useState<{ backdrops: any[], posters: any[] }>({ backdrops: [], posters: [] });
    const [streamingServices, setStreamingServices] = useState<any>(null);
    const [allServices, setAllServices] = useState<any>(null);
    const [showMore, setShowMore] = useState(false);
    const [cast, setCast] = useState<any>(null);
    const [crew, setCrew] = useState<any>(null);
    const [creators, setCreators] = useState<any[]>([]);
    const [productionCompanies, setProductionCompanies] = useState<any>(null);
    const [alsoWatch, setAlsoWatch] = useState<any>(null);
    const [showRipple, setShowRipple] = useState(false);
    const [rippleKey, setRippleKey] = useState(0);
    const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const modalRef = useRef<HTMLDivElement | null>(null);

    const router = useRouter();
    const searchParams = useSearchParams();
    const [type, id] = [...searchParams.entries()][0] || [];

    const [contentToShow, setContentToShow] = useState<Content | null>(null);
    const [detailedContent, setDetailedContent] = useState<any>(null);

    useEffect(() => {
        if(!open || !selectedContent) return

        setContentToShow(selectedContent)

        fetch(`https://api.spectaer.com/watchlist/api/content/extended-details?id=${selectedContent?.tmdbId ? selectedContent?.tmdbId : selectedContent?.id}&type=${selectedContent?.contentType ? selectedContent?.contentType : `${selectedContent?.mediaType}`.toLowerCase()}`, {
            "method": "GET"
        })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            setImages(data.images)
            loadStreamingAvailability(selectedContent, data)
            setCast(data.credits.cast)
            setCrew(data.credits.crew)
            setCreators(data.created_by)
            setProductionCompanies(data.production_companies)
            setAlsoWatch(data.recommendations.results)
        })
    }, [selectedContent, open])

    useEffect(() => {
        if(!id || !type || !open) return

        // if(selectedContent.id === parseInt(id)) return;

        console.log('test')

        // fetch(`https://api.spectaer.com/watchlist/api/content/tmdb/${id}`, {
        //     "method": "GET"
        // })
        // .then(function (response) {
        //     return response.json();
        // })
        // .then(function (data) {
        //     console.log(type, id)

        //     setContentToShow(data)

            fetch(`https://api.spectaer.com/watchlist/api/content/extended-details?id=${id}&type=${type}`, {
                "method": "GET"
            })
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                setDetailedContent(data)
                console.log({data})

                setContentToShow(prev => prev ? { 
                    ...prev, 
                    posterPath: data.images.posters[0]?.file_path, 
                    logoPath: data.images.logos[0]?.file_path,
                    logoAspectRatio: data.images.logos[0]?.aspect_ratio,
                    description: data.overview,
                    releaseDate: data.release_date,
                    totalSeasons: data.seasons?.length,
                    trailerPath: data.videos?.results[0]?.key,
                } : null)
                setImages(data.images)
                loadStreamingAvailability(contentToShow, data)
                setCast(data.credits.cast)
                setCrew(data.credits.crew)
                setCreators(data.created_by)
                setProductionCompanies(data.production_companies)
                setAlsoWatch(data.recommendations.results)
            })
        // })

    }, [type, id, selectedContent, open])

    const handleOnClose = () => {
        setStreamingServices(null)
        setAllServices(null)
        setImages({ backdrops: [], posters: [] })
        setCast(null)
        setCrew(null)
        setCreators([])
        setProductionCompanies(null)
        setAlsoWatch(null)
        setShowMore(false)
        onClose()
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

    async function loadStreamingAvailability(content: any, newContent: any) {
        try {
            const response1 = await fetch(
                `https://api.spectaer.com/watchlist/api/content/streaming-availability?id=${content?.tmdbId ?? content?.id
                }&type=${`${(content?.contentType ?? content?.mediaType)}`.toLowerCase()}`
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

            const seen = new Set<number>();
            allServices = allServices.filter(service => {
                if (seen.has(service.provider_id)) return false;
                seen.add(service.provider_id);
                return true;
            });

            const response2 = await fetch(
                `https://imdb.iamidiotareyoutoo.com/justwatch?q=${content?.title}&L=DE_de`
            );

            const imdbData = await response2.json();

            console.log({tASt: newContent})

            const offers =
                imdbData.description
                    .find((i: any) => i.imdbId === newContent.imdb_id)
                    ?.offers || [];

            const urlMap = new Map<string, string>();

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
        if(!contentToShow) return

        addContent(contentToShow.tmdbId ? contentToShow.tmdbId : contentToShow.id, type, false)

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

        // Use a tiny delay so React can commit the false state before restarting.
        window.setTimeout(() => {
            setShowRipple(true);
        }, 0);
    }

    return (
        <AnimatePresence>
            {(open && contentToShow !== null) && (
                <>
                    <motion.div
                        key="backdrop"
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    />

                    <motion.div
                        key="modal"
                        className="fixed top-0 left-0 w-full h-full bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleOnClose}
                    >
                        <motion.div
                            ref={modalRef}
                            className="relative flex flex-col gap-2 rounded-2xl shadow-inner shadow-zinc-200/30 w-3/5 max-h-[80%] z-10 bg-black/60 overflow-hidden"
                            initial={{ opacity: 0, y: 20, scale: 0.5 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.5 }}
                            transition={{ duration: 0.25 }}
                            onClick={(e) => e.stopPropagation()}
                        >

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
                                {contentToShow.posterPath && (
                                    <img src={`https://image.tmdb.org/t/p/w500/${contentToShow.posterPath}`} className="w-full h-full object-cover" style={{ opacity: 0.5, filter: "blur(30px)" }} />
                                )}

                                {/* {(!contentToShow.posterPath && images.posters && images.posters[0]) && (
                                    <img src={`https://image.tmdb.org/t/p/w500/${images.posters[0].file_path}`} className="w-full h-full object-cover" style={{ opacity: 0.5, filter: "blur(30px)" }} />
                                )} */}
                            </div>

                            <div className="flex flex-col overflow-y-scroll p-5 px-5 no-scrollbar gap-2">
                                <img 
                                    src={`https://image.tmdb.org/t/p/w500//${contentToShow.logoPath}`} 
                                    style={{justifyContent: 'center', marginLeft: 'auto', marginRight: 'auto', width: logoSize(contentToShow.logoAspectRatio).width, height: logoSize(contentToShow.logoAspectRatio).height, marginBottom: 5 }}
                                    alt={contentToShow.title}
                                />

                                <div className="flex justify-center gap-2">
                                    {/* <p className="text-sm font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }} title={contentToShow.releaseDate}>{contentToShow?.releaseDate?.substring(0, 4)}</p> */}
                                    {detailedContent?.first_air_date ? (
                                        <div className="flex gap-0.5">
                                            <p className="text-sm font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }} title={detailedContent.first_air_date}>{detailedContent?.first_air_date?.substring(0, 4)}</p>
                                            {detailedContent.last_air_date && (
                                                <>
                                                    <p className="text-sm font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>-</p>
                                                    <p className="text-sm font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }} title={detailedContent.last_air_date}>{detailedContent?.last_air_date?.substring(0, 4)}</p>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }} title={contentToShow.releaseDate}>{contentToShow?.releaseDate?.substring(0, 4)}</p>
                                    )}

                                    {contentToShow.certification && (
                                        <>                                        
                                            <p className="text-sm font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>•</p>
                                            <p className="text-sm font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>{contentToShow.certification}</p>
                                        </>
                                    )}
                                    {(contentToShow.contentType?.toLowerCase() === 'movie' || contentToShow.content_type?.toLowerCase() === 'movie') ? (
                                        <>
                                            <p className="text-sm font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>•</p>
                                            <p className="text-sm font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>{contentToShow.runtime > 60 ? `${Math.floor(contentToShow.runtime / 60)}h ${contentToShow.runtime % 60}m` : `${contentToShow.runtime} mins`}</p>
                                        </>
                                    ) : (
                                        contentToShow.totalSeasons && (
                                            <>
                                                <p className="text-sm font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>•</p>
                                                <p className="text-sm font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>{contentToShow.totalSeasons} seasons</p>
                                            </>
                                        )
                                    )}
                                </div>

                                <div className="flex justify-center ml-auto mr-auto gap-2 max-w-1/2 flex-wrap">
                                    {contentToShow?.genres?.map((genre: string) => (
                                        <p className="text-xs p-1 px-2 bg-cyan-800/30 rounded-full border-1 border-cyan-500/80" key={genre} style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>
                                            {genre}
                                        </p>
                                    ))}
                                </div>

                                <div className="flex justify-center gap-5">
                                    <div className="flex w-[20%]">
                                        <img src={`https://image.tmdb.org/t/p/w500/${contentToShow.posterPath}`} className="w-full h-full object-cover rounded-xl" alt={contentToShow.title} />
                                    </div>

                                    <div className="flex  gap-2 rounded-2xl overflow-hidden w-[60%]">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={`https://www.youtube.com/embed/${contentToShow.trailerPath}?autoplay=1&mute=1`}
                                            style={{ aspectRatio: '16/9' }}
                                        />
                                    </div>

                                    <div className="flex w-[20%] ">
                                        <div className="z-2 w-[80%] ">
                                            {(images && images.posters && images.posters[1]) && (
                                                <img src={`https://image.tmdb.org/t/p/w500/${images.posters[1].file_path}`} className="w-full h-full object-cover rounded-xl" alt={contentToShow.title} />
                                            )}
                                        </div>
                                        <div className=" z-1  w-[20%] -ml-5 scale-98">
                                            {(images && images.posters && images.posters[2]) && (
                                                <img src={`https://image.tmdb.org/t/p/w500/${images.posters[2].file_path}`} className="w-full h-full object-cover rounded-xl" alt={contentToShow.title} />
                                            )}
                                        </div>
                                        
                                        <div className=" z-0  w-[20%] -ml-5 scale-96">
                                            {(images && images.posters && images.posters[3]) && (
                                                <img src={`https://image.tmdb.org/t/p/w500/${images.posters[3].file_path}`} className="w-full h-full object-cover rounded-xl" alt={contentToShow.title} />
                                            )}
                                        </div>
                                    </div> 
                                </div>

                                <div className="flex justify-between flex-col lg:flex-row">
                                    <div className="flex flex-col gap-4 w-[full] lg:w-[70%]">
                                        <div className="flex flex-col text-zinc-200 text-md text-justify gap-1" style={{ textShadow: `2px 2px 2px rgba(0, 0, 0, 0.5)` }}>
                                            <h1 className="text-xl font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>Overview</h1>
                                            <p className="p-1 text-lg">{contentToShow.description}</p>
                                        </div>

                                        <div className="flex flex-col text-zinc-200 text-md gap-2" style={{ textShadow: `2px 2px 2px rgba(0, 0, 0, 0.5)` }}>
                                            <h1 className="text-xl font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>Available on</h1>
                                            {streamingServices ? (
                                                <div className="flex p-1 gap-4 flex-wrap select-none">
                                                    {allServices?.slice(0, showMore ? allServices?.length : 5).map((service: any) => (
                                                        <a href={service.url} key={service.provider_id} target="_blank" rel="noopener noreferrer" className="flex flex-col gap-1 w-16 h-16 rounded-lg cursor-pointer hover:scale-105 transition-all" style={{ color: `rgba(${settings.secondaryColor}, 1)`, boxShadow: '2px 2px 2px rgba(0, 0, 0, 0.5)', }}>
                                                            <img src={`https://image.tmdb.org/t/p/original${service.logo_path}`} className="w-full h-full object-cover rounded-lg" alt={service.provider_name} />
                                                        </a>
                                                    ))}
                                                    {(allServices?.length > 5 && !showMore) && (
                                                        <button className="w-16 h-16 rounded-lg justify-center items-center flex gap-1 bg-fuchsia-800/30 text-md font-bold border-1 border-fuchsia-500/80 cursor-pointer hover:scale-105 transition-all" style={{ color: `rgba(${settings.secondaryColor}, 1)`, boxShadow: '2px 2px 2px rgba(0, 0, 0, 0.5)', textShadow: `2px 2px 2px rgba(0, 0, 0, 0.5)` }} onClick={() => setShowMore(true)}>
                                                            <span> + {allServices?.length - 4} </span>
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <p>No streaming services available</p>
                                            )}
                                        </div>

                                        

                                        <div className="relative flex flex-col text-md gap-1" style={{ textShadow: `2px 2px 2px rgba(0, 0, 0, 0.5)` }}>
                                            <h1 className="text-xl font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)`}}>Cast</h1>
                                            
                                            <div className="relative flex flex-col text-zinc-200 text-md gap-1 rounded-2xl" style={{ textShadow: `2px 2px 2px rgba(0, 0, 0, 0.5)` }}>
                                                <div className="rounded-2xl overflow-hidden">
                                                    <div className="relative p-1 flex gap-2 overflow-x-scroll no-scrollbar">
                                                        {(() => {
                                                            const seen = new Map<number, { member: any; characters: string[] }>();
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
                                                                <div key={c.member.id ?? c.member.name} className="flex flex-col w-[100px] shrink-0">
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
                                                                <p className="text-md">{creators.map((c : { name: string; }) => c.name).join(', ')}</p>
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
                                                                        {directors.map((c : { name: string; }) => <p className="text-md" key={c.name} >{c.name}</p>)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    )
                                                })()}
                                                
                                                {(() => {
                                                    const novel = crew?.filter((c: { name: string; job: string }) => c.job === "Novel") || [];
                                                    const uniqueNovelNames = Array.from(new Set(novel.map((c : any) => c.name)));
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
                                                    const uniqueWritingNames = Array.from(new Set(writing.map((c : any) => c.name)));
                                                    const uniqueWriterNames = Array.from(new Set(writers.map((c : any) => c.name)));
                                                
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
                                                        onClick={() => router.push(`?${type}=${c.id}`)}
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

                            <div className="absolute bottom-10 w-full flex gap-2 justify-center">
                                <button
                                    id="add-to-watchlist"
                                    ref={buttonRef}
                                    className="flex group relative overflow-hidden rounded-2xl bg-cyan-800/80 px-3 py-1.5 text-lg shadow-inner shadow-cyan-200/30 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:px-4 active:scale-95 disabled:opacity-60 disabled:cursor-default"
                                    style={{ color: `rgba(${settings.primaryColor}, 1)` }}
                                    onClick={() => handleAddWatchlist() }
                                    disabled={content.find(c => c.tmdbId === contentToShow.tmdbId) ? true : false}
                                >
                                    <span className="inline-block content-center text-center transition-transform duration-300 ">
                                        {content.find(c => c.tmdbId === selectedContent.tmdbId) ? <BiCheck size={20} /> : <BiPlus size={20} />}
                                    </span>
                                    <span className="ml-0 inline-block max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 group-hover:ml-2 group-hover:max-w-xs group-hover:opacity-100 opacity-0">
                                        {content.find(c => c.tmdbId === selectedContent.tmdbId) ? "In your watchlist" : "Add to watchlist"}
                                    </span>
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
});
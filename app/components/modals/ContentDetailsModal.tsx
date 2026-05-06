import { memo, useEffect, useState } from "react";
import { BiTrash } from "react-icons/bi";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { HiOutlinePlayCircle } from "react-icons/hi2";
import settings from "../../constants/settings.json";
import { motion, AnimatePresence } from "framer-motion";

interface ContentDetailsModalProps {
    content: any;
    onClose: () => void;
    open: boolean;
}

const MAX_LOGO_HEIGHT = 100;

export const ContentDetailsModal = memo(function ContentDetailsModal({ content, onClose, open }: ContentDetailsModalProps) {
    const [images, setImages] = useState<{ backdrops: any[] }>({ backdrops: [] });
    const [streamingServices, setStreamingServices] = useState<any>(null);
    const [allServices, setAllServices] = useState<any>(null);
    const [showMore, setShowMore] = useState(false);
    const [cast, setCast] = useState<any>(null);
    const [crew, setCrew] = useState<any>(null);
    const [creators, setCreators] = useState<any[]>([]);
    const [productionCompanies, setProductionCompanies] = useState<any>(null);
    const [alsoWatch, setAlsoWatch] = useState<any>(null);


    useEffect(() => {
        if(!open || !content) return

        fetch(`https://api.spectaer.com/watchlist/api/content/extended-details?id=${content?.tmdbId ? content?.tmdbId : content?.id}&type=${content?.contentType ? content?.contentType : `${content?.mediaType}`.toLowerCase()}`, {
            "method": "GET"
        })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            setImages(data.images)
            loadStreamingAvailability(content, data)
            setCast(data.credits.cast)
            setCrew(data.credits.crew)
            setCreators(data.created_by)
            setProductionCompanies(data.production_companies)
            setAlsoWatch(data.recommendations.results)
        })
    }, [content, open])

    const handleOnClose = () => {
        setStreamingServices(null)
        setAllServices(null)
        setImages({ backdrops: [] })
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

    return (
        <AnimatePresence>
            {(open && content !== null) && (
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
                            className="relative flex flex-col gap-2 rounded-2xl shadow-inner shadow-zinc-200/30 w-1/2 max-h-[80%] z-10 bg-black/60"
                            initial={{ opacity: 0, y: 20, scale: 0.5 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.5 }}
                            transition={{ duration: 0.25 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute inset-0 rounded-2xl overflow-hidden -z-10">
                                <img src={`https://image.tmdb.org/t/p/w500/${content.posterPath}`} className="w-full h-full object-cover" style={{ opacity: 0.5, filter: "blur(30px)" }} />
                            </div>

                            <div className="flex flex-col overflow-y-scroll p-5 px-5 no-scrollbar gap-2">
                                <img 
                                    src={`https://image.tmdb.org/t/p/w500//${content.logoPath}`} 
                                    style={{justifyContent: 'center', marginLeft: 'auto', marginRight: 'auto', width: logoSize(content.logoAspectRatio).width, height: logoSize(content.logoAspectRatio).height, marginBottom: 5 }}
                                    alt={content.title} 
                                />

                                <div className="flex justify-center gap-2">
                                    <p className="text-sm font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>{content.releaseDate.substring(0, 4)}</p>
                                    <p className="text-sm font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>•</p>
                                    <p className="text-sm font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>{content.certification}</p>
                                    <p className="text-sm font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>•</p>
                                    {content.contentType === 'movie' ? (
                                        <p className="text-sm font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>{content.runtime > 60 ? `${Math.floor(content.runtime / 60)}h ${content.runtime % 60}m` : `${content.runtime} mins`}</p>
                                    ) : (
                                        <p className="text-sm font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>{content.totalSeasons} seasons</p>
                                    )}
                                </div>

                                <div className="flex justify-center ml-auto mr-auto gap-2 max-w-1/2 flex-wrap">
                                    {content.genres.map((genre: string) => (
                                        <p className="text-xs p-1 px-2 bg-cyan-800/30 rounded-full border-1 border-cyan-500/80" key={genre} style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>
                                            {genre}
                                        </p>
                                    ))}
                                </div>

                                <div className="flex justify-between">
                                    <div className="flex w-[180px] h-[270px]">
                                        <img src={`https://image.tmdb.org/t/p/w500/${content.posterPath}`} className="w-full h-full object-cover rounded-xl" alt={content.title} />
                                    </div>

                                    <div className="flex ml-auto mr-auto gap-2 rounded-2xl overflow-hidden h-[270px]">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={`https://www.youtube.com/embed/${content.trailerPath}?autoplay=1&mute=1`}
                                            style={{ aspectRatio: '16/9' }}
                                        />
                                    </div>

                                    <div className="flex ">
                                        <div className="z-2 w-[180px] h-[270px]">
                                            {(images && images.backdrops && images.backdrops[0]) && (
                                                <img src={`https://image.tmdb.org/t/p/w500/${images.backdrops[0].file_path}`} className="w-full h-full object-cover rounded-xl" alt={content.title} />
                                            )}
                                        </div>
                                        <div className=" z-1 w-[180px] h-[270px] -ml-40 scale-98">
                                            {(images && images.backdrops && images.backdrops[1]) && (
                                                <img src={`https://image.tmdb.org/t/p/w500/${images.backdrops[1].file_path}`} className="w-full h-full object-cover rounded-xl" alt={content.title} />
                                            )}
                                        </div>
                                        
                                        <div className=" z-0 w-[180px] h-[270px] -ml-40 scale-96">
                                            {(images && images.backdrops && images.backdrops[2]) && (
                                                <img src={`https://image.tmdb.org/t/p/w500/${images.backdrops[2].file_path}`} className="w-full h-full object-cover rounded-xl" alt={content.title} />
                                            )}
                                        </div>
                                    </div> 
                                </div>

                                <div className="flex justify-between gap-10">
                                    <div className="flex flex-col gap-4 w-[70%]">
                                        <div className="flex flex-col text-zinc-200 text-md text-justify gap-1" style={{ textShadow: `2px 2px 2px rgba(0, 0, 0, 0.5)` }}>
                                            <h1 className="text-xl font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>Overview</h1>
                                            <p>{content.description}</p>
                                        </div>

                                        <div className="flex flex-col text-zinc-200 text-md gap-2" style={{ textShadow: `2px 2px 2px rgba(0, 0, 0, 0.5)` }}>
                                            <h1 className="text-xl font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>Available on</h1>
                                            {streamingServices ? (
                                                <div className="flex gap-4 flex-wrap select-none">
                                                    {allServices?.slice(0, showMore ? allServices?.length : 5).map((service: any) => (
                                                        <a href={service.url} key={service.provider_id} target="_blank" rel="noopener noreferrer" className="flex flex-col gap-1 w-14 h-14 rounded-lg cursor-pointer hover:scale-105 transition-all" style={{ color: `rgba(${settings.secondaryColor}, 1)`, boxShadow: '2px 2px 2px rgba(0, 0, 0, 0.5)', }}>
                                                            <img src={`https://image.tmdb.org/t/p/original${service.logo_path}`} className="w-full h-full object-cover rounded-lg" alt={service.provider_name} />
                                                        </a>
                                                    ))}
                                                    {(allServices?.length > 5 && !showMore) && (
                                                        <button className="w-14 h-14 rounded-lg justify-center items-center flex gap-1 bg-fuchsia-800/30 text-md font-bold border-1 border-fuchsia-500/80 cursor-pointer hover:scale-105 transition-all" style={{ color: `rgba(${settings.secondaryColor}, 1)`, boxShadow: '2px 2px 2px rgba(0, 0, 0, 0.5)', textShadow: `2px 2px 2px rgba(0, 0, 0, 0.5)` }} onClick={() => setShowMore(true)}>
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
                                                    <div className="relative flex gap-2 overflow-x-scroll no-scrollbar">
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
                                            <div className="flex flex-wrap justify-between w-1/2 gap-2">
                                                {(() => {
                                                    return (
                                                        (creators && creators.length > 0) && (
                                                            <div>
                                                                <p className="font-bold text-sm" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>Created By</p>
                                                                <p className="text-sm">{creators.map((c : { name: string; }) => c.name).join(', ')}</p>
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
                                                                        <p className="font-bold text-sm" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>{directors.length > 1 ? 'Directors' : 'Director'}</p>
                                                                        {directors.map((c : { name: string; }) => <p className="text-sm" key={c.name} >{c.name}</p>)}
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
                                                                    <p className="font-bold text-sm" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>Novel</p>
                                                                    <p className="text-sm">{uniqueNovelNames.join(', ')}</p>
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
                                                                    <p className="font-bold text-sm" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>{uniqueWriterNames.length > 1 ? "Writers" : "Writer"}</p>
                                                                    <p className="text-sm">{uniqueWriterNames.join(', ')}</p>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    {uniqueWritingNames.length > 0 && (
                                                                        <div>
                                                                            <p className="font-bold text-sm" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>{uniqueWritingNames.length > 1 ? "Writers" : "Writer"}</p>
                                                                            <p className="text-sm">{uniqueWritingNames.join(', ')}</p>
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
                                                                    <p className="font-bold text-sm" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>{production.length > 1 ? "Production Companies" : "Production Company"}</p>
                                                                    <p className="text-sm">{production.join(', ')}</p>
                                                                </div>
                                                            )}
                                                        </>
                                                    )
                                                })()}
                                            </div>
                                        </div>
                                    </div>

                                    {(alsoWatch && alsoWatch.length > 0) && (
                                        <div className="flex flex-col text-zinc-200 text-md gap-1 w-[220px]" style={{ textShadow: `2px 2px 2px rgba(0, 0, 0, 0.5)` }}>
                                            <h1 className="text-xl font-bold text-center" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>Also Watch</h1>

                                            <div className="flex flex-col gap-4 w-4/6 ml-auto mr-auto">
                                                {alsoWatch.slice(0, 3).map((c: any) => (
                                                    <div key={c.id ?? c.tmdbId ?? c.title} className="flex flex-col gap-1 rounded-lg cursor-pointer hover:scale-105 transition-all p-2 bg-black/50" style={{ color: `rgba(${settings.secondaryColor}, 1)`, boxShadow: '2px 2px 2px rgba(0, 0, 0, 0.5)', }}>
                                                        <img src={`https://image.tmdb.org/t/p/original${c.poster_path}`} className="w-full h-full object-cover rounded-lg" alt={c.title} />

                                                        <p className="text-sm font-bold line-clamp-2 text-center" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>{c.title}</p>
                                                        <p className="text-sm font-bold line-clamp-2 text-center" style={{ color: `rgba(${settings.secondaryColor}, 1)` }}>{c.release_date.substring(0, 4)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
});
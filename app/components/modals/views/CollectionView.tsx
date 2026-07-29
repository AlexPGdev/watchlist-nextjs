
import { memo, useEffect, useRef, useState } from "react";
import settings from "../../../constants/settings.json";
import { BiArrowBack, BiX } from "react-icons/bi";
import { useSearchParams, useRouter } from "next/navigation";

interface CollectionViewProps {
    info: { id: string, type: string };
    onClick?: (content: any, type: string) => void;
    onClose?: () => void;
    onBack?: () => void;
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const CollectionView = memo(function CollectionView({ onClick, info, onClose, onBack }: CollectionViewProps) {

    const router = useRouter();

    const [ collection, setCollection ] = useState<any>(null);
    const [fullPoster, setFullPoster] = useState(false);

    useEffect(() => {
        if (!info.id || !info.type) return

        fetch(`https://api.spectaer.com/watchlist/api/collection/${info.id}`, {
            "method": "GET"
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                setCollection(data)
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


    return (
        <>
            <div className="absolute inset-0 rounded-2xl overflow-hidden -z-10">
                {collection?.backdropPath && (
                    <img src={`https://image.tmdb.org/t/p/w500/${collection?.backdropPath}`} className="w-full h-full object-cover" style={{ opacity: 0.5, filter: "blur(30px)" }} />
                )}
            </div>

            {fullPoster && collection?.posterPath && (
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
                            src={`https://image.tmdb.org/t/p/original/${collection?.posterPath}`}
                            alt={`${collection?.name} poster`}
                            className="max-h-[90vh] max-w-[95vw] rounded-2xl object-contain shadow-2xl"
                        />
                    </div>
                </div>
            )}

            <div className="flex flex-col overflow-y-scroll p-5 px-5 no-scrollbar gap-2">
                <button className="absolute z-10 top-3 left-3 cursor-pointer hover:scale-105 active:scale-95 transition-all text-zinc-200 bg-zinc-800/60 shadow-inner shadow-zinc-200/30 rounded-full backdrop-blur-sm" onClick={onBack}>
                    <BiArrowBack size={35} className="p-1" />
                </button>
                
                <button className="absolute z-10 top-3 right-3 cursor-pointer hover:scale-105 active:scale-95 transition-all bg-fuchsia-500/20 rounded-full backdrop-blur-sm" onClick={onClose}>
                    <BiX size={35} color={`rgba(${settings.secondaryColor}, 1)`} />
                </button>

                <div className="relative flex flex gap-1 w-full justify-center items-center ml-auto mr-auto">
                    <img src={`https://image.tmdb.org/t/p/original/${collection?.backdropPath}`} className="w-full object-cover rounded-2xl" alt={collection?.name} />
                    <div className="absolute flex rounded-2xl bottom-0 left-0 gap-3 bg-gradient-to-t from-black/80 to-transparent" style={{ height: '100%', width: '100%' }} draggable={false}>
                        <button className="flex h-[60%] mt-auto mb-4     cursor-pointer hover:scale-105 transition-all" onClick={() => setFullPoster(true)}>
                            <img
                                src={`https://image.tmdb.org/t/p/original/${collection?.posterPath}`}
                                className="object-cover rounded-2xl w-full h-full mt-auto group-hover:brightness-50 transition-all ml-4"
                                style={{ height: '100%', width: 'auto', objectFit: "cover", boxShadow: '2px 2px 10px rgb(0, 0, 0, 1)' }}
                                draggable={false}
                            />
                        </button>

                        <div className="flex flex-col self-end mb-6 gap-1 tracking-wider">
                            <h1
                                className="text-lg sm:text-xl md:text-2xl font-bold leading-[1.2]"
                                style={{ color: `rgba(${settings.primaryColor}, 1)` }}
                            >
                                {collection?.name}
                            </h1>
                            <div className="flex gap-2 text-sm sm:text-lg md:text-lg font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)`, textShadow: `2px 2px 2px rgba(0, 0, 0, 0.5)` }}>
                                {collection?.movies && (
                                    <>
                                        <p className="text-xs text-nowrap tracking-wider font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)`, textShadow: `2px 2px 4px rgba(0, 0, 0, 1)` }}>
                                            {(() => {
                                                const years = collection.movies.map((m: any) => parseInt(m.releaseDate?.substring(0, 4) || '0')).filter((y: number) => y > 0);
                                                const minYear = Math.min(...years);
                                                const maxYear = Math.max(...years);
                                                return minYear === maxYear ? minYear : `${minYear}-${maxYear}`;
                                            })()}
                                        </p>

                                        <p className="text-xs text-nowrap tracking-wider font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)`, textShadow: `2px 2px 4px rgba(0, 0, 0, 1)` }}>•</p>
                                        <p className="text-xs text-nowrap tracking-wider font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)`, textShadow: `2px 2px 4px rgba(0, 0, 0, 1)` }}>{collection.movies.length} movies</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full border-b-2 border-cyan-500/30 pb-2" />

                <div className="flex flex-col gap-4">                    
                    {collection?.movies?.length > 0 && (
                        <div className="flex flex-col gap-1">
                            <h1 className="uppercase text-md font-semibold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>Movies</h1>
                            
                            <div className="relative flex flex-col text-zinc-200 text-md gap-1 rounded-2xl" style={{ textShadow: `2px 2px 2px rgba(0, 0, 0, 0.5)` }}>
                                <div className="rounded-2xl overflow-visible">
                                    <div className="relative p-1 grid gap-y-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}>
                                        {collection?.movies?.map((c: any, i: number) => (
                                            <div key={c.id} className={`flex flex-col w-[100px] shrink-0 cursor-pointer hover:scale-105 transition-all`} onClick={() => onClick && onClick(c, "movie")}>
                                                <img src={`https://image.tmdb.org/t/p/w500/${c.posterPath}`} className="w-[100px] h-[150px] rounded-lg mb-1" alt={c.title} />
                                                <p className="text-sm font-bold line-clamp-2 text-zinc-200 ">{c.title}</p>
                                                <p className="text-xs line-clamp-2 leading-none font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>{c.releaseDate?.substring(0, 4)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-1">
                        <h1 className="uppercase text-md font-semibold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>About</h1>

                        <p className={`text-sm text-justify`}>
                            {collection?.description}
                        </p>
                    </div>

                </div>

                <div className="h-10">

                </div>


            </div>

        
        </>
    )

})
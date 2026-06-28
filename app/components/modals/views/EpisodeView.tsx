
import { memo, useEffect, useRef, useState } from "react";
import settings from "../../../constants/settings.json";
import { BiArrowBack, BiX } from "react-icons/bi";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

interface EpisodeViewProps {
    info: { id: string, type: string, content: any, episode: any };
    onClick?: (content: any, type: string) => void;
    onClose?: () => void;
    onBack?: () => void;
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const EpisodeView = memo(function EpisodeView({ onClick, info, onClose, onBack }: EpisodeViewProps) {

    const router = useRouter();

    const [ episode, setEpisode ] = useState<any>(null);
    const [cast, setCast] = useState<any>([]);

    useEffect(() => {
        console.log({info})
        if (!info.id || !info.type) return

        fetch(`http://192.168.178.132:8080/api/content/episode/${info.content.id}?season=${info.episode.seasonNumber}&episode=${info.episode.episodeNumber}`, {
            "method": "GET"
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                setEpisode(data)
                setCast([...data.credits.cast, ...data.guest_stars])
            })
    }, [info.id, info.type])

    return (
        <>
            <div className="absolute inset-0 rounded-2xl overflow-hidden -z-10">
                {/* {collection?.backdropPath && (
                    <img src={`https://image.tmdb.org/t/p/w500/${collection?.backdropPath}`} className="w-full h-full object-cover" style={{ opacity: 0.5, filter: "blur(30px)" }} />
                )} */}
            </div>

            <div className="flex flex-col overflow-y-scroll p-5 px-5 no-scrollbar gap-2">
                <button className="absolute z-10 top-3 left-3 cursor-pointer hover:scale-105 active:scale-95 transition-all text-zinc-200 bg-zinc-800/60 shadow-inner shadow-zinc-200/30 rounded-full backdrop-blur-sm" onClick={onBack}>
                    <BiArrowBack size={35} className="p-1" />
                </button>
                
                <button className="absolute z-10 top-3 right-3 cursor-pointer hover:scale-105 active:scale-95 transition-all bg-fuchsia-500/20 rounded-full backdrop-blur-sm" onClick={onClose}>
                    <BiX size={35} color={`rgba(${settings.secondaryColor}, 1)`} />
                </button>

                <div className="relative flex flex gap-1 w-full justify-center items-center ml-auto mr-auto">
                    <img src={`https://image.tmdb.org/t/p/original/${episode?.still_path}`} className="w-full object-cover rounded-2xl" alt={episode?.name} />
                </div>

                <div>                    
                    <p className="text-xl font-bold" style={{ color: `rgba(${settings.primaryColor}, 1)` }}>S{info.episode.seasonNumber}.E{info.episode.episodeNumber}: {episode?.name}</p>

                    <div className="flex gap-2 text-sm font-semibold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>
                        <p>{months[episode?.air_date.split('-')[1] - 1]} {episode?.air_date.split('-')[2]}, {episode?.air_date.split('-')[0]}</p>
                        {episode?.runtime > 0 && (
                            <>                            
                                <p >•</p>
                                <p>
                                    {episode?.runtime > 60 
                                        ? `${Math.floor(episode?.runtime / 60)}h ${episode?.runtime % 60}m` 
                                        : `${episode?.runtime}m`}
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {episode?.overview && (
                    <div className="flex flex-col text-zinc-200 text-md" style={{ textShadow: `2px 2px 2px rgba(0, 0, 0, 0.5)` }}>
                        <h1 className="text-xl font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>Overview</h1>
                        <p className="text-sm text-zinc-200 text-justify">{episode?.overview}</p>
                    </div>
                )}

                {(cast?.length > 0) && (
                    <div className="flex flex-col text-zinc-200 text-md" style={{ textShadow: `2px 2px 2px rgba(0, 0, 0, 0.5)` }}>
                        <h1 className="text-xl font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>Cast</h1>
                        <div className="grid gap-2 mt-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}>
                            {cast?.map((person: any, index: number) => (
                                <button key={index} className="flex flex-col text-left cursor-pointer hover:scale-105 transition-all" onClick={() => onClick && onClick(person, "person")}>
                                    <Image src={`https://image.tmdb.org/t/p/w500/${person?.profile_path}`} width={100} height={150} alt={person?.name} className="rounded-2xl" />
                                    <p className="text-sm font-bold line-clamp-2 text-zinc-200 mt-1">{person?.name}</p>
                                    <p className="text-xs line-clamp-2 leading-none font-semibold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>{person?.character}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}


                <div className="h-10">

                </div>


            </div>

        
        </>
    )

})
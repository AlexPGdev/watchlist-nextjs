import React from "react";
import settings from "../constants/settings.json";
import { ContentCard } from "./ContentCard";



export const ExploreRightSide = React.memo(function ExploreRightSide() {

    return (
        <div className="flex flex-col gap-4 max-w-1/5">
            <div className="flex flex-col gap-2">
                <h1 className="text-xl font-bold" style={{ color: `rgba(${settings.primaryColor}, 1)` }}>Newly Released</h1>

                <div className="border-1 border-cyan-800 rounded-2xl overflow-hidden p-4 bg-cyan-800/10">
                    {/* <div className="flex gap-2 border-b-1 border-cyan-800 pb-2">
                        <img src={`https://image.tmdb.org/t/p/original/${testContent[0].posterPath}`} className="w-1/3 h-1/3 rounded-2xl" style={{ objectFit: 'cover' }} />
                        <div className="flex flex-col mt-auto mb-auto">
                            <p className="text-lg font-bold" style={{ color: `rgba(${settings.primaryColor}, 1)` }}>{testContent[0].title}</p>
                            <p className="text-md font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>{testContent[0].releaseDate.substring(0, 4)}</p>
                        </div>
                    </div>
                    <div className="flex gap-2 border-b-1 border-cyan-800 pb-2 pt-2">
                        <img src={`https://image.tmdb.org/t/p/original/${testContent[0].posterPath}`} className="w-1/3 h-1/3 rounded-2xl" style={{ objectFit: 'cover' }} />
                        <div className="flex flex-col mt-auto mb-auto">
                            <p className="text-lg font-bold" style={{ color: `rgba(${settings.primaryColor}, 1)` }}>{testContent[0].title}</p>
                            <p className="text-md font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>{testContent[0].releaseDate.substring(0, 4)}</p>
                        </div>
                    </div>
                    <div className="flex gap-2 border-b-1 border-cyan-800 pb-2 pt-2">
                        <img src={`https://image.tmdb.org/t/p/original/${testContent[0].posterPath}`} className="w-1/3 h-1/3 rounded-2xl" style={{ objectFit: 'cover' }} />
                        <div className="flex flex-col mt-auto mb-auto">
                            <p className="text-lg font-bold" style={{ color: `rgba(${settings.primaryColor}, 1)` }}>{testContent[0].title}</p>
                            <p className="text-md font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>{testContent[0].releaseDate.substring(0, 4)}</p>
                        </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <img src={`https://image.tmdb.org/t/p/original/${testContent[0].posterPath}`} className="w-1/3 h-1/3 rounded-2xl" style={{ objectFit: 'cover' }} />
                        <div className="flex flex-col mt-auto mb-auto">
                            <p className="text-lg font-bold" style={{ color: `rgba(${settings.primaryColor}, 1)` }}>{testContent[0].title}</p>
                            <p className="text-md font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>{testContent[0].releaseDate.substring(0, 4)}</p>
                        </div>
                    </div> */}
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <h1 className="text-xl font-bold " style={{ color: `rgba(${settings.primaryColor}, 1)` }}>Today's Pick</h1>

                {/* <ContentCard content={testContent[0]} onClick={() => { }} onStatusChange={() => { }} onRemoveContent={() => { }} fromWatchlist={false} /> */}
            </div>
        </div>
    )
});
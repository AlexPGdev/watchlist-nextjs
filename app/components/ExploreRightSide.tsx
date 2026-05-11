import React from "react";
import settings from "../constants/settings.json";
import { ContentCard } from "./ContentCard";



export const ExploreRightSide = React.memo(function ExploreRightSide() {

    const testContent = [
        {
            "id": 104,
            "title": "Fight Club",
            "description": "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy. Their concept catches on, with underground \"fight clubs\" forming in every town, until an eccentric gets in the way and ignites an out-of-control spiral toward oblivion.",
            "watched": true,
            "watchDate": 1728172800000,
            "releaseDate": "1999-10-15",
            "genres": [
                "Drama",
                "Thriller"
            ],
            "streamingServices": [],
            "posterPath": "https://image.tmdb.org/t/p/w500//pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
            "trailerPath": "dfeUzm6KF4g",
            "logoPath": "/7Uqhv24pGJs4Ns31NoOPWFJGWNG.png",
            "logoAspectRatio": 4.638,
            "imdbId": "tt0137523",
            "tmdbId": 550,
            "rating": null,
            "imdbRating": 8.8,
            "rtRating": "81%",
            "rtAudienceRating": "96%",
            "ambientColor": null,
            "runtime": 139,
            "certification": "R",
            "recommendedMovies": [
                680,
                807,
                13,
                59967,
                603,
                77,
                73,
                510,
                2649,
                598,
                155,
                120,
                627,
                68718,
                585,
                27205,
                629,
                122,
                1891,
                431
            ],
            "recommendedTvSeries": null,
            "totalSeasons": null,
            "totalEpisodes": null,
            "contentType": "movie",
            "favorite": 1,
            "started": false,
            "startedDate": null,
            "logged": null
        },
    ]

    return (
        <div className="flex flex-col gap-4 max-w-1/5">
            <div className="flex flex-col gap-2">
                <h1 className="text-xl font-bold" style={{ color: `rgba(${settings.primaryColor}, 1)` }}>Newly Released</h1>

                <div className="border-1 border-cyan-800 rounded-2xl overflow-hidden p-4 bg-cyan-800/10">
                    <div className="flex gap-2 border-b-1 border-cyan-800 pb-2">
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
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <h1 className="text-xl font-bold " style={{ color: `rgba(${settings.primaryColor}, 1)` }}>Today's Pick</h1>

                <ContentCard content={testContent[0]} onClick={() => { }} onStatusChange={() => { }} onRemoveContent={() => { }} fromWatchlist={false} />
            </div>
        </div>
    )
});
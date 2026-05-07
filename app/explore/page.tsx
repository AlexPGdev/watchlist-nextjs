"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Header } from "../components/Header";
import { useAuth } from "../hooks/useAuth";
import { useContent } from "../hooks/useContent";
import Cookies from 'js-cookie'
import { Content } from "../types/content";
import settings from "../constants/settings.json";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { ContentCard } from "../components/ContentCard";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

export default function Page() {
  const { user, isLoggedIn } = useAuth();
  const { content } = useContent();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [recommendations, setRecommendations] = useState<Content[]>([]);
  const [backdrops, setBackdrops] = useState<any[]>([]);

  const scrollRefs = useRef({})
  const [scrollState, setScrollState] = useState({})

  const updateScrollState = (key) => {
    const el = scrollRefs.current[key]

    if (!el) return

    const isAtLeft = el.scrollLeft <= 0

    const isAtRight =
      el.scrollLeft + el.clientWidth >= el.scrollWidth - 1

    setScrollState((prev) => ({
      ...prev,
      [key]: {
        isAtLeft,
        isAtRight,
      },
    }))
  }

  useEffect(() => {
    if(recommendations.length < 1) {
        loadRecommendedMovies()
    }
  }, [content, isLoggedIn])

  const loadRecommendedMovies = useCallback(async () => {
    if (!isLoggedIn || content.length === 0) return;

    try {
      // Fetch recommendations
      const res = await fetch(
        `https://api.spectaer.com/watchlist/api/page-content/recommended?requestType=minimal`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `RememberMe ${Cookies.get("rememberMeToken")}`,
          },
        }
      );

      const data = await res.json();

      const objects = data[0].objects;

      // Fetch backdrops for each object in parallel
      const objectsWithBackdrops = await Promise.all(
        objects.map(async (item) => {
          try {
            const backdropRes = await fetch(
              `https://api.spectaer.com/watchlist/api/content/extended-details?id=${item.tmdbId}&type=movie`
            );
            const backdropData = await backdropRes.json();
            return {
              ...item,
              backdrops: backdropData.images?.backdrops || [],
            };
          } catch (err) {
            console.error("Error fetching backdrops for", item.tmdbId, err);
            return {
              ...item,
              backdrops: [],
            };
          }
        })
      );

      // Replace objects with backdrops in the recommendations
      const updatedData = [
        {
          ...data[0],
          objects: objectsWithBackdrops,
        },
        ...data.slice(1),
      ];

      setRecommendations(updatedData);
    } catch (err) {
      console.error("Error loading recommendations:", err);
    }
  }, [isLoggedIn, content]);

  async function getBackdrops(id, type) {
        fetch(`https://api.spectaer.com/watchlist/api/content/extended-details?id=${id}&type=${type}`, {
          "method": "GET"
        })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
          console.log({bakcrops: data.images.backdrops})
          setBackdrops(prev => [...prev, data.images.backdrops])
        })

    return;
  }

  useEffect(() => {
    console.log({backdrops})
  }, [backdrops])

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
    <div className="page flex flex-col p-4 sm:p-4 md:p-4 md:px-[15%] lg:px-[18%] gap-5 md:gap-5 tracking-wider">
      <Header onOpen={() => setShowLoginModal(true)} />

      <div className="flex justify-between gap-25">
        <div className="flex flex-col w-3/4 gap-4">
          {(recommendations.length > 0 && recommendations[0].objects.length > 0) && (
            <div className="flex flex-col select-none gap-2 ">
              <div>
                <h1 className="text-2xl font-bold" style={{ color: `rgba(${settings.primaryColor}, 1)` }}>{recommendations[0].title}</h1>
                <h1 className="text-xl font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>{recommendations[0].subtitle}</h1>
              </div>

              <div className="relative w-full">
                <Swiper
                  modules={[Navigation]}
                  simulateTouch={false}
                  navigation={{
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                  }}
                  slidesPerView={1.15}
                  draggable={false}
                  spaceBetween={-110}
                  pagination={{ clickable: true }}
                  className="w-full rounded-2xl overflow-hidden [mask-image:linear-gradient(to_right,black_90%,transparent)]"
                >
              

                  {recommendations[0].objects.map((item, index) => (
                    <SwiperSlide
                      key={index}
                      className="rounded-2xl"
                      style={{ width: '500px', position: 'relative', overflow: 'hidden'}}
                    >
                      <div className="relative">
                        <img src={`https://image.tmdb.org/t/p/original/${item.backdrops[0].file_path}`} className="w-full h-full" style={{ objectFit: 'cover' }} />

                        <div className="absolute flex rounded-tr-2xl bottom-0 left-0 gap-3 bg-gradient-to-t from-black/80 to-transparent" style={{ height: '100%', width: '100%' }} draggable={false}>
                          <img
                            src={`https://image.tmdb.org/t/p/original/${item.posterPath}`} 
                            className="object-cover rounded-tr-2xl w-full h-full mt-auto"
                            style={{ height: '60%', width: 'auto', objectFit: "cover", boxShadow: '2px 2px 10px rgb(0, 0, 0, 1)' }}
                            draggable={false}
                          />

                          <div className="flex flex-col self-end mb-3 gap-2 tracking-wider">
                            <h1 className="text-2xl font-bold -mb-2" style={{ color: `rgba(${settings.primaryColor}, 1)`, textShadow: `2px 2px 2px rgba(0, 0, 0, 0.5)` }}>{item.title}</h1>
                            <div className="flex gap-2 text-lg font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)`, textShadow: `2px 2px 2px rgba(0, 0, 0, 0.5)` }}>
                              <p>{item.releaseDate.substring(0, 4)}</p>
                              <p>•</p>
                              <p>{item.certification}</p>
                              <p>•</p>
                              {recommendations[0].objects[1].contentType === 'movie' ? (
                                  <p>{item.runtime > 60 ? `${Math.floor(item.runtime / 60)}h ${item.runtime % 60}m` : `${item.runtime} mins`}</p>
                              ) : (
                                  <p>{item.totalSeasons} seasons</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                                {item.genres.map((genre: string) => (
                                    <p className="text-sm p-0.5 px-2 bg-cyan-800/30 rounded-full border-1 border-cyan-500/80" key={genre} style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>
                                        {genre}
                                    </p>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                <button className="swiper-button-next absolute right-15 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-7 h-7 bg-cyan-800/60 rounded-full backdrop-blur-sm rounded-2xl" style={{ boxShadow: '-2px 2px 10px rgb(0, 0, 0, 0.5)' }}>
                  <HiChevronRight color={`rgba(${settings.primaryColorDark}, 1)`} style={{ marginLeft: '2px' }} />
                </button>

                <button className="swiper-button-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-7 h-7 bg-cyan-800/60 rounded-full backdrop-blur-sm rounded-2xl" style={{ boxShadow: '-2px 2px 10px rgb(0, 0, 0, 0.5)' }}>
                  <HiChevronLeft color={`rgba(${settings.primaryColorDark}, 1)`} style={{ marginRight: '2px' }} />
                </button>
              </div>
            </div>
          )}

          {recommendations.length > 0 && (
            recommendations.map((item, index) => (
              item.cacheKey !== 'trending_movies' && (
                <div key={item.cacheKey} className="flex flex-col select-none">
                  <div>              
                    <h1 className="text-xl font-bold" style={{ color: `rgba(${settings.primaryColor}, 1)` }}>{item.title}</h1>
                    <h1 className="text-lg font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>{item.subtitle}</h1>
                  </div>

                  <div className="relative w-full">
                    <div 
                      ref={(el) => {
                        scrollRefs.current[item.cacheKey] = el

                        // initialize state
                        if (el && !scrollState[item.cacheKey]) {
                          setTimeout(() => updateScrollState(item.cacheKey), 0)
                        }
                      }}
                      onScroll={() => updateScrollState(item.cacheKey)}
                      className="relative flex gap-2 [mask-image:linear-gradient(to_right,black_90%,transparent)] py-2 overflow-x-scroll no-scrollbar overflow-y-visible"
                    >
                      {item.objects.map((object, index) => (
                        <div key={object.movie ? object.movie.id : object.id} className="shrink-0 w-[200px]">
                          <ContentCard content={object.movie ? object.movie : object} onClick={() => {}} onStatusChange={() => {}} onRemoveContent={() => {}} fromWatchlist={false} />
                        </div>
                      ))}
                    </div>


                    <button
                      disabled={scrollState[item.cacheKey]?.isAtLeft}
                      className="absolute left-[15px] top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-[44px] h-[44px] bg-cyan-800/60 rounded-full backdrop-blur-sm rounded-2xl cursor-pointer hover:scale-105 disabled:cursor-default disabled:opacity-50 transition-all"
                      style={{ boxShadow: '-2px 2px 10px rgb(0, 0, 0, 0.5)' }}
                      onClick={() => {
                        scrollRefs.current[item.cacheKey]?.scrollBy({
                          left: -300,
                          behavior: 'smooth',
                        })
                      }}
                    >
                      <HiChevronLeft color={`rgba(${settings.primaryColorDark}, 1)`} style={{ marginRight: '2px' }} size={44} />
                    </button>


                    <button 
                      disabled={scrollState[item.cacheKey]?.isAtRight}
                      className="absolute right-[15px] top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-[44px] h-[44px] bg-cyan-800/60 rounded-full backdrop-blur-sm rounded-2xl cursor-pointer hover:scale-105 disabled:cursor-default disabled:opacity-50 transition-all"
                      style={{ boxShadow: '-2px 2px 10px rgb(0, 0, 0, 0.5)' }}
                      onClick={() => {
                        scrollRefs.current[item.cacheKey]?.scrollBy({
                          left: 300,
                          behavior: 'smooth',
                        })
                      }}
                    >
                      <HiChevronRight color={`rgba(${settings.primaryColorDark}, 1)`} style={{ marginLeft: '2px' }} size={44} />
                    </button>


                    
                  </div>

                </div>
              )
            ))
            
          )}
        </div>


        <div className="flex flex-col gap-4 max-w-1/5">
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-bold" style={{ color: `rgba(${settings.primaryColor}, 1)` }}>Recently Viewed</h1>

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

            <ContentCard content={testContent[0]} onClick={() => {}} onStatusChange={() => {}} onRemoveContent={() => {}} fromWatchlist={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
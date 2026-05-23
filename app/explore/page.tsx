"use client";

import { useCallback, useEffect, useRef, useState, Suspense } from "react";
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
import { Trending } from "../components/Trending";
import { Recommendations } from "../components/Recommendations";
import { ExploreRightSide } from "../components/ExploreRightSide";
import { ContentDetailsModal } from "../components/modals/ContentDetailsModal";
import { useRouter } from "next/navigation";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export default function Page() {

  const router = useRouter();

  const { user, isLoggedIn } = useAuth();
  const { content } = useContent();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);

  const { loadRecommendedMovies, recommendations } = useContent();

  useEffect(() => {
    loadRecommendedMovies()
  }, [content, isLoggedIn])

  const handleContentClick = useCallback((content: Content) => {
    router.push(`?${content.contentType.toLowerCase()}=${content.tmdbId}`, { scroll: false })
    setSelectedContent(content)
    setShowModal(true)
  }, []);

  const handleOpenSearchResult = useCallback((result: any) => {
    router.push(`?${result.mediaType.toLowerCase()}=${result.id}`, { scroll: false })
    setSelectedContent(result)
    setShowModal(true)
  }, []);

  return (
    <div className="page flex flex-col p-4 sm:p-4 md:p-4 md:px-[15%] lg:px-[18%] gap-5 md:gap-5 tracking-wider">
      <Header onOpen={() => setShowLoginModal(true)} onOpenSearchResult={handleOpenSearchResult} />

      <div className="flex flex-col justify-between gap-25 lg:flex-row">
        <div className="flex flex-col w-full lg:w-3/4 gap-4">

          {(recommendations.length > 0 && recommendations[0].objects.length > 0) ? (
            <Trending item={recommendations[0]} onContentClick={handleContentClick} />
          ) : (
            <div className="flex flex-col select-none gap-2 ">
              <div>
                  <Skeleton width={'250px'} height={"58px"} className="rounded-full" baseColor="#27272a" highlightColor="#3c3c3e" borderRadius={"1rem"} />
              </div>

              <Skeleton width={'100%'} className="rounded-full " baseColor="#27272a" highlightColor="#3c3c3e" borderRadius={"1rem"} style={{ aspectRatio: '2.05' }} />
            </div>
          )}

          {recommendations.length > 0 ? (
            <Recommendations recommendations={recommendations} onContentClick={handleContentClick} />
          ) : (
            <div className="flex flex-col select-none gap-2 ">
              <Skeleton width={'250px'} height={"40px"} className="rounded-full" baseColor="#27272a" highlightColor="#3c3c3e" borderRadius={"1rem"} />
              <Skeleton width={"100%"} height={"270px"} className="rounded-full" baseColor="#27272a" highlightColor="#3c3c3e" borderRadius={"1rem"} />

              <Skeleton width={'250px'} height={"40px"} className="rounded-full" baseColor="#27272a" highlightColor="#3c3c3e" borderRadius={"1rem"} />
              <Skeleton width={"100%"} height={"270px"} className="rounded-full" baseColor="#27272a" highlightColor="#3c3c3e" borderRadius={"1rem"} />
            </div>
          )}
        </div>


        <ExploreRightSide />

        <Suspense fallback={null}>
          <ContentDetailsModal selectedContent={selectedContent} onClose={() => setShowModal(false)} open={showModal} />
        </Suspense>
      </div>
    </div>
  );
}
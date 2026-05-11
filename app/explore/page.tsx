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
import { Trending } from "../components/Trending";
import { Recommendations } from "../components/Recommendations";
import { ExploreRightSide } from "../components/ExploreRightSide";
import { ContentDetailsModal } from "../components/modals/ContentDetailsModal";

export default function Page() {
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
    setSelectedContent(content)
    setShowModal(true)
  }, []);

  return (
    <div className="page flex flex-col p-4 sm:p-4 md:p-4 md:px-[15%] lg:px-[18%] gap-5 md:gap-5 tracking-wider">
      <Header onOpen={() => setShowLoginModal(true)} />

      <div className="flex justify-between gap-25">
        <div className="flex flex-col w-3/4 gap-4">

          {(recommendations.length > 0 && recommendations[0].objects.length > 0) && (
            <Trending item={recommendations[0]} onContentClick={handleContentClick} />
          )}

          {recommendations.length > 0 && (
            <Recommendations recommendations={recommendations} onContentClick={handleContentClick} />
          )}
        </div>


        <ExploreRightSide />

        <ContentDetailsModal content={selectedContent} onClose={() => setShowModal(false)} open={showModal} />
      </div>
    </div>
  );
}
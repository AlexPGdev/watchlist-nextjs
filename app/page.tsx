"use client";

import { FilterTab } from "./components/FilterTab";
import { Header } from "./components/Header";
import { MovieDetailsModal } from "./components/modals/MovieDetailsModal";
import { MovieCard } from "./components/MovieCard";
import { MovieGrid } from "./components/MovieGrid";
import { Stats } from "./components/Stats";
import settings from "./constants/settings.json";
import { useMovies } from "./hooks/useMovies";
import { useEffect, useMemo, useState } from "react";


export default function Home() {
  const { movies, stats } = useMovies();
  const [showModal, setShowModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);

  const scrollToSection = (section: number) => {
    return () => {
      const sectionElement = document.getElementById(`section-${section}`)
      if (!sectionElement) return

      const offset = sectionElement.offsetTop - 100
      window.scrollTo({ top: offset, behavior: 'smooth' })
    }
  }

  const handleMovieClick = (movie: any) => {
    setSelectedMovie(movie)
    setShowModal(true)
  }



  return (
    <div className="page flex flex-col p-4 sm:p-6 md:p-10 md:px-[15%] lg:px-[20%] gap-6 md:gap-10">
      <Header />
      <Stats stats={stats} />

      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">Watchlist</h1>
        <input type="text" placeholder="Search..." className="w-full bg-black/50 rounded-2xl border-1 border-cyan-800 p-2 px-4 shadow-xs shadow-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-500" />

        <FilterTab scrollToSection={scrollToSection} />

        <MovieGrid movies={movies} onMovieClick={handleMovieClick}/>

        <MovieDetailsModal movie={selectedMovie} onClose={() => setShowModal(false)} open={showModal} />


      </div>
    </div>
  )
}
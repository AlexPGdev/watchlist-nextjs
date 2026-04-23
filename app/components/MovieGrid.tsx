import React, { useMemo } from "react";
import { MovieCard } from "./MovieCard";

interface MovieGridProps {
    movies: any[];
    onMovieClick?: (movie: any) => void;
}

export const MovieGrid = React.memo(function MovieGrid({ movies, onMovieClick }: MovieGridProps) {

    const { watchedMovies, startedMovies, toWatchMovies } = useMemo(() => {
        if (movies && movies.length > 0) {
            return {
                watchedMovies: movies.filter(m => m.watched === true && !m.logged),
                startedMovies: movies.filter(m => m.started === true && m.watched === false),
                toWatchMovies: movies.filter(m => m.watched === false && m.started === false)
            }
        } else {
            return {
                watchedMovies: [],
                startedMovies: [],
                toWatchMovies: []
            }
        }
    }, [movies])

    return (
        <div className="flex flex-col gap-5">
            {watchedMovies.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold" id="section-0">Watched</h1>
                    <ul className="grid gap-3 md:gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
                        {watchedMovies.map(movie => (
                            <MovieCard key={movie.id} movie={movie} onClick={onMovieClick} />
                        ))}
                    </ul>
                </div>
            )}
            {startedMovies.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold" id="section-1">Started</h1>
                    <ul className="grid gap-3 md:gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
                        {startedMovies.map(movie => (
                            <MovieCard key={movie.id} movie={movie} onClick={onMovieClick} />
                        ))}
                    </ul>
                </div>
            )}
            {toWatchMovies.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold" id="section-2">To Watch</h1>
                    <ul className="grid gap-3 md:gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
                        {toWatchMovies.map(movie => (
                            <MovieCard key={movie.id} movie={movie} onClick={onMovieClick} />
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
});
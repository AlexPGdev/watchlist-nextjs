export interface Content {
    id: number
    tmdbId: number
    imdbId: number
    title: string
    description: string
    posterPath: string
    logoPath: string
    logoAspectRatio: number
    runtime: number
    totalSeasons: number
    genres: string[]
    watched: boolean
    started: boolean
    watchDate: number
    startedDate: number
    toggled: boolean
    streamingServices: any[]
    imdbRating: number
    rtRating: number
    certification: string
    ambientColor: string
    favorite: number
    contentType: string
    mediaType: string
    releaseDate: string
    addedDate: number
    logged: boolean
    trailerPath: string
    recommendedMovies: number[]
    recommendedTvSeries: number[] | null
}
/**
 * Shared types for drama detail data.
 * Used by DramaDetailScreen, VideoPlayer, and the dramas API layer.
 */

export interface Episode {
  id: string;
  number: number;
  title: string;
  image: string;
  duration: string;
  status: "free" | "locked" | "watched";
  watchedAgo?: string;
  progress?: number;
}

export interface DramaDetail {
  id: string;
  title: string;
  banner: string;
  genre: string[];
  episodeCount: number;
  year: string;
  country: string;
  rating: number;
  reviewCount: string;
  watchingNow: string;
  likes: string;
  description: string;
  trailerThumbnail: string;
  trailerDuration: string;
  episodes: Episode[];
}

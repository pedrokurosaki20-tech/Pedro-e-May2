export type MediaType = 'movie' | 'tv' | 'anime';

export interface MediaItem {
  id: number;
  title: string;
  original_title?: string;
  name?: string; // For TV series in TMDB
  overview: string;
  poster_path: string;
  backdrop_path: string;
  media_type: MediaType;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count?: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  trailer_youtube_id?: string;
}

export interface EmbedServer {
  id: string;
  name: string;
  serverNumber: number;
  description: string;
  getUrl: (item: MediaItem, season?: number, episode?: number) => string;
}

export type CineminhaEventType = 
  | 'PLAY'
  | 'PAUSE'
  | 'SEEK'
  | 'TIME_UPDATE'
  | 'BUFFER'
  | 'READY'
  | 'MESSAGE'
  | 'SYNC_REQUEST'
  | 'SYNC_RESPONSE';

export interface CineminhaSyncEvent {
  id: string;
  type: CineminhaEventType;
  mediaId: number;
  mediaTitle: string;
  mediaType: MediaType;
  currentTime: number; // in seconds
  isPlaying: boolean;
  senderName: string;
  timestamp: number;
  season?: number;
  episode?: number;
  message?: string;
}

export interface CineminhaState {
  roomCode: string;
  isConnected: boolean;
  partnerName: string;
  partnerOnline: boolean;
  isSynced: boolean;
  lastPartnerAction?: string;
  recentLogs: CineminhaSyncEvent[];
}

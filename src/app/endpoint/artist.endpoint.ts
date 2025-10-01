import { Endpoint } from '@/app/endpoint/index';
import { GetBandResponse } from '@/app/endpoint/lesson.endpoint';

export type GetArtistParameter = {
  id: number;
}

export type GetArtistResponse = {
  id: number;
  name: string;
  nickName: string;
  profileImageUrl: string;
  phone?: string;
  instagramAddress?: string;
  youtubeAddress?: string;
  tiktokAddress?: string;
  genres?: string[];
  description?: string;
  badges?: ArtistBadgeResponse[];
  summary?: ArtistSummaryResponse;
  band?: GetBandResponse;
};

export type ArtistBadgeResponse = {
  label: string;
  type: string;
}

export type ArtistSummaryResponse = {
  title: string;
  elements: { key: string; label: string }[];
}

export const getArtist: Endpoint<GetArtistParameter, GetArtistResponse> = {
  method: "get",
  path: (e) => `/artists/${e.id}`,
};

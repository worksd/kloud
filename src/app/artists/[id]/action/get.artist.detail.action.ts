import { api } from '@/app/api.client';

export const getArtistDetailAction = async ({artistId}: { artistId: number }) => {
  return await api.artist.getArtist({id: artistId});
}

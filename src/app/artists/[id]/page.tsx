import { getArtistDetailAction } from '@/app/artists/[id]/action/get.artist.detail.action';
import { notFound } from 'next/navigation';
import ArtistDetailForm from '@/app/artists/[id]/artist.detail.form';
import { isGuinnessErrorCase } from '@/app/guinnessErrorCase';

export default async function ArtistDetailPage({params, searchParams}: {
  params: Promise<{ id: string }>,
  searchParams: Promise<{ os: string, appVersion: string }>
}) {
  const artistId = Number((await params).id);
  if (isNaN(artistId)) {
    notFound();
  }
  const { os, appVersion } = await searchParams;

  const res = await getArtistDetailAction({artistId});
  if (isGuinnessErrorCase(res)) {
    return (
      <div className="flex items-center justify-center p-4">
        <p className="text-red-500">
          { res.message } (Error: { res.code })
        </p>
      </div>
    );
  }

  return (
    <div className={ 'flex flex-col' }>
      <ArtistDetailForm artist={ res } appVersion={ appVersion } />
    </div>

  )
}

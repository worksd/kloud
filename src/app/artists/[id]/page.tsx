import { getArtistDetailAction } from '@/app/artists/[id]/action/get.artist.detail.action';
import { notFound } from 'next/navigation';
import ArtistDetailForm from '@/app/artists/[id]/artist.detail.form';
import { isGuinnessErrorCase } from '@/app/guinnessErrorCase';
import { ErrorPage } from '@/app/components/ErrorPage';

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
    return <ErrorPage error={ res }/>;
  }

  return (
    <div className={ 'flex flex-col' }>
      <ArtistDetailForm artist={ res } appVersion={ appVersion } />
    </div>

  )
}

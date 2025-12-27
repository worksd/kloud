export default async function MembershipPage({searchParams}: {
  searchParams: Promise<{ appVersion: string, studioId?: string, os: string }>
}) {
  const {os, appVersion, studioId} = await searchParams;
  return(
      <div className={'bg-black text-white'}>
        Membership Page {studioId}
      </div>
  )
}
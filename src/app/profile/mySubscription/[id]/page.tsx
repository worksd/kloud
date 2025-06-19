export default async function MySubscriptionDetailPage({params}: {
  params: Promise<{ id: number }>
}) {
  return (
    <div className={'text-black'}>{(await params).id}</div>
  )
}
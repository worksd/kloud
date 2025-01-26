import HomeScreen from "@/app/home/home.screen";

export default async function Home({
                                     searchParams
                                   }: {
  searchParams: Promise<{ os: string }>
}) {

  return (
    <HomeScreen os={(await searchParams).os}/>
  )
}
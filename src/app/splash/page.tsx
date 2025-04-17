import { SplashScreen } from "@/app/splash/splash.screen";

export default async function Splash({searchParams}: { searchParams: Promise<{ os: string }> }) {
  const {os} = await searchParams
  return (
    <SplashScreen os={os}/>
  );
}
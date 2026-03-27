import { SplashScreen } from "@/app/splash/splash.screen";

export default async function Splash({searchParams}: { searchParams: Promise<{ os: string, link?: string }> }) {
  const {os, link} = await searchParams
  return (
    <SplashScreen os={os} link={link}/>
  );
}
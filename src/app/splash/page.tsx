import { SplashScreen } from "@/app/splash/splash.screen";

export default async function Splash({searchParams}: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  console.log('[Splash] searchParams:', JSON.stringify(params));
  const { os = '', link } = params;
  return (
    <SplashScreen os={os} link={link}/>
  );
}
import { SplashScreen } from "@/app/splash/splash.screen";
import { api } from "@/app/api.client";

export default async function Splash() {
  const res = await api.auth.token({})

  return (
    <SplashScreen status={'status' in res ? res.status : undefined}/>
  );
}
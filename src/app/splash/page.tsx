import { SplashScreen } from "@/app/splash/splash.screen";
import { api } from "@/app/api.client";

export default async function Splash() {
  const res = await api.auth.token({})
  console.log('splash page ' + JSON.stringify(res));

  return (
    <SplashScreen status={'status' in res ? res.status : undefined}/>
  );
}
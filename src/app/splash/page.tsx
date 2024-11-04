import { api } from "@/app/api.client";
import { UserStatus } from "@/entities/user/user.status";
import SplashScreen from "@/app/splash/splash.screen";
import { KloudScreen } from "@/shared/kloud.screen";

export default async function Splash() {

  const navigateScreen = await getNavigateScreen()

  return (
    <SplashScreen screen={navigateScreen}/>
  );
}

async function getNavigateScreen(): Promise<KloudScreen> {
  await new Promise(resolve => setTimeout(resolve, 2000)); // Delay for 2 seconds
  const validateToken = await api.auth.token({});
  const userStatus = validateToken.status;

  if (!userStatus) {
    return KloudScreen.Login
  }
  else {
    if (userStatus == UserStatus.Ready) {
      return KloudScreen.Main;
    }
    else if (userStatus == UserStatus.New) {
      return KloudScreen.Onboard;
    }
    else throw Error()
  }
}
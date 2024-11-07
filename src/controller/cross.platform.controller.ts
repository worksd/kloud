import { KloudScreen } from "@/shared/kloud.screen";

class CrossPlatformController {

  constructor() {
    window.navigate = this.navigate.bind(this);
    window.onSplashStarted = this.onSplashStarted.bind(this);

    
  }

  navigate(screen: KloudScreen, data?: string) {
    console.log('[CrossPlatformController] navigate');
    const customEvent = new CustomEvent('navigate', { detail: screen});
    window.dispatchEvent(customEvent)
  }

  onSplashStarted() {
    console.log('[CrossPlatformController] onSplashStarted');
    const customEvent = new CustomEvent('onSplashStarted')
    window.dispatchEvent(customEvent)
  }

}
export default CrossPlatformController;
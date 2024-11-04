import { KloudScreen } from "@/shared/kloud.screen";

class CrossPlatformController {

  constructor() {
    window.navigate = this.navigate.bind(this);

    
  }

  navigate(screen: KloudScreen, data?: string) {
    const customEvent = new CustomEvent('navigate', { detail: screen});
    window.dispatchEvent(customEvent)
  }

}
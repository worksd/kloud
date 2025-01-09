'use client'
import { KloudScreen } from "@/shared/kloud.screen";

export function clearAndPush({route}: {route: string}) {
  if (window.KloudEvent) {
    window.KloudEvent.clearAndPush(route)
  }
}

export function push({route}: {route: string}) {
  if (window.KloudEvent) {
    window.KloudEvent.push(route)
  }
}

export function navigateMain() {
  if (window.KloudEvent) {
    const bootInfo = JSON.stringify({
      bottomMenuList: process.env.BOTTOM_MENU_LIST,
      route: KloudScreen.Main,
    });
    window.KloudEvent.navigateMain(bootInfo)
  }
}

export function sendAppleLogin() {
  if (window.KloudEvent) {
    window.KloudEvent.sendAppleLogin()
  }
}

export function back() {
  if (window.KloudEvent) {
    window.KloudEvent.back()
  }
}
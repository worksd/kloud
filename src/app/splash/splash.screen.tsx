"use client";

import { KloudScreen } from "@/shared/kloud.screen";
import { useEffect } from "react";

export default function SplashScreen({ screen }: { screen: KloudScreen }) {
  useEffect(() => {
    if (window.KloudEvent && screen) {
      console.log('Navigating to:', screen, window);
      window.KloudEvent.navigate(screen);
    } else {
      console.warn(`window or screen is undefined. Screen value: ${screen}`);
    }
  }, [screen]);

  return (
    <div style={{
      backgroundColor: 'black',
      color: 'white',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column'
    }}>
      <h1>Hello Splash {screen}</h1>
    </div>
  );
}
"use client";

import { useEffect } from "react";
import { UserStatus } from "@/entities/user/user.status";
import { authNavigateAction } from "@/app/splash/auth.navigate.action";

export const SplashScreen = ({status}: { status: UserStatus | undefined }) => {
  useEffect(() => {
    setTimeout(() => {
      authNavigateAction({status: status})
    }, 1000)
  }, [status]);

  return (
    <div className="bg-black">
    </div>
  );
};
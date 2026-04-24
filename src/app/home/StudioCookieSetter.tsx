'use client'

import { useEffect } from "react";
import { saveStudioIdAction } from "@/app/studios/save.studio.id.action";

export const StudioCookieSetter = ({ studioId }: { studioId: number }) => {
  useEffect(() => {
    saveStudioIdAction({ studioId });
  }, [studioId]);

  return null;
};

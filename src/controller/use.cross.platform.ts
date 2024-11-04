import { useContext } from 'react';
import CrossPlatformContext from "@/controller/cross.platform.context";
const useCrossPlatform = () => {
  const crossPlatformManager = useContext(CrossPlatformContext);
  if (crossPlatformManager === null) {
    throw new Error('CrossPlatformManager is not initialized');
  }

  return crossPlatformManager.crossPlatformController;
};

export default useCrossPlatform;

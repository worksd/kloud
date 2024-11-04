import { createContext } from 'react';
import CrossPlatformManager from "@/controller/cross.platform.manager";

const CrossPlatformContext = createContext<CrossPlatformManager | null>(null);

export default CrossPlatformContext;

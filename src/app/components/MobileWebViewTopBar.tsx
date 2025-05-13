'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KloudScreen } from "@/shared/kloud.screen";
import { unregisterDeviceAction } from "@/app/home/action/unregister.device.action";
import { clearCookies } from "@/app/profile/clear.token.action";

export const getStoreLink = ({os}: { os: string }) => {
  if (os == 'Android') {
    return {
      label: '플레이스토어',
      url: "https://play.google.com/store/apps/details?id=com.rawgraphy.blanc"
    };
  } else if (os == 'iOS') {
    return {
      label: '앱 스토어',
      url: "https://apps.apple.com/app/id6740252635"
    }
  }
  return null;
};

export const MobileWebViewTopBar = ({returnUrl, os, isLogin} : {returnUrl: string, os: string, isLogin: boolean}) => {

  const router = useRouter()

  const handleLogin = () => {
    router.push(KloudScreen.Login(returnUrl));
  };

  const handleLogout = async () => {
    await unregisterDeviceAction()
    await clearCookies();
    router.replace(KloudScreen.Login(returnUrl))
  };


  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm flex justify-between items-center px-4 z-50">
      <StoreButton os={os} className="relative top-0 left-0"/>
      <AuthButton
        isLoggedIn={isLogin}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
    </div>
  )
}

function AuthButton({isLoggedIn, onLogin, onLogout}: {
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
}) {
  return (
    <button
      onClick={isLoggedIn ? onLogout : onLogin}
      className="flex items-center gap-2 text-[12px] bg-white hover:bg-gray-100 text-black font-semibold px-5 py-3 rounded-2xl shadow-md transition-all duration-300 border border-gray-200"
    >
      <span>{isLoggedIn ? '로그아웃' : '로그인'}</span>
    </button>
  );
}

function StoreButton({os, className = ""}: { os: string, className?: string }) {
  const [store, setStore] = useState<{ url: string; label: string; } | null>(null);

  useEffect(() => {
    setStore(getStoreLink({os}));
  }, [os]);

  if (!store) return null;

  return (
    <a href={store.url} target="_blank" rel="noopener noreferrer" className={className}>
      <button
        className="flex items-center gap-2 text-[12px] bg-black hover:bg-gray-800 text-white font-semibold px-5 py-3 rounded-2xl shadow-md transition-all duration-300">
        <span>{store.label}에서 다운로드</span>
      </button>
    </a>
  );
}

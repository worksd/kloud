'use client'
import { useEffect, useState } from "react";

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

export const MobileWebViewTopBar = ({os} : {os: string}) => {
  return (
      <div className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm flex justify-between items-center px-4 z-50">
        <StoreButton os={os} className="relative top-0 left-0"/>
      </div>
  )
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

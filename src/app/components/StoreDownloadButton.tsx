'use client'
import { useEffect, useState } from "react";

const getStoreLink = ({os} : {os: string}) => {
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

export default function StoreButton({os} : {os: string}) {
  const [store, setStore] = useState<{ url: string; label: string; } | null>(null);

  useEffect(() => {
    setStore(getStoreLink({os}));
  }, []);

  if (!store) return null;

  return (
    <a href={store.url} target="_blank" rel="noopener noreferrer" className={"absolute top-4 right-4 text-gray-600"}>
      <button
        className="flex items-center gap-2 text-[12px] bg-black hover:bg-black text-white font-semibold px-5 py-3 rounded-2xl shadow-md transition-all duration-300">
        <span>{store.label}에서 다운로드</span>
      </button>
    </a>
  );
}
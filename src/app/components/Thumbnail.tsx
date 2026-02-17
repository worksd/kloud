'use client';

import Image from "next/image";
import {useState} from "react";

interface ThumbnailProps {
  className?: string;
  width?: number;
  url: string;
  aspectRatio?: number; // 기본값 167/222
}

const Placeholder = () => (
    <div className="w-full h-full bg-[#F1F3F6] flex items-center justify-center">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="#C5C8CB" strokeWidth="1.5"/>
        <circle cx="8.5" cy="10.5" r="1.5" stroke="#C5C8CB" strokeWidth="1.5"/>
        <path d="M3 16l4.793-4.793a1 1 0 011.414 0L13 15l2.793-2.793a1 1 0 011.414 0L21 16" stroke="#C5C8CB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
);

export const Thumbnail = ({ className = "", width, url, aspectRatio = 167/222 }: ThumbnailProps) => {
  const [hasError, setHasError] = useState(false);

  const containerStyle = width ? {
    width: `${width}px`,
    height: `${Math.round(width / aspectRatio)}px`
  } : undefined;

  return (
    <div
      className={`relative [-webkit-touch-callout:none] ${width ? '' : 'w-full aspect-[167/222]'} ${className}`}
      style={containerStyle}
    >
      {url && !hasError ? (
        <Image
          src={url}
          alt="썸네일"
          fill
          draggable={false}
          className="object-cover"
          sizes={width ? `${width}px` : "100vw"}
          onError={() => setHasError(true)}
        />
      ) : (
        <Placeholder />
      )}
    </div>
  );
}
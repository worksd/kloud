import Image from "next/image";

interface ThumbnailProps {
  className?: string;
  width?: number;
  url: string;
  aspectRatio?: number; // 기본값 167/222
}

export const Thumbnail = ({ className = "", width, url, aspectRatio = 167/222 }: ThumbnailProps) => {
  const containerStyle = width ? {
    width: `${width}px`,
    height: `${Math.round(width / aspectRatio)}px`
  } : undefined;

  return (
    <div
      className={`relative [-webkit-touch-callout:none] ${width ? '' : 'w-full aspect-[167/222]'} ${className}`}
      style={containerStyle}
    >
      <Image
        src={url}
        alt="썸네일"
        fill
        draggable={false}
        className="object-cover rounded-[8px]"
        sizes={width ? `${width}px` : "100vw"}
      />
    </div>
  );
}
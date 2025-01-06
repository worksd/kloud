import Image from "next/image";

export const Thumbnail = ({width, url} : {width?: number, url: string} ) => {
  return (
    <div
      className={width === undefined ? "w-full aspect-[167/222] relative [-webkit-touch-callout:none]" : "relative [-webkit-touch-callout:none]"}
      style={width ? {
        width: `${width}px`,
        height: `${Math.round((width * 222) / 167)}px`
      } : undefined}
    >
      <Image
        src={url}
        alt="썸네일"
        fill
        draggable={false}
        className="object-cover rounded-lg"
      />
    </div>
  );
}
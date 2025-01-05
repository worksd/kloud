import Image from "next/image";

export const Thumbnail = ({width, url} : {width: number, url: string} ) => {
  const height = Math.round((width * 222) / 167);
  return <div style={{width: `${width}px`, height: `${height}px`, position: 'relative'}}>
    <Image
      src={url}
      alt="dd"
      fill
      draggable={false}
      style={{
        objectFit: 'cover',
        borderRadius: '8px',
      }}
    />
  </div>
}
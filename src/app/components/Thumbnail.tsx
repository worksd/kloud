import Image from "next/image";

export const Thumbnail = ({width} : {width: number} ) => {
  const height = Math.round((width * 222) / 167);
  return <div style={{width: `${width}px`, height: `${height}px`, position: 'relative'}}>
    <Image
      src="https://picsum.photos/250/250"
      alt="dd"
      fill
      draggable={false}
      style={{
        objectFit: 'cover',
        borderRadius: '4px',
      }}
    />
  </div>
}
import { FC } from "react";

interface CircleImageProps {
  size: number;
  imageUrl?: string;
  alt?: string;
  className?: string;
}

export const CircleImage: FC<CircleImageProps> = ({
                                                    size,
                                                    imageUrl,
                                                    alt = 'Circle image',
                                                    className
                                                  }) => {
  if (!imageUrl) return
  return (
    <div
      className={
        "rounded-full overflow-hidden flex-shrink-0" +
        className
      }
      style={{width: `${size}px`, height: `${size}px`}}
    >
      <img
        src={imageUrl}
        alt={alt}
        className="w-full h-full object-cover"
      />
    </div>
  );
};
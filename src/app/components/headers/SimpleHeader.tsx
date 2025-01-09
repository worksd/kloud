'use client';
import ArrowLeftIcon from "../../../../public/assets/left-arrow.svg";

export const SimpleHeader = ({ title }: {title: string}) => {
  return <div className="fixed top-0 left-0 right-0 bg-white z-10  ">
    <div className="flex h-14 justify-center items-center">
      <div className="absolute left-4">
        <button className="flex items-center justify-center text-black rounded-full" onClick={() => window.KloudEvent.back()}>
          <ArrowLeftIcon className="w-6 h-6"/>
        </button>
      </div>
      {title && <span className="text-[16px] font-bold text-black">{title}</span>}
    </div>
  </div>
}
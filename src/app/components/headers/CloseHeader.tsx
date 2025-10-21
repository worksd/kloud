'use client';
import CloseIcon from "../../../../public/assets/ic_close.svg";
import { kloudNav } from "@/app/lib/kloudNav";

export const CloseHeader = ({ title }: {title: string}) => {
  return <div className="fixed top-0 left-0 right-0 bg-white z-10  ">
    <div className="flex h-14 justify-center items-center">
      {title && <span className="text-[16px] font-bold text-black">{title}</span>}
      <div className="absolute right-4">
        <button className="flex items-center justify-center text-black rounded-full"
                onClick={() => kloudNav.back()}>
          <CloseIcon className="w-6 h-6"/>
        </button>
      </div>
    </div>
  </div>
}
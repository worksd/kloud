'use client';
import ArrowLeftIcon from "../../../../public/assets/left-arrow.svg";

interface IProps {
  title?: string;
}

export const SimpleHeader = ({ title }: IProps) => {

  const handleBack = () => {
    if (window.KloudEvent) {
      window.KloudEvent.back()
    }
  }
  return <div className="fixed top-0 left-0 right-0 bg-white z-10">
    <div className="flex h-14 justify-center items-center">
      <div className="absolute left-4">
        <button className="flex items-center justify-center text-black rounded-full" onClick={handleBack}>
          <ArrowLeftIcon className="w-6 h-6"/>
        </button>
      </div>
      {title && <span className="text-[16px] font-bold text-black">{title}</span>}
    </div>
  </div>

}
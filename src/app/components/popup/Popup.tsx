import { useState } from 'react';
import Image from 'next/image';
import Dim from "@/app/components/Dim";

export enum PopupType {
  Event = 'event'
}

interface PopupProps {
  popupType: PopupType;
  title?: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
}

const Popup = ({ popupType, title, message, buttonText, onClose }: PopupProps) => {
  const [isClosed, setIsClosed] = useState(false);
  const handleClickClose = () => {
    onClose();
    setIsClosed(true);
  };

  if (isClosed) {
    return null;
  }

  const popupBackground = 'bg-blue-950'


  const popupIcon = null;

  return (
    <Dim>
      <section
        className={`${popupBackground} w-80 h-44 p-4 flex flex-col justify-between items-center absolute border border-solid border-white left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white`}
      >
        <header className={'flex justify-center items-center text-xl'}>
          <h1 className={'mr-2'}>{`${title ? title : '알림'}`}</h1>
          {popupIcon}
        </header>
        <main className={'flex flex-col justify-center items-center'}>
          {message.split('\n').map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </main>
        <footer className={'flex justify-center items-center'}>
          <button className={'bg-white text-black py-1 px-4'} onClick={handleClickClose}>
            {buttonText || '닫기'}
          </button>
        </footer>
      </section>
    </Dim>
  );
};

export default Popup;
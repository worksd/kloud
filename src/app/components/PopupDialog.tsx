import { useState } from 'react';
import Image from 'next/image';
import Dim from "@/app/components/Dim";

export enum PopupType {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
}

interface PopupProps {
  popupType: PopupType;
  title?: string;
  message: string;
  buttonText?: string;
  onClose?: () => void;
}

const PopupDialog = ({ popupType, title, message, buttonText, onClose }: PopupProps) => {
  const [isClosed, setIsClosed] = useState(false);
  const handleClickClose = () => {
    if (onClose) {
      onClose();
    }
    setIsClosed(true);
  };

  if (isClosed) {
    return null;
  }

  const popupBackground =
    popupType === PopupType.INFO
      ? 'bg-blue-950'
      : popupType === PopupType.WARNING
        ? 'bg-yellow-700'
        : popupType === PopupType.ERROR
          ? 'bg-red-950'
          : 'bg-gray-800';

  // const popupIcon =
  //   popupType === PopupType.INFO ? (
  //     <Image src={'/images/info.png'} alt={'정보'} width={64} height={64} className={'w-6'} />
  //   ) : popupType === PopupType.WARNING ? (
  //     <Image src={'/images/warning.png'} alt={'경고'} width={64} height={64} className={'w-4'} />
  //   ) : popupType === PopupType.ERROR ? (
  //     <Image src={'/images/error.png'} alt={'오류'} width={64} height={64} className={'w-4'} />
  //   ) : null;

  return (
    <Dim>
      <section
        className={`${popupBackground} w-80 h-44 p-4 flex flex-col justify-between items-center absolute border border-solid border-white left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white`}
      >
        <header className={'flex justify-center items-center text-xl'}>
          <h1 className={'mr-2'}>{`${title ? title : '알림'}`}</h1>
          {/*{popupIcon}*/}
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

export default PopupDialog;
import Image from "next/image";

interface IProps {
    imgPath: string;
    text: string;
}

const StudioContact = ({ imgPath, text }: IProps) => (
    <div className="grow shrink basis-0 h-[89px] bg-[#f7f8f9] rounded-2xl flex-col justify-center items-center gap-2 inline-flex">
        <Image src={imgPath} alt="contact by email" className="w-8 h-8 relative" />
        <div className="self-stretch text-center text-[#505356] text-xs font-medium leading-none">{text}</div>
    </div>
);

export default StudioContact;

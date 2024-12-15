import Image from "next/image";

interface IProps {
    iconPath: string;
    text: string;
    subText: string;
}

const LessonInfoLabel = ({ iconPath, text, subText }: IProps) => (
    <div className="self-stretch py-0.5 justify-start items-center gap-2 inline-flex">
        <Image src={iconPath} alt="lesson info icon" width={16} height={16} />

        <div className="justify-center items-center gap-0.5 flex">
            <div className="text-center text-black text-sm font-medium leading-tight">{text}</div>
            <div className="text-center text-[#86898c] text-xs font-medium leading-none">/{subText}</div>
        </div>
    </div>
);

export default LessonInfoLabel;

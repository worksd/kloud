import { FC, SVGProps } from "react";

interface IProps {
    Icon: FC<SVGProps<SVGElement>>;
    text: string;
    subText: string;
}

const LessonInfoLabel = ({ Icon, text, subText }: IProps) => {
    return (
    <div className="self-stretch py-0.5 justify-start items-center gap-2 inline-flex">
        <Icon width={16} />

        <div className="justify-center items-center gap-0.5 flex">
            <div className="text-center text-black text-[14px] font-medium leading-tight">{text}</div>
            <div className="text-center text-[#86898c] text-[12px] font-medium leading-none">/{subText}</div>
        </div>
    </div>
);}

export default LessonInfoLabel;

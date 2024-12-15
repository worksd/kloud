import Image from "next/image";
import Link from "next/link";
import { ComponentProps } from "react";

interface IProps extends ComponentProps<"div"> {
    link: string;
    logoPath: string;
    alt: string;
}

const SnsButton = (props: IProps) => {
    return <div {...props} className="w-10 h-10 px-2.5 py-[3px] rounded-full border border-[#f7f8f9] flex-col justify-center items-center gap-2.5 inline-flex">
        <Link href={props.link}>
            <Image src={props.logoPath} alt={props.alt}/>
        </Link>
</div>
}

export default SnsButton;
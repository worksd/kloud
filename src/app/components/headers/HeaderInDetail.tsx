"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import LeftArrow from "../../../../public/assets/left-arrow.svg";
import ShareArrow from "../../../../public/assets/share-arrow.svg";
import { HeaderBlurButton } from "../buttons";

interface IProps {
    title?: string;
    shareData?: any;
}

const HeaderInDetail = ({ title, shareData }: IProps) => {
    const headerRef = useRef<HTMLDivElement | null>(null);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const headerElement = headerRef.current;
        if (!headerElement) return;

        const parentElement = headerElement.parentElement;
        if (!parentElement) return;

        const handleScroll = () => {
            setIsScrolled(parentElement.scrollTop > 0);
        };

        parentElement.addEventListener("scroll", handleScroll);

        return () => {
            parentElement.removeEventListener("scroll", handleScroll);
        };
    }, []);

    // 버튼 이벤트들
    const router = useRouter();
    const onClickBack = () => {
        if (window.KloudEvent) {
            window.KloudEvent.back();
        } else {
            router.back();
        }
    };

    const onClickShare = () => {};

    return (
        <div
            ref={headerRef}
            className={`w-full h-14 px-6 justify-between items-center inline-flex fixed top-0 left-0 z-10 transition-colors ${
                isScrolled ? "bg-white" : "bg-transparent"
            }`}
        >
            <HeaderBlurButton isBlur={isScrolled} originProps={{ onClick: onClickBack }}>
                <LeftArrow alt="back icon" />
            </HeaderBlurButton>

            <div
                className={`px-5 box-border truncate text-center text-black text-base font-bold font-['Pretendard'] leading-snug transition ${
                    isScrolled ? "opacity-100" : "opacity-0"
                }`}
            >
                {title}
            </div>

            <HeaderBlurButton isBlur={isScrolled} originProps={{ onClick: onClickShare }}>
                <div className="w-6 h-6 pl-[2.50px] pr-[2.52px] py-[2.10px] justify-center items-center flex">
                    <ShareArrow alt="share icon" />
                </div>
            </HeaderBlurButton>
        </div>
    );
};

export default HeaderInDetail;

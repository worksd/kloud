"use client";

import { ComponentProps } from "react";

interface IProps {
    children: React.ReactNode;
    isBlur?: boolean;
    originProps?: ComponentProps<"button">;
}

const HeaderBlurButton = ({ children, isBlur = false, originProps }: IProps) => (
    <button
        className={`w-8 h-8 transition-colors rounded-full justify-center items-center flex flex-none ${
            isBlur ? "" : "bg-white/50 backdrop-blur-[20px]"
        }`}
        {...originProps}
    >
        {children}
    </button>
);

export default HeaderBlurButton;

"use client";

import { ComponentProps } from "react";

interface IProps {
    children: React.ReactNode;
    originProps?: ComponentProps<"button">;
}

const HeaderBlurButton = ({ children, originProps }: IProps) => (
    <button className="w-8 h-8 bg-white/50 rounded-full backdrop-blur-[20px] justify-center items-center flex" {...originProps} onClick={() => console.log("asdas") }>
        {children}
    </button>
);

export default HeaderBlurButton;

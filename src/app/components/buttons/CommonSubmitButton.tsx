"use client";

import { ComponentProps, useMemo } from "react";

interface IProps {
    children: React.ReactNode;
    disabled?: boolean;
    originProps?: ComponentProps<"button">;
}

const CommonSubmitButton = ({ children, disabled, originProps }: IProps) => {
    const isDisable = useMemo(() => disabled || originProps?.disabled, [disabled, originProps?.disabled]);

    return (
    <button className={`left flex justify-center items-center w-full h-14 rounded-lg ${isDisable ? "bg-[#bcbfc2]" : "bg-black"}`} {...originProps}>
        {children}
    </button>
)};

export default CommonSubmitButton;

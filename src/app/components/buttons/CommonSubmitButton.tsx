import { ComponentProps } from "react";

interface IProps {
    children: React.ReactNode;
    originProps?: ComponentProps<"button">;
}

const CommonSubmitButton = ({ children, originProps }: IProps) => (
    <button className="left flex justify-center items-center w-full h-14 rounded-lg bg-black" {...originProps}>
        {children}
    </button>
);

export default CommonSubmitButton;

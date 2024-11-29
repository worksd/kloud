"use client";

import Image from "next/image";
import React, { useState } from "react";
import Chevron from "../../../public/assets/chevron.svg";

interface DropdownDetailsProps {
    title: string; // 제목
    children: React.ReactNode; // 펼쳐질 내용을 외부에서 전달
}

const DropdownDetails = ({ title, children }: DropdownDetailsProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleDropdown = () => setIsExpanded(!isExpanded);

    return (
        <div className="flex flex-col gap-y-4">
            <div onClick={toggleDropdown} className="flex justify-between">
                <p className="text-black text-sm font-semibold font-['Pretendard']">{title}</p>
                
                <div className={`w-6 h-6 ${isExpanded ? "" : "rotate-180"}`}>
                    <Image src={Chevron} alt="펼치기 화살표" />
                </div>
            </div>

            {isExpanded && children}
        </div>

    );
};

export default DropdownDetails;

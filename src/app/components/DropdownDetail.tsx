"use client";

import Image from "next/image";
import React, { useState } from "react";
import ArrowUpIcon from "../../../public/assets/arrow-up.svg"
import ArrowDownIcon from "../../../public/assets/arrow-down.svg"

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

                {isExpanded && (
                  <ArrowUpIcon/>
                )}

                {!isExpanded && (
                  <ArrowDownIcon/>
                )}
            </div>

            {isExpanded && children}
        </div>

    );
};

export default DropdownDetails;

'use client'

import { useState, ReactNode } from "react";

type Tab = 'benefits' | 'usage';

export const PassDetailTabs = ({
  benefitsContent,
  usageContent,
}: {
  benefitsContent: ReactNode,
  usageContent: ReactNode,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('benefits');

  return (
    <div className="flex flex-col flex-1 bg-white rounded-t-3xl -mt-3 relative z-10 shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">
      {/* Tab bar */}
      <div className="flex px-6 pt-1">
        <button
          onClick={() => setActiveTab('benefits')}
          className={`py-3.5 mr-5 text-[15px] font-bold border-b-[2px] transition-colors ${
            activeTab === 'benefits'
              ? 'text-black border-black'
              : 'text-[#C5C5C5] border-transparent'
          }`}
        >
          혜택
        </button>
        <button
          onClick={() => setActiveTab('usage')}
          className={`py-3.5 text-[15px] font-bold border-b-[2px] transition-colors ${
            activeTab === 'usage'
              ? 'text-black border-black'
              : 'text-[#C5C5C5] border-transparent'
          }`}
        >
          사용 정보
        </button>
      </div>
      <div className="h-px bg-[#F0F0F0]" />

      {/* Tab content */}
      <div className={activeTab === 'benefits' ? '' : 'hidden'}>
        {benefitsContent}
      </div>
      <div className={activeTab === 'usage' ? '' : 'hidden'}>
        {usageContent}
      </div>
    </div>
  );
};

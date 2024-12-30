// components/TopToolbar.tsx
import React from "react";

interface TopToolbarProps {
  onClick?: () => void;
  title?: string;
}

const TopToolbar: React.FC<TopToolbarProps> = ({ onClick, title }) => {
  return (
    <div className="w-full h-12 flex items-center justify-between px-4 bg-white border-b">
      <button
        onClick={onClick}
        className="text-xl font-bold text-black"
        aria-label="뒤로가기"
      >
        ←
      </button>
      <h1 className="flex-1 text-center text-xl font-bold text-black">
        {title}
      </h1>
      {/* Placeholder for alignment */}
      <div className="w-6"></div>
    </div>
  );
};

export default TopToolbar;
'use client'

type RecentLoginTooltipProps = {
  text: string;
  variant?: 'dark' | 'light';
}

export const RecentLoginTooltip = ({ text, variant = 'dark' }: RecentLoginTooltipProps) => {
  const isDark = variant === 'dark';

  return (
    <div className="absolute right-3 flex items-center">
      <div className={`w-2 h-2 rotate-45 -mr-1 ${isDark ? 'bg-black' : 'bg-white'}`} />
      <div className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg ${
        isDark ? 'bg-black text-white' : 'bg-white text-black'
      }`}>
        {text}
      </div>
    </div>
  );
};

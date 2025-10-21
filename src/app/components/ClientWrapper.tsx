// app/login/SwitchLink.tsx (client, optional)
'use client';

export const LargeClientKloudButton = ({title}: {title: string}) => {
  return (
    <div className="relative w-screen px-4">
      <div
        className="
          flex items-center justify-center
          w-full rounded-[16px] bg-black text-white text-[16px] font-medium shadow-lg
          py-4 select-none transition-transform duration-150 active:scale-[0.98]
        "
      >
        {title}
      </div>
    </div>
  )
}
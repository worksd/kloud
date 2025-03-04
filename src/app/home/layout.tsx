import Logo from "../../../public/assets/logo_black.svg";
import { ReactNode } from "react";

export default async function HomeLayout({
                                           children,
                                           popularStudios,
                                           popularLessons,
                                           my
                                         }: Readonly<{
  children: ReactNode;
  my: ReactNode;
  popularStudios: ReactNode;
  popularLessons: ReactNode;
}>) {
  return (
    <div className="flex flex-col h-screen no-scrollbar">
      <div className="px-4 py-2 flex-shrink-0">
        <Logo className="scale-[0.7] origin-left"/>
      </div>
      <div className="flex-1 overflow-y-auto">
        {popularLessons}
        {my}
        {popularStudios}
        {children}
      </div>
    </div>
  );
}
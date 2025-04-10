import { ReactNode } from "react";

export default async function HomeLayout({
                                           children,
                                           popularStudios,
                                           popularLessons,
                                           band,

                                         }: Readonly<{
  children: ReactNode;
  popularStudios: ReactNode;
  band: ReactNode;
  popularLessons: ReactNode;
}>) {
  return (
    <div className="flex flex-col h-screen no-scrollbar">
      <div className="flex-1 overflow-y-auto">
        {popularLessons}
        {popularStudios}
        {band}
        {children}
      </div>
    </div>
  );
}
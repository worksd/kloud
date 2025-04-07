import { ReactNode } from "react";

export default async function HomeLayout({
                                           children,
                                           popularStudios,
                                           popularLessons,

                                         }: Readonly<{
  children: ReactNode;
  popularStudios: ReactNode;
  popularLessons: ReactNode;
}>) {
  return (
    <div className="flex flex-col h-screen no-scrollbar">
      <div className="flex-1 overflow-y-auto">
        {popularLessons}
        {popularStudios}
        {children}
      </div>
    </div>
  );
}
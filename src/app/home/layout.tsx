import Logo from "../../../public/assets/logo_black.svg";

export default async function HomeLayout({
                                           children,
                                         }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-screen">
      <div className="px-4 py-2 flex-shrink-0">
        <Logo className="scale-[0.7] origin-left"/>
      </div>
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
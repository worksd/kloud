import Logo from "../../../public/assets/logo_black.svg";

export default async function HomeLayout({
                                           children,

                                         }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <div className="p-4 w-[105px]">
        <Logo className="scale-[0.7] origin-left"/>
      </div>
      {children}
    </div>
  );

}
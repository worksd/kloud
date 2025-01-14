import Logo from "../../../public/assets/logo_black.svg";

export default function HomeLayout({
                                     children,
                                     notifications,
                                     upcoming
                                   }: Readonly<{
  children: React.ReactNode;
  notifications: React.ReactNode;
  upcoming: React.ReactNode;
}>) {
  return (
    <div>
      <div className="p-4 w-[105px]">
        <Logo className="scale-[0.7] origin-left"/>
      </div>
      <div className="fixed top-0 left-0 right-0 z-50">
        {children}
      </div>
      {notifications}
      {upcoming}
    </div>
  );
}
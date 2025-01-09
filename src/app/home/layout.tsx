import Logo from "../../../public/assets/logo_black.svg";

export default function HomeLayout({
                                     notifications,
                                     upcoming
                                   }: Readonly<{
  notifications: React.ReactNode;
  upcoming: React.ReactNode;
}>) {
  return (
    <div>
      <div className="p-4 w-[105px]">
        <Logo className="scale-[0.7] origin-left"/>
      </div>
      {notifications}
      {upcoming}
    </div>
  );
}
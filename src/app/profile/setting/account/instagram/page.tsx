import { getLocale } from "@/utils/translate";
import { getUserAction } from "@/app/onboarding/action/get.user.action";
import { InstagramConnectForm } from "@/app/profile/setting/account/instagram/InstagramConnectForm";

export default async function InstagramConnectPage() {
  const user = await getUserAction();
  if (!user || !('id' in user)) {
    return <div className={'text-black p-6'}>{user?.message}</div>;
  }

  return (
    <div className={'flex flex-col min-h-screen bg-white'}>
      <InstagramConnectForm
        locale={await getLocale()}
        name={user.name ?? user.nickName ?? ''}
        phone={user.phone}
        email={user.email}
      />
    </div>
  );
}

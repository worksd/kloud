import RightArrowIcon from "../../../public/assets/right-arrow.svg"
import { StringResource, StringResourceKey } from "@/shared/StringResource";
import { translate } from "@/utils/translate";

export const MenuItem = async ({label}: { label: StringResourceKey}) => {


  // const handleClick = async () => {
  //   if (path === "/logout") {
  //     const dialogInfo = {
  //       id: 'Logout',
  //       type: 'YESORNO',
  //       title: t('log_out'),
  //       message: t('log_out_dialog_message'),
  //       route: KloudScreen.Login,
  //     }
  //     window.KloudEvent?.showDialog(JSON.stringify(dialogInfo));
  //
  //   } else if (path === '/deactivate') {
  //     window.KloudEvent?.push(KloudScreen.SignOut)
  //   } else if (path === '/profileEdit' || path == '/notification') {
  //     // TODO: 구현
  //     const dialogInfo = {
  //       id: 'ProfileEdit',
  //       type: 'SIMPLE',
  //       title: t('rawgraphy'),
  //       message: t('under_development_message'),
  //     }
  //     window.KloudEvent?.showDialog(JSON.stringify(dialogInfo));
  //   } else {
  //     window.KloudEvent?.push(path);
  //   }
  // }
  //
  // useEffect(() => {
  //   window.onDialogConfirm = async (data: DialogInfo) => {
  //     if (data.route && data.id == 'Logout') {
  //       await unregisterDeviceAction()
  //       await clearCookies();
  //       localStorage.clear();
  //       sessionStorage.clear();
  //       window.KloudEvent?.clearToken()
  //       window.KloudEvent?.showToast(t('log_out_success_message'))
  //       window.KloudEvent.clearAndPush(data.route)
  //     }
  //   }
  // }, [])

  return (
    <div
      className="flex justify-between items-center bg-white px-4 py-4 cursor-pointer border-gray-200 active:scale-[0.98] active:bg-gray-100 transition-all duration-150"
    >
      <div className="text-gray-800">{await translate(label)}</div>
      <RightArrowIcon/>
    </div>
  );
};

export type DialogInfo = {
  id: string;
  route: string;
}
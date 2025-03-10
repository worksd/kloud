import { getLocale, translate } from "@/utils/translate";
import { ChangeLocaleSheetItem } from "@/app/setting/account/language/sheet/change.locale.sheet.item";
import CloseIcon from "../../../../../../public/assets/ic_close_black.svg";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";

export default async function SettingLanguageSheet() {
  const selectedLanguage = await getLocale()

  return (
    <div className="text-black p-4">
      <div className={"w-full flex flex-row justify-between"}>
        <h2 className="text-lg font-bold mb-2">{await translate('select_language')}</h2>
        <NavigateClickWrapper method={'closeBottomSheet'}>
          <CloseIcon/>
        </NavigateClickWrapper>
      </div>
      <ul className="space-y-2">
        <ChangeLocaleSheetItem selectedLanguage={selectedLanguage} currentLocale={'ko'}/>
        <ChangeLocaleSheetItem selectedLanguage={selectedLanguage} currentLocale={'en'}/>
        <ChangeLocaleSheetItem selectedLanguage={selectedLanguage} currentLocale={'jp'}/>
      </ul>
    </div>
  );
}

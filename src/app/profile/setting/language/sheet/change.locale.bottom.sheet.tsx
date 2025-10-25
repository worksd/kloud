import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import CloseIcon from "../../../../../../public/assets/ic_close_black.svg";
import { ChangeLocaleSheetItem } from "@/app/profile/setting/language/sheet/change.locale.sheet.item";
import { Locale } from "@/shared/StringResource";

export const ChangeLocalBottomSheet = ({selectedLanguage, selectLanguageText, onCloseAction}: {
  selectedLanguage: Locale,
  selectLanguageText: string,
  onCloseAction: () => void,
}) => {
  return (
    <div className="text-black p-4">
      <div className={"w-full flex flex-row justify-between"}>
        <h2 className="text-lg font-bold mb-2">{selectLanguageText}</h2>
        <div onClick={onCloseAction}>
          <CloseIcon/>
        </div>
      </div>
      <ul className="space-y-2">
        <ChangeLocaleSheetItem selectedLanguage={selectedLanguage} locale={'ko'}/>
        <ChangeLocaleSheetItem selectedLanguage={selectedLanguage} locale={'en'}/>
        <ChangeLocaleSheetItem selectedLanguage={selectedLanguage} locale={'jp'}/>
        <ChangeLocaleSheetItem selectedLanguage={selectedLanguage} locale={'zh'}/>
      </ul>
    </div>
  )
}
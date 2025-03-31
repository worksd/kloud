import { KloudScreen } from "@/shared/kloud.screen";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { CommonSubmitButton } from "@/app/components/buttons";
import { translate } from "@/utils/translate";
import { StringResourceKey } from "@/shared/StringResource";

export const PassPlanPurchaseSubmitButton = async ({studioId}: { studioId: number }) => {
  const buttonTitleResource: StringResourceKey = 'purchase_pass';

  return (
    <NavigateClickWrapper
      method="push"
      route={KloudScreen.PurchasePass(studioId)}
    >
      <CommonSubmitButton
        disabled={false}
      >
        {await translate(buttonTitleResource)}
      </CommonSubmitButton>
    </NavigateClickWrapper>
  );
}
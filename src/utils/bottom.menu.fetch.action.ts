'use server'

import { translate } from "@/utils/translate";
import { BOTTOM_MENU_DEFS, BottomMenuItem, parseBottomMenuKeys } from "@/shared/bottom.menu";

export async function getBottomMenuList(): Promise<BottomMenuItem[]> {
  const keys = parseBottomMenuKeys(process.env.NEXT_PUBLIC_BOTTOM_MENU_LIST);

  return Promise.all(
    keys.map(async (key) => {
      const { labelKey, ...rest } = BOTTOM_MENU_DEFS[key];
      return { label: await translate(labelKey), ...rest };
    })
  );
}

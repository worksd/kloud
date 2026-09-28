'use server'

import { translate } from "@/utils/translate";
import { BOTTOM_MENU_DEFS, BottomMenuItem, DEFAULT_ADMIN_BOTTOM_MENU_KEYS, parseBottomMenuKeys } from "@/shared/bottom.menu";

/** admin=true면 관리자(Partner/Operator) 탭 구성(NEXT_PUBLIC_ADMIN_BOTTOM_MENU_LIST) */
export async function getBottomMenuList(admin = false): Promise<BottomMenuItem[]> {
  const keys = admin
    ? parseBottomMenuKeys(process.env.NEXT_PUBLIC_ADMIN_BOTTOM_MENU_LIST, DEFAULT_ADMIN_BOTTOM_MENU_KEYS)
    : parseBottomMenuKeys(process.env.NEXT_PUBLIC_BOTTOM_MENU_LIST);

  return Promise.all(
    keys.map(async (key) => {
      const { labelKey, ...rest } = BOTTOM_MENU_DEFS[key];
      return { label: await translate(labelKey), ...rest };
    })
  );
}

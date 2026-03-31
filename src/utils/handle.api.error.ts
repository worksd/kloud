'use server'

import { clearCookies } from "@/app/profile/clear.token.action";
import { sendErrorToDiscord } from "@/utils/discord.webhook";

export async function handleApiError(res: unknown, route: string): Promise<'TOKEN_EXPIRED' | never> {
  const errorRes = res as { code?: string; message?: string };
  if (errorRes.code === 'TOKEN_EXPIRED') {
    await clearCookies();
    return 'TOKEN_EXPIRED';
  }
  const message = `${route} 실패: ${JSON.stringify(res)}`;
  await sendErrorToDiscord(new Error(message), { pathname: route, route });
  throw Error(message);
}

// SNS 계정 연결 — 계정 관리 > SNS 계정 연결하기 진입 페이지.
// phone/email 로그인 유저가 소셜 계정을 추가 연결하는 화면.
// OAuth 토큰 획득까지는 로그인과 동일한 네이티브 브릿지 사용, 연결 API는 BE 개발중 (SnsConnectForm TODO).

import React from "react";
import { headers } from "next/headers";
import { translate } from "@/utils/translate";
import { getUserAction } from "@/app/onboarding/action/get.user.action";
import { getMySocialLinksAction } from "@/app/profile/setting/account/sns/sns.actions";
import { SnsConnectForm } from "@/app/profile/setting/account/sns/SnsConnectForm";

export default async function SnsConnectPage({ searchParams }: {
  searchParams: Promise<{ os?: string; appVersion?: string }>
}) {
  const { os: osParam, appVersion: versionParam } = await searchParams;
  const headerList = await headers();
  // 앱 웹뷰는 쿼리로 os/appVersion을 주지만, 없으면 proxy가 UA에서 뽑은 헤더로 fallback
  const os = osParam ?? headerList.get('x-guinness-client') ?? '';
  const appVersion = versionParam ?? headerList.get('x-guinness-version') ?? '';

  const user = await getUserAction();
  if (!user || !('id' in user)) {
    return <div className={'text-black p-6'}>{user?.message}</div>;
  }

  const connectedProviders = await getMySocialLinksAction();

  return (
    <div className={'flex flex-col min-h-screen bg-white'}>
      <SnsConnectForm
        os={os}
        appVersion={appVersion}
        connectedProviders={connectedProviders}
        translations={{
          description: await translate('sns_account_connect_description'),
          connectWithApple: await translate('connect_with_apple'),
          connectWithGoogle: await translate('connect_with_google'),
          connectWithKakao: await translate('connect_with_kakao'),
          connected: await translate('sns_connected'),
          linkSuccess: await translate('sns_link_success'),
          transferWarnTitle: await translate('sns_transfer_warning_title'),
          transferWarnMessage: await translate('sns_transfer_warning_message'),
          transferWarnBullet1: await translate('sns_transfer_warning_bullet1'),
          transferWarnBullet2: await translate('sns_transfer_warning_bullet2'),
          transferWarnConfirm: await translate('sns_transfer_warning_confirm'),
          joinedSuffix: await translate('sns_transfer_joined_suffix'),
          hourUnit: await translate('sns_transfer_hour_unit'),
          minuteUnit: await translate('sns_transfer_minute_unit'),
          cancel: await translate('cancel'),
        }}
      />
    </div>
  );
}

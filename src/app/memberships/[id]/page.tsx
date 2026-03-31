import {getMembershipAction} from "@/app/memberships/[id]/get.membership.action";
import {getLocale, translate} from "@/utils/translate";
import {MembershipTicketForm} from "./MembershipTicketForm";
import {api} from "@/app/api.client";
import {NavigateClickWrapper} from "@/utils/NavigateClickWrapper";
import {KloudScreen} from "@/shared/kloud.screen";
import {handleApiError} from "@/utils/handle.api.error";
import {TokenExpiredRedirect} from "@/app/components/TokenExpiredRedirect";

export default async function MembershipDetailPage({params}: {
  params: Promise<{ id: number }>
}) {
  const membership = await getMembershipAction({id: (await params).id});
  if ('id' in membership) {
    const locale = await getLocale();
    const userResponse = await api.user.me({});

    if (!('id' in userResponse)) {
      const result = await handleApiError(userResponse, 'GET /users/me');
      if (result === 'TOKEN_EXPIRED') return <TokenExpiredRedirect />;
      return null;
    }

    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const membershipId = `SM-${membership.id}-${dateStr}-${randomStr}`;

    const qrCodeUrl = `/profile/membership/${membership.id}`;

    return (
        <div className="fixed inset-0 w-screen h-screen overflow-hidden">
          <div className="relative z-10 flex flex-col items-center justify-center pt-4">
            <MembershipTicketForm
                membership={membership}
                user={userResponse}
                membershipId={membershipId}
                qrCodeUrl={qrCodeUrl}
                locale={locale}
            />
          </div>
        </div>
    )
  } else {
    const result = await handleApiError(membership, `GET /memberships/${(await params).id}`);
    if (result === 'TOKEN_EXPIRED') return <TokenExpiredRedirect />;
    return null;
  }
}

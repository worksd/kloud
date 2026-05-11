import Image from "next/image";
import { QrCode } from "lucide-react";
import { getLessonTicketsAction } from "@/app/lessons/[id]/action/get.lesson.tickets.action";
import { getLessonSettleUpAction } from "@/app/lessons/[id]/action/get.lesson.settleup.action";
import { translate } from "@/utils/translate";
import { StringResourceKey } from "@/shared/StringResource";
import {
  SettleUpArtistResponse,
  SettleUpSection,
} from "@/app/endpoint/lesson.endpoint";
import { TicketResponse } from "@/app/endpoint/ticket.endpoint";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { KloudScreen } from "@/shared/kloud.screen";

const formatPhone = (phone: string) => {
  if (phone.length === 11) return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`;
  if (phone.length === 10) return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;
  return phone;
};

const formatUserName = (
  nickName?: string, name?: string, phone?: string, email?: string,
) => {
  if (nickName && name) return `${nickName}(${name})`;
  if (name) return name;
  if (nickName) return nickName;
  if (phone) return formatPhone(phone);
  if (email) return email;
  return '사용자';
};

const ticketStatusKey = (status?: string): StringResourceKey | null => {
  if (status === 'Used') return 'ticket_status_used';
  if (status === 'Pending') return 'ticket_status_pending';
  if (status === 'Ready') return 'ticket_status_ready';
  return null;
};

const statusStyle = (status?: string) => {
  if (status === 'Used') return 'bg-[#F3F4F6] text-[#6B7280]';
  if (status === 'Pending') return 'bg-[#FFF4E5] text-[#A05A00]';
  return 'bg-[#E8F5E9] text-[#2E7D32]';
};

export async function LessonAdminInfoSection({ lessonId }: { lessonId: number }) {
  const [tickets, settleUp] = await Promise.all([
    getLessonTicketsAction(lessonId),
    getLessonSettleUpAction({ lessonId }),
  ]);

  return (
    <div className={'w-full flex flex-col'}>
      <div className={'w-full h-3 bg-[#f7f8f9]'}/>

      <StudentsBlock tickets={tickets} lessonId={lessonId}/>

      {settleUp && (
        <>
          <div className={'w-full h-3 bg-[#f7f8f9]'}/>
          <ArtistsBlock artists={settleUp.artists}/>
          <SectionBlock section={settleUp.sales}/>
          <SectionBlock section={settleUp.settleUp}/>
        </>
      )}
    </div>
  );
}

async function StudentsBlock({ tickets, lessonId }: { tickets: TicketResponse[]; lessonId: number }) {
  const visible = tickets.filter(
    (t) => t.status !== 'Cancelled' && t.status !== 'CancelPending',
  );

  const title = await translate('lesson_admin_students_title');
  const countText = (await translate('lesson_admin_students_count')).replace(
    '{count}',
    String(visible.length),
  );
  const emptyText = await translate('lesson_admin_no_students');

  const qrLabel = await translate('lesson_admin_qr_attendance');

  return (
    <section className={'bg-white px-6 py-5'}>
      <header className={'flex items-center justify-between gap-2'}>
        <div className={'flex items-baseline gap-2'}>
          <h2 className={'text-[16px] font-bold text-black'}>{title}</h2>
          <span className={'text-[#919191] text-[13px]'}>{countText}</span>
        </div>

        <NavigateClickWrapper method={'push'} route={KloudScreen.QRScanWithLesson(lessonId)}>
          <button
            type={'button'}
            className={'flex items-center gap-1.5 rounded-full bg-black text-white text-[12px] font-semibold px-3 py-1.5 active:scale-[0.97] transition-transform'}
          >
            <QrCode size={14}/>
            {qrLabel}
          </button>
        </NavigateClickWrapper>
      </header>

      {visible.length === 0 ? (
        <div className={'mt-4 py-6 text-center text-[13px] text-[#919191]'}>
          {emptyText}
        </div>
      ) : (
        <ul className={'mt-3 flex flex-col divide-y divide-[#F1F3F6]'}>
          {await Promise.all(visible.map(async (ticket) => {
            const key = ticketStatusKey(ticket.status);
            const statusLabel = key ? await translate(key) : (ticket.status ?? '');
            return (
              <li key={ticket.id} className={'flex items-center gap-3 py-3'}>
                <Image
                  src={ticket.user?.profileImageUrl || '/assets/default_profile.png'}
                  alt={''}
                  width={36}
                  height={36}
                  className={'rounded-full object-cover w-9 h-9 flex-shrink-0'}
                />
                <div className={'flex-1 min-w-0'}>
                  <div className={'text-[14px] font-semibold text-black truncate'}>
                    {formatUserName(ticket.user?.nickName, ticket.user?.name, ticket.user?.phone, ticket.user?.email)}
                  </div>
                  {(ticket.rank || ticket.ticketTypeLabel) && (
                    <div className={'mt-0.5 text-[12px] text-[#919191] truncate'}>
                      {[ticket.rank, ticket.ticketTypeLabel].filter(Boolean).join(' · ')}
                    </div>
                  )}
                </div>
                <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${statusStyle(ticket.status)}`}>
                  {statusLabel}
                </span>
              </li>
            );
          }))}
        </ul>
      )}
    </section>
  );
}

async function ArtistsBlock({ artists }: { artists: SettleUpArtistResponse[] }) {
  if (!artists || artists.length === 0) return null;

  const heading = await translate('lesson_settle_up_artists');
  const settleLabel = await translate('lesson_settle_up_settle_amount');
  const totalLabel = await translate('lesson_settle_up_total_amount');

  return (
    <section className={'bg-white px-6 py-5'}>
      <h2 className={'text-[16px] font-bold text-black'}>{heading}</h2>
      <div className={'mt-3 flex flex-col gap-2.5'}>
        {artists.map((a) => (
          <div
            key={a.id}
            className={'flex items-center gap-3 rounded-[14px] bg-[#FAFAFA] border border-[#F1F3F6] p-3.5'}
          >
            <Image
              src={a.profileImageUrl || '/assets/default_profile.png'}
              alt={''}
              width={44}
              height={44}
              className={'rounded-full object-cover w-11 h-11 flex-shrink-0'}
            />
            <div className={'flex-1 min-w-0'}>
              <div className={'text-[14px] font-semibold text-black truncate'}>{a.nickName}</div>
              <div className={'mt-0.5 text-[11px] text-[#919191] truncate'}>{a.description}</div>
            </div>
            <div className={'flex flex-col items-end shrink-0'}>
              <span className={'text-[11px] text-[#919191]'}>{settleLabel}</span>
              <span className={'text-[15px] font-bold text-black leading-tight'}>{a.settleAmount.toLocaleString()}원</span>
              <span className={'mt-0.5 text-[11px] text-[#919191]'}>
                {totalLabel} {a.totalAmount.toLocaleString()}원
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionBlock({ section }: { section: SettleUpSection }) {
  if (!section || !section.items || section.items.length === 0) return null;

  return (
    <section className={'bg-white px-6 py-5 border-t border-[#F7F8F9]'}>
      <h2 className={'text-[16px] font-bold text-black'}>{section.title}</h2>
      <dl className={'mt-3 flex flex-col'}>
        {section.items.map((item, idx) => {
          const isTotal = item.type === 'Total';
          return (
            <div
              key={`${item.key}-${idx}`}
              className={[
                'flex items-center justify-between py-2.5',
                idx > 0 && !isTotal ? 'border-t border-[#F7F8F9]' : '',
                isTotal ? 'mt-2 border-t border-[#E5E7EB] pt-3.5' : '',
              ].filter(Boolean).join(' ')}
            >
              <dt className={isTotal ? 'text-[14px] font-bold text-black' : 'text-[13px] text-[#5C5C5C]'}>
                {item.key}
              </dt>
              <dd className={isTotal ? 'text-[16px] font-bold text-black' : 'text-[13px] text-black'}>
                {item.value}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}

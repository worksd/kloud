'use client';

import React, { useState } from 'react';
import { AnnouncementResponse } from '@/app/endpoint/announcement.endpoint';
import { AnnouncementCard } from '@/app/home/AnnouncementCard';
import { getAnnouncementsAction } from '@/app/announcements/get.announcements.action';
import { isGuinnessErrorCase } from '@/app/guinnessErrorCase';
import { kloudNav } from '@/app/lib/kloudNav';
import LeftArrow from '../../../public/assets/left-arrow.svg';

const PAGE_SIZE = 20;

export function AnnouncementListClient({
  initial,
  studioId,
}: {
  initial: AnnouncementResponse[];
  studioId: number;
}) {
  const [items, setItems] = useState<AnnouncementResponse[]>(initial);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(initial.length < PAGE_SIZE);

  const loadMore = async () => {
    if (loading || done) return;
    setLoading(true);
    try {
      const next = page + 1;
      const res = await getAnnouncementsAction({ studioId, page: next });
      if (isGuinnessErrorCase(res)) return;
      const fetched = res.announcements;
      setItems((prev) => [...prev, ...fetched]);
      setPage(next);
      if (fetched.length < PAGE_SIZE) setDone(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={'w-full min-h-screen bg-[#F7F8F9] flex flex-col'}>
      {/* 헤더 */}
      <header className={'sticky top-0 z-10 bg-white border-b border-[#F1F3F6]'}>
        <div className={'flex items-center h-12 px-2'}>
          <button
            type={'button'}
            onClick={() => kloudNav.back()}
            aria-label={'뒤로가기'}
            className={'w-10 h-10 inline-flex items-center justify-center rounded-full active:bg-[#F2F4F6]'}
          >
            <LeftArrow className={'h-5 w-5'}/>
          </button>
          <h1 className={'flex-1 text-center text-[16px] font-bold text-[#191F28] -ml-10'}>
            공지사항
          </h1>
        </div>
      </header>

      {items.length === 0 ? (
        <div className={'flex-1 flex items-center justify-center text-[14px] text-[#8B95A1]'}>
          공지사항이 없습니다
        </div>
      ) : (
        <ul className={'flex flex-col py-2'}>
          {items.map((a) => (
            <li key={a.id}>
              <AnnouncementCard announcement={a} />
            </li>
          ))}
          {!done && (
            <li className={'px-5 pb-6 pt-2'}>
              <button
                type={'button'}
                onClick={loadMore}
                disabled={loading}
                className={'w-full h-12 rounded-2xl bg-white border border-[#E5E8EB] text-[13px] font-semibold text-[#4E5968] active:bg-[#F2F4F6] disabled:opacity-60'}
              >
                {loading ? '불러오는 중…' : '더 불러오기'}
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

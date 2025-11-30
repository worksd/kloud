'use client';

import React, { useState } from 'react';
import Dim from '@/app/components/Dim';
import CloseIcon from '../../../../../public/assets/ic_close_black.svg';
import CircleCheckIcon from '../../../../../public/assets/ic_circle_check.svg';

type DepositRecord = {
  id: number;
  depositTime: string;
  amount: number;
  keyword: string;
  status: 'pending' | 'completed';
};

type PendingTransfer = {
  id: number;
  createdAt: string;
  amount: number;
  productName: string;
  depositorName: string;
  isSelected?: boolean;
};

type KioskAccountTransferDialogProps = {
  depositRecords: DepositRecord[];
  pendingTransfers: PendingTransfer[];
  onClose: () => void;
  onConfirm: (selectedTransferIds: number[]) => void;
};

export const KioskAccountTransferDialog = ({
  depositRecords,
  pendingTransfers,
  onClose,
  onConfirm,
}: KioskAccountTransferDialogProps) => {
  const [selectedTransferIds, setSelectedTransferIds] = useState<number[]>([]);

  const handleToggleTransfer = (id: number) => {
    setSelectedTransferIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((transferId) => transferId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleConfirm = () => {
    onConfirm(selectedTransferIds);
  };

  return (
    <Dim>
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-[800px] max-h-[90vh] bg-white rounded-[16px] flex flex-col overflow-hidden z-50 mx-4">
        {/* Header */}
        <div className="border-b border-[#f2f4f6] flex items-center justify-between px-4 sm:px-6 py-4 shrink-0">
          <p className="flex-1 text-base sm:text-lg font-medium leading-[24px] text-[#191f28]">계좌이체 확인</p>
          <button 
            onClick={onClose} 
            className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center shrink-0 active:opacity-70 transition-opacity"
            aria-label="닫기"
          >
            <CloseIcon className="w-full h-full" />
          </button>
        </div>

        {/* Content - 스크롤 가능 */}
        <div className="flex-1 flex flex-col overflow-y-auto min-h-0">
          {/* 은행 계좌 입금 내역 섹션 */}
          <div className="flex-1 flex flex-col min-h-0 border-b border-[#f2f4f6]">
            <div className="border-b border-[#f2f4f6] flex items-center justify-between px-4 sm:px-6 py-4 shrink-0 flex-wrap gap-2">
              <p className="flex-1 text-base sm:text-lg font-bold leading-[22px] text-black min-w-[200px]">은행 계좌 입금 내역</p>
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-5 h-5 border border-[#505356] rounded-full flex items-center justify-center shrink-0">
                  <div className="w-3 h-3">
                    {/* 새로고침 아이콘 */}
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 1.5V4.5H9" stroke="#505356" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10.5 6C10.5 8.48528 8.48528 10.5 6 10.5C3.51472 10.5 1.5 8.48528 1.5 6C1.5 3.51472 3.51472 1.5 6 1.5" stroke="#505356" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 1.5L10.5 3L9 4.5" stroke="#505356" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <p className="text-xs sm:text-sm font-medium leading-[1.3] text-[#86898c] whitespace-nowrap">최근 업데이트 13:38</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 sm:p-3">
              {/* 테이블 헤더 - 모바일에서는 스크롤 가능 */}
              <div className="bg-[#d7dadd] flex h-11 items-center px-2 sm:px-3 shrink-0 min-w-max">
                <div className="w-12 shrink-0"></div>
                <div className="w-32 sm:w-44 px-2 sm:px-3 shrink-0">
                  <p className="text-xs sm:text-sm font-medium leading-5 text-black">입금 시간</p>
                </div>
                <div className="w-20 sm:w-28 px-2 sm:px-3 shrink-0">
                  <p className="text-xs sm:text-sm font-medium leading-5 text-black">금액</p>
                </div>
                <div className="w-32 sm:flex-1 px-2 sm:px-3 min-w-[120px]">
                  <p className="text-xs sm:text-sm font-medium leading-5 text-black">키워드</p>
                </div>
                <div className="w-20 sm:w-28 px-2 sm:px-3 shrink-0">
                  <p className="text-xs sm:text-sm font-medium leading-5 text-black">상태</p>
                </div>
              </div>

              {/* 테이블 행 */}
              <div className="min-w-max">
                {depositRecords.map((record) => (
                  <div
                    key={record.id}
                    className={`border-b border-[#f2f4f6] flex h-13 items-center px-2 sm:px-3 min-w-max ${
                      record.status === 'pending' ? 'bg-[#f9f9fb] rounded-2' : ''
                    }`}
                  >
                    <div className="w-12 flex items-center justify-center shrink-0 px-2 sm:px-3">
                      {record.status === 'completed' ? (
                        <div className="w-6 h-6 relative">
                          <CircleCheckIcon className="w-full h-full" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-[#e6e9eb] flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-[#e6e9eb]"></div>
                        </div>
                      )}
                    </div>
                    <div className="w-32 sm:w-44 px-2 sm:px-3 shrink-0">
                      <p className="text-xs sm:text-sm font-medium leading-5 text-[#191f28] truncate">{record.depositTime}</p>
                    </div>
                    <div className="w-20 sm:w-28 px-2 sm:px-3 shrink-0">
                      <p className="text-xs sm:text-sm font-medium leading-5 text-[#191f28] truncate">
                        {record.amount.toLocaleString()}원
                      </p>
                    </div>
                    <div className="w-32 sm:flex-1 px-2 sm:px-3 min-w-[120px]">
                      <p className="text-xs sm:text-sm font-medium leading-5 text-[#191f28] truncate">{record.keyword}</p>
                    </div>
                    <div className="w-20 sm:w-28 px-2 sm:px-3 shrink-0">
                      <div
                        className={`inline-flex items-center px-2 py-1 rounded-md ${
                          record.status === 'completed'
                            ? 'bg-[#e4faf3] text-[#16b079]'
                            : 'bg-[#f6f7f8] text-[#46494c]'
                        }`}
                      >
                        <p className="text-[10px] sm:text-xs font-medium leading-4 text-center whitespace-nowrap">
                          {record.status === 'completed' ? '완료' : '확인대기'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 계좌이체 대기 섹션 */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="border-b border-[#f2f4f6] px-4 sm:px-6 py-4 shrink-0">
              <p className="text-base sm:text-lg font-bold leading-[22px] text-black">계좌이체 대기</p>
            </div>

            <div className="flex-1 overflow-y-auto p-2 sm:p-3">
              {/* 테이블 헤더 */}
              <div className="bg-[#d7dadd] flex h-11 items-center px-2 sm:px-3 shrink-0 min-w-max">
                <div className="w-12 shrink-0"></div>
                <div className="w-32 sm:w-44 px-2 sm:px-3 shrink-0">
                  <p className="text-xs sm:text-sm font-medium leading-5 text-black">생성 시간</p>
                </div>
                <div className="w-20 sm:w-28 px-2 sm:px-3 shrink-0">
                  <p className="text-xs sm:text-sm font-medium leading-5 text-black">금액</p>
                </div>
                <div className="w-32 sm:flex-1 px-2 sm:px-3 min-w-[120px]">
                  <p className="text-xs sm:text-sm font-medium leading-5 text-black">상품명</p>
                </div>
                <div className="w-20 sm:w-28 px-2 sm:px-3 shrink-0">
                  <p className="text-xs sm:text-sm font-medium leading-5 text-black">입금자명</p>
                </div>
              </div>

              {/* 테이블 행 */}
              <div className="min-w-max">
                {pendingTransfers.map((transfer) => {
                  const isSelected = selectedTransferIds.includes(transfer.id);
                  return (
                    <div
                      key={transfer.id}
                      className={`border-b border-[#f2f4f6] flex h-13 items-center px-2 sm:px-3 min-w-max ${
                        isSelected ? 'bg-[#f9f9fb] rounded-2' : ''
                      }`}
                    >
                      <div className="w-12 flex items-center justify-center shrink-0 px-2 sm:px-3">
                        <button
                          onClick={() => handleToggleTransfer(transfer.id)}
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center active:scale-95 transition-transform ${
                            isSelected
                              ? 'bg-black border-black'
                              : 'bg-white border-[#bcbfc2]'
                          }`}
                          aria-label={isSelected ? '선택 해제' : '선택'}
                        >
                          {isSelected && (
                            <div className="w-3 h-3 rounded-sm bg-white"></div>
                          )}
                        </button>
                      </div>
                      <div className="w-32 sm:w-44 px-2 sm:px-3 shrink-0">
                        <p className={`text-xs sm:text-sm font-medium leading-5 truncate ${isSelected ? 'text-black' : 'text-[#191f28]'}`}>
                          {transfer.createdAt}
                        </p>
                      </div>
                      <div className="w-20 sm:w-28 px-2 sm:px-3 shrink-0">
                        <p className={`text-xs sm:text-sm font-medium leading-5 truncate ${isSelected ? 'text-black' : 'text-[#191f28]'}`}>
                          {transfer.amount.toLocaleString()}원
                        </p>
                      </div>
                      <div className="w-32 sm:flex-1 px-2 sm:px-3 min-w-[120px]">
                        <p className={`text-xs sm:text-sm font-medium leading-5 truncate ${isSelected ? 'text-black' : 'text-[#191f28]'}`}>
                          {transfer.productName}
                        </p>
                      </div>
                      <div className="w-20 sm:w-28 px-2 sm:px-3 shrink-0">
                        <p className={`text-xs sm:text-sm font-medium leading-5 truncate ${isSelected ? 'text-black' : 'text-[#191f28]'}`}>
                          {transfer.depositorName}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 flex items-center justify-center shrink-0 border-t border-[#f2f4f6]">
          <button
            onClick={handleConfirm}
            disabled={selectedTransferIds.length === 0}
            className={`w-full h-12 sm:h-14 rounded-2xl flex items-center justify-center text-sm sm:text-base font-medium transition-all ${
              selectedTransferIds.length > 0
                ? 'bg-black text-white active:bg-gray-800'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            이체 확인
          </button>
        </div>
      </div>
    </Dim>
  );
};

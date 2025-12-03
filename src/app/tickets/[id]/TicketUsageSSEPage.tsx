'use client';

import { useEffect, useRef, useState } from 'react';
import { connectSSE } from "@/app/tickets/[id]/connectSSE";

export type SSEMessage = { ticketId?: number, paymentId?: string };

type Status = 'idle' | 'connecting' | 'open' | 'error';

const statusLabel: Record<Status, string> = {
  idle: '대기 중',
  connecting: '연결 중…',
  open: '연결됨',
  error: '에러 발생',
};

const statusClass: Record<Status, string> = {
  idle: 'bg-gray-100 text-gray-700',
  connecting: 'bg-yellow-100 text-yellow-800',
  open: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
};

export default function TicketUsageSSEPage({
                                             ticketId,
                                             endpoint,
                                           }: {
  ticketId: number;
  endpoint: string;
}) {
  const [status, setStatus] = useState<Status>('idle');
  const [messages, setMessages] = useState<SSEMessage[]>([]);
  const sseRef = useRef<EventSource | null>(null);

  useEffect(() => {
    setStatus('connecting');
    if (!ticketId || !endpoint) return;

    const es = connectSSE(
      `${endpoint}/tickets/${ticketId}/stream`,
      (data) => {
        const msg = data as SSEMessage;
        setMessages((prev) => [...prev, msg]);

        // ✅ 내 ticketId와 일치하면 바로 reload
        if (msg?.ticketId === ticketId) {
          window.location.reload();
        }
      },
      () => setStatus('open'),
      () => setStatus('error'),
    );

    sseRef.current = es ?? null;

    return () => {
      sseRef.current?.close();
      sseRef.current = null;
      setStatus('idle');
    };
  }, [ticketId, endpoint]);

  return (
    <div className="text-black space-y-2">
      <div className={`ml-6 inline-block px-3 py-1 rounded-full text-sm font-medium ${statusClass[status]}`}>
        {statusLabel[status]}
      </div>
    </div>
  );
}

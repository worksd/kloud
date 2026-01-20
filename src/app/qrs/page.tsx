'use client';

import dynamic from 'next/dynamic';

const QRPageContent = dynamic(() => import('./QRPageContent'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#0a0a0a',
      }}
    >
      <div className="qr-loading-spinner" />
    </div>
  ),
});

export default function QRPage() {
  return <QRPageContent />;
}

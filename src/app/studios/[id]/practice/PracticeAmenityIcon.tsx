import React from "react";

// 편의시설 이름 → 아이콘 매핑. 이름에 특정 키워드가 포함되면 해당 아이콘을 사용.
const P = { fill: 'none', stroke: '#4E5968', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

function match(name: string): React.ReactNode {
  const n = name.replace(/\s/g, '');

  if (n.includes('주차'))
    return <path {...P} d="M6 20V4h6a4 4 0 0 1 0 8H6" />;
  if (n.includes('와이파이') || n.toLowerCase().includes('wifi'))
    return <><path {...P} d="M2 8.5C7.5 3.5 16.5 3.5 22 8.5M5 12C9 8.3 15 8.3 19 12M8 15.3c2.3-2 5.7-2 8 0" /><circle cx="12" cy="19" r="1.1" fill="#4E5968" stroke="none" /></>;
  if (n.includes('에어컨'))
    return <><rect {...P} x="3" y="5" width="18" height="7" rx="2" /><path {...P} d="M7 16v1M12 16v2M17 16v1" /></>;
  if (n.includes('탈의') || n.includes('옷'))
    return <path {...P} d="M12 3a2 2 0 0 0-1 3.7L3 12v2h18v-2l-8-5.3A2 2 0 0 0 12 3Z" />;
  if (n.includes('급수') || n.includes('정수') || n.includes('물'))
    return <path {...P} d="M12 3s6 6.5 6 10.5a6 6 0 1 1-12 0C6 9.5 12 3 12 3Z" />;
  if (n.includes('음향') || n.includes('마이크') || n.includes('스피커'))
    return <><rect {...P} x="9" y="3" width="6" height="11" rx="3" /><path {...P} d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" /></>;
  if (n.includes('발레바') || n.includes('바'))
    return <path {...P} d="M3 8h18M6 8v11M18 8v11" />;
  if (n.includes('삼각대') || n.includes('촬영') || n.includes('카메라'))
    return <path {...P} d="M12 4v10M12 14 6 21M12 14l6 7M9 4h6" />;
  if (n.includes('와이') || n.includes('거울'))
    return <><rect {...P} x="6" y="3" width="12" height="18" rx="2" /><path {...P} d="M9 6l6 12" /></>;

  // 기본: 체크 아이콘
  return <path {...P} d="M5 12.5 10 17l9-10" />;
}

export function PracticeAmenityIcon({ name, className }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      {match(name)}
    </svg>
  );
}

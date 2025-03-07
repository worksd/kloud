'use client';

interface NavigateClickItemProps {
  method: 'push' | 'back' | 'clearAndPush'
  route?: string;
  children: React.ReactNode;
}

export function NavigateClickWrapper({ method, route, children }: NavigateClickItemProps) {
  return (
    <div
      onClick={() => {
        if (method === 'push') {
          window.KloudEvent?.push(route);
        } else if (method == 'back') {
          window.KloudEvent?.back();
        } else if (method == 'clearAndPush') {
          window.KloudEvent?.clearAndPush(route);
        }
      }}
    >
      {children}
    </div>
  );
}
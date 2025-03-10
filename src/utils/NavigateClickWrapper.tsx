'use client';

interface NavigateClickItemProps {
  method: 'push' | 'back' | 'clearAndPush' | 'closeBottomSheet'
  route?: string;
  children: React.ReactNode;
}

export function NavigateClickWrapper({ method, route, children }: NavigateClickItemProps) {
  return (
    <div
      onClick={() => {
        if (method === 'push' && route) {
          window.KloudEvent?.push(route);
        } else if (method == 'back') {
          window.KloudEvent?.back();
        } else if (method == 'clearAndPush' && route) {
          window.KloudEvent?.clearAndPush(route);
        } else if (method == 'closeBottomSheet') {
          window.KloudEvent?.closeBottomSheet();
      }}}
    >
      {children}
    </div>
  );
}
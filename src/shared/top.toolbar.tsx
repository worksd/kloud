interface TopToolbarProps {
  title: string;
}

export function TopToolbar({ title }: TopToolbarProps) {
  return (
    <header className="p-4">
      <h1 className="w-screen text-[24px] font-normal text-black">{title}</h1>
    </header>
  );
} 
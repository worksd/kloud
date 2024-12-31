interface TopToolbarProps {
  title: string;
}

export function TopToolbar({ title }: TopToolbarProps) {
  return (
    <header className="p-4 border-b">
      <h1 className="w-screen text-lg font-semibold text-black pl-4">{title}</h1>
    </header>
  );
} 
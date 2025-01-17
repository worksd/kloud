export default function SearchLayout({
  children,
                                       popularLessons,
                                       popularStudios
                                     }: Readonly<{
  children: React.ReactNode;
  popularLessons: React.ReactNode;
  popularStudios: React.ReactNode;
}>) {
  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-8 scrollbar-hide">
        {children}
        {popularStudios}
        {popularLessons}
      </div>
    </div>
  )
}

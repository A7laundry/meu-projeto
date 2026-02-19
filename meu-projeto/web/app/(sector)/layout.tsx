export default function SectorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white overflow-hidden">
      {children}
    </div>
  )
}

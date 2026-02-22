export default function TvLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: '#06060a',
        minHeight: '100vh',
        overflow: 'hidden',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {children}
    </div>
  )
}

export function NowIndicator() {
  const now = new Date()
  const top = (now.getHours() + now.getMinutes() / 60) * 64
  return (
    <div
      className="absolute left-0 right-0 z-20 pointer-events-none"
      style={{ top: `${top}px` }}
    >
      <div className="flex items-center">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1.5" />
        <div className="flex-1 h-[2px] bg-red-500" />
      </div>
    </div>
  )
}
import LumoMascot from './Mascot'

/** LUMO Box 标志：琥珀圆角方块里的小猫 + 字标 */
export default function LumoLogo({
  size = 36,
  showWordmark = true,
}: {
  size?: number
  showWordmark?: boolean
}) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        style={{ width: size, height: size }}
        className="flex items-center justify-center overflow-hidden rounded-[12px] bg-lumo-yellow"
      >
        <LumoMascot pose="idle" size={Math.round(size * 0.82)} animate={false} />
      </span>
      {showWordmark && (
        <span className="text-page-title font-extrabold tracking-tight text-lumo-cocoa">
          LUMO<span className="text-lumo-blue"> Box</span>
        </span>
      )}
    </span>
  )
}

/** LUMO Box 标志：直接用 public/lumo-src.png（唯一批准的 logo，不重画）+ 可选字标 */
export default function LumoLogo({
  size = 40,
  showWordmark = true,
}: {
  size?: number
  showWordmark?: boolean
}) {
  return (
    <span className="flex items-center gap-2.5">
      <img
        src={`${import.meta.env.BASE_URL}lumo-src.png`}
        alt="LUMO Box"
        width={size}
        height={size}
        draggable={false}
        className="select-none rounded-[22%] object-cover shadow-sm"
        style={{ width: size, height: size }}
      />
      {showWordmark && (
        <span className="text-title-1 font-extrabold tracking-tight text-lumo-ink">
          LUMO<span className="text-lumo-blue"> Box</span>
        </span>
      )}
    </span>
  )
}

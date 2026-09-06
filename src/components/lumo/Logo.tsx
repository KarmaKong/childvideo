import { useState } from 'react'
import LumoMascot from './Mascot'

/** LUMO Box 标志：优先用 public/lumo-src.png，缺文件时回退内联小猫 */
export default function LumoLogo({
  size = 40,
  showWordmark = true,
}: {
  size?: number
  showWordmark?: boolean
}) {
  const [imgOk, setImgOk] = useState(true)
  return (
    <span className="flex items-center gap-2.5">
      <span
        style={{ width: size, height: size }}
        className="flex items-center justify-center overflow-hidden rounded-[22%] bg-white shadow-sm"
      >
        {imgOk ? (
          <img
            src={`${import.meta.env.BASE_URL}lumo-src.png`}
            alt="LUMO Box"
            className="h-full w-full object-cover"
            onError={() => setImgOk(false)}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-lumo-yellow">
            <LumoMascot pose="idle" size={Math.round(size * 0.8)} animate={false} />
          </span>
        )}
      </span>
      {showWordmark && (
        <span className="text-title-1 font-extrabold tracking-tight text-lumo-ink">
          LUMO<span className="text-lumo-blue"> Box</span>
        </span>
      )}
    </span>
  )
}

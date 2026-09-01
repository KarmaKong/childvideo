import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCatalog } from '../lib/catalog'
import { useSettingsStore } from '../store/useSettingsStore'
import { useProgressStore } from '../store/useProgressStore'

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-bold">{label}</p>
          {hint && <p className="text-xs text-gray-400">{hint}</p>}
        </div>
        {children}
      </div>
    </div>
  )
}

export default function ParentSettings() {
  const nav = useNavigate()
  const { catalog } = useCatalog()
  const s = useSettingsStore()
  const watchedSec = useProgressStore((st) => st.watchedSec)
  const watchedDate = useProgressStore((st) => st.watchedDate)
  const clearHistory = useProgressStore((st) => st.clearHistory)

  const todayMin = watchedDate === new Date().toISOString().slice(0, 10) ? watchedSec / 60 : 0

  function toggleCat(id: string) {
    const cur = s.allowedCategories
    // 空数组 = 全部允许；点击某项时，先展开成全集再增删
    const all = (catalog?.categories ?? []).map((c) => c.id)
    const base = cur.length === 0 ? all : cur
    const nextList = base.includes(id) ? base.filter((x) => x !== id) : [...base, id]
    s.set({ allowedCategories: nextList.length === all.length ? [] : nextList })
  }

  const catAllowed = (id: string) =>
    s.allowedCategories.length === 0 || s.allowedCategories.includes(id)

  return (
    <div className="mx-auto max-w-lg space-y-3 p-4">
      <div className="flex items-center gap-2">
        <button className="btn-ghost !px-3 !py-2 text-base" onClick={() => nav('/')}>
          ‹ 完成
        </button>
        <h1 className="text-2xl font-extrabold">家长设置</h1>
      </div>

      <div className="rounded-2xl bg-kid-accent/15 p-4 text-sm font-bold text-kid-accent">
        今日已观看 {Math.round(todayMin)} 分钟
        {s.dailyLimitMin > 0 && ` / ${s.dailyLimitMin} 分钟`}
      </div>

      <Field label="每日观看时长上限" hint="0 表示不限制">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={240}
            step={5}
            value={s.dailyLimitMin}
            onChange={(e) => s.set({ dailyLimitMin: Math.max(0, Number(e.target.value) || 0) })}
            className="w-20 rounded-xl border-2 border-gray-200 px-3 py-2 text-center text-lg font-bold outline-none focus:border-kid-accent"
          />
          <span className="text-sm text-gray-400">分钟</span>
        </div>
      </Field>

      <Field label="到点锁定" hint="该时刻之后停止播放">
        <input
          type="time"
          value={s.bedtime}
          onChange={(e) => s.set({ bedtime: e.target.value })}
          className="rounded-xl border-2 border-gray-200 px-3 py-2 text-lg font-bold outline-none focus:border-kid-accent"
        />
      </Field>

      <Field label="自动播放下一集" hint="系列视频播完自动续播">
        <Toggle on={s.autoplayNext} onChange={(v) => s.set({ autoplayNext: v })} />
      </Field>

      <Field label="按年龄过滤" hint="仅显示适龄视频；0 表示不过滤">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={12}
            value={s.maxAge}
            onChange={(e) => s.set({ maxAge: Math.max(0, Number(e.target.value) || 0) })}
            className="w-16 rounded-xl border-2 border-gray-200 px-3 py-2 text-center text-lg font-bold outline-none focus:border-kid-accent"
          />
          <span className="text-sm text-gray-400">岁</span>
        </div>
      </Field>

      <Field label="家长验证码 (PIN)" hint="设 4 位数字则家长锁改用 PIN，留空用算术题">
        <input
          inputMode="numeric"
          value={s.parentPin}
          placeholder="----"
          onChange={(e) => s.set({ parentPin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
          className="w-24 rounded-xl border-2 border-gray-200 px-3 py-2 text-center text-lg font-bold tracking-widest outline-none focus:border-kid-accent"
        />
      </Field>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="font-bold">允许的分类</p>
        <p className="mb-3 text-xs text-gray-400">关闭的分类不会出现在孩子的界面里</p>
        <div className="flex flex-wrap gap-2">
          {(catalog?.categories ?? []).map((c) => (
            <button
              key={c.id}
              onClick={() => toggleCat(c.id)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                catAllowed(c.id)
                  ? 'bg-kid-primary text-white'
                  : 'bg-gray-100 text-gray-400 line-through'
              }`}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => {
          if (confirm('清空观看历史与「继续观看」记录？')) clearHistory()
        }}
        className="w-full rounded-2xl bg-white p-4 text-left font-bold text-kid-primary shadow-sm"
      >
        清空观看历史
      </button>
    </div>
  )
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative h-8 w-14 rounded-full transition ${on ? 'bg-kid-green' : 'bg-gray-300'}`}
      aria-pressed={on}
    >
      <span
        className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${
          on ? 'left-7' : 'left-1'
        }`}
      />
    </button>
  )
}

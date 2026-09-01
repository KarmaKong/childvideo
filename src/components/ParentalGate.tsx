import { useMemo, useState, type FormEvent } from 'react'
import { useSettingsStore } from '../store/useSettingsStore'

interface Props {
  onPass: () => void
  onCancel: () => void
}

/**
 * 家长锁：优先要求输入随机两位数乘法答案（孩子难以完成），
 * 若家长设置了 4 位 PIN，则改为输入 PIN。
 */
export default function ParentalGate({ onPass, onCancel }: Props) {
  const pin = useSettingsStore((s) => s.parentPin)
  const [input, setInput] = useState('')
  const [wrong, setWrong] = useState(false)

  const quiz = useMemo(() => {
    const a = 3 + Math.floor(Math.random() * 7) // 3..9
    const b = 4 + Math.floor(Math.random() * 6) // 4..9
    return { a, b, answer: String(a * b) }
  }, [])

  const usePin = pin.length === 4
  const expected = usePin ? pin : quiz.answer

  function submit(e?: FormEvent) {
    e?.preventDefault()
    if (input.trim() === expected) {
      onPass()
    } else {
      setWrong(true)
      setInput('')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-blob bg-white p-6 text-center shadow-2xl"
      >
        <div className="text-5xl">🔒</div>
        <h2 className="mt-3 text-xl font-bold">请家长完成验证</h2>
        <p className="mt-1 text-sm text-gray-500">
          {usePin ? '请输入 4 位家长验证码' : `请计算：${quiz.a} × ${quiz.b} = ?`}
        </p>

        <input
          autoFocus
          inputMode="numeric"
          value={input}
          onChange={(e) => {
            setWrong(false)
            setInput(e.target.value.replace(/\D/g, '').slice(0, 4))
          }}
          className="mt-4 w-full rounded-2xl border-2 border-gray-200 px-4 py-3 text-center text-2xl tracking-widest outline-none focus:border-kid-accent"
        />
        {wrong && <p className="mt-2 text-sm font-bold text-kid-primary">再试一次～</p>}

        <div className="mt-5 flex gap-3">
          <button type="button" className="btn-ghost flex-1" onClick={onCancel}>
            取消
          </button>
          <button type="submit" className="btn-kid flex-1">
            确定
          </button>
        </div>
      </form>
    </div>
  )
}

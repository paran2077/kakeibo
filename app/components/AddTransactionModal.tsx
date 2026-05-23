'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { dbPost } from '@/lib/dbPost'

const EXPENSE_CATEGORIES = ['食費', '交通費', '娯楽', '日用品', '医療', '光熱費', '通信費', 'その他']
const INCOME_CATEGORIES = ['給与', '副業', 'その他']

type Props = {
  onClose: () => void
  onSave: () => void
}

export default function AddTransactionModal({ onClose, onSave }: Props) {
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType)
    setCategory('')
  }

  async function handleSave() {
    if (!amount || !category || loading) return
    setLoading(true)
    try {
      await dbPost('transactions', 'POST', { type, amount: Number(amount), category, note: note.trim() || null, date })
      onSave()
    } catch (err) { alert(String(err)) }
    setLoading(false)
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 rounded-t-3xl p-6 w-full max-w-md border-t border-x border-white/20"
        onClick={e => e.stopPropagation()}
      >
        {/* タイトル */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg">追加</h2>
          <button onClick={onClose} className="text-purple-400 hover:text-white transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* 収入・支出切替 */}
        <div className="flex bg-white/10 rounded-2xl p-1 mb-5">
          <button
            onClick={() => handleTypeChange('expense')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              type === 'expense' ? 'bg-rose-500 text-white shadow-lg' : 'text-purple-300'
            }`}
          >
            支出
          </button>
          <button
            onClick={() => handleTypeChange('income')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              type === 'income' ? 'bg-emerald-500 text-white shadow-lg' : 'text-purple-300'
            }`}
          >
            収入
          </button>
        </div>

        {/* 金額 */}
        <div className="mb-4">
          <label className="text-purple-300 text-xs mb-1.5 block">金額</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300 text-lg">¥</span>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0"
              className="w-full bg-white/10 border border-white/20 rounded-2xl pl-9 pr-4 py-3.5 text-white placeholder-purple-500 focus:outline-none focus:border-purple-400 text-xl font-semibold"
            />
          </div>
        </div>

        {/* カテゴリ */}
        <div className="mb-4">
          <label className="text-purple-300 text-xs mb-2 block">カテゴリ</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-sm transition-all ${
                  category === cat
                    ? type === 'expense'
                      ? 'bg-rose-500 text-white'
                      : 'bg-emerald-500 text-white'
                    : 'bg-white/10 text-purple-300 hover:bg-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* メモ */}
        <div className="mb-4">
          <label className="text-purple-300 text-xs mb-1.5 block">メモ（任意）</label>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="メモを入力"
            className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-purple-500 focus:outline-none focus:border-purple-400 text-sm"
          />
        </div>

        {/* 日付 */}
        <div className="mb-6">
          <label className="text-purple-300 text-xs mb-1.5 block">日付</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-purple-400 text-sm"
          />
        </div>

        {/* 保存ボタン */}
        <button
          onClick={handleSave}
          disabled={!amount || !category || loading}
          className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl text-white font-bold text-sm disabled:opacity-40 hover:opacity-90 active:scale-98 transition-all shadow-lg shadow-purple-500/30"
        >
          {loading ? '保存中...' : '保存する'}
        </button>
      </div>
    </div>
  )
}

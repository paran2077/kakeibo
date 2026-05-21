'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase, CreditCardUsage } from '@/lib/supabase'
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react'

export default function CardsPage() {
  const [usages, setUsages] = useState<CreditCardUsage[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [cardName, setCardName] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1

  const fetchUsages = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('credit_card_usage')
      .select('*')
      .eq('year', year)
      .eq('month', month)
      .order('created_at', { ascending: false })
    setUsages(data || [])
    setLoading(false)
  }, [year, month])

  useEffect(() => { fetchUsages() }, [fetchUsages])

  async function handleSave() {
    if (!cardName || !amount || saving) return
    setSaving(true)
    await supabase.from('credit_card_usage').insert({
      card_name: cardName,
      year,
      month,
      amount: parseInt(amount, 10),
      note: note.trim() || null,
    })
    setSaving(false)
    setCardName(''); setAmount(''); setNote('')
    setIsModalOpen(false)
    fetchUsages()
  }

  async function handleDelete(id: string) {
    await supabase.from('credit_card_usage').delete().eq('id', id)
    fetchUsages()
  }

  const total = usages.reduce((sum, u) => sum + u.amount, 0)

  const prevMonth = () => {
    const d = new Date(currentDate); d.setMonth(d.getMonth() - 1); setCurrentDate(d)
  }
  const nextMonth = () => {
    const d = new Date(currentDate); d.setMonth(d.getMonth() + 1); setCurrentDate(d)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      <div className="max-w-md mx-auto px-4 pb-36 pt-12">

        <h1 className="text-2xl font-bold text-white text-center mb-2">カード使用料</h1>
        <div className="flex items-center justify-center gap-6 mb-6">
          <button onClick={prevMonth} className="text-purple-400 hover:text-white transition-colors"><ChevronLeft size={22} /></button>
          <span className="text-white font-medium">{year}年{month}月</span>
          <button onClick={nextMonth} className="text-purple-400 hover:text-white transition-colors"><ChevronRight size={22} /></button>
        </div>

        {/* 合計 */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20 mb-4">
          <p className="text-purple-300 text-xs mb-1">今月のカード合計</p>
          <p className="text-white font-bold text-3xl">¥{total.toLocaleString()}</p>
        </div>

        {/* リスト */}
        <div className="bg-white/10 backdrop-blur rounded-3xl p-6 border border-white/20">
          <h2 className="text-white font-medium text-sm mb-4">カード別明細</h2>
          {loading ? (
            <p className="text-purple-300 text-center py-6 text-sm">読み込み中...</p>
          ) : usages.length === 0 ? (
            <p className="text-purple-400 text-center py-8 text-sm">まだ記録がありません</p>
          ) : (
            <div className="space-y-1">
              {usages.map(u => (
                <div key={u.id} className="flex items-center gap-3 py-3 border-b border-white/10 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{u.card_name}</p>
                    {u.note && <p className="text-purple-400 text-xs">{u.note}</p>}
                  </div>
                  <p className="text-rose-400 font-semibold text-sm">¥{u.amount.toLocaleString()}</p>
                  <button onClick={() => handleDelete(u.id)} className="text-slate-500 hover:text-rose-400 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 追加ボタン */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-20 right-6 w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full shadow-xl shadow-purple-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
      >
        <Plus size={28} className="text-white" strokeWidth={2.5} />
      </button>

      {/* モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50" onClick={() => setIsModalOpen(false)}>
          <div className="bg-slate-900 rounded-t-3xl p-6 w-full max-w-md border-t border-x border-white/20" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-lg">カード使用料を追加</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-purple-400 hover:text-white"><X size={22} /></button>
            </div>

            <div className="mb-4">
              <label className="text-purple-300 text-xs mb-1.5 block">カード名</label>
              <input
                type="text"
                value={cardName}
                onChange={e => setCardName(e.target.value)}
                placeholder="例：楽天カード、PayPayカード"
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-purple-500 focus:outline-none focus:border-purple-400 text-sm"
              />
            </div>

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

            <div className="mb-6">
              <label className="text-purple-300 text-xs mb-1.5 block">メモ（任意）</label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="例：5月利用分"
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-purple-500 focus:outline-none focus:border-purple-400 text-sm"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={!cardName || !amount || saving}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl text-white font-bold text-sm disabled:opacity-40"
            >
              {saving ? '保存中...' : '保存する'}
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

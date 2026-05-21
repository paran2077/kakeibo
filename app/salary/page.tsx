'use client'

import { useState, useEffect } from 'react'
import { supabase, Transaction } from '@/lib/supabase'
import { Plus, X } from 'lucide-react'

export default function SalaryPage() {
  const [salaries, setSalaries] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSalaries()
  }, [])

  async function fetchSalaries() {
    setLoading(true)
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('type', 'income')
      .eq('category', '給与')
      .order('date', { ascending: false })
    setSalaries(data || [])
    setLoading(false)
  }

  async function handleSave() {
    if (!amount || saving) return
    setSaving(true)
    await supabase.from('transactions').insert({
      type: 'income',
      amount: parseInt(amount, 10),
      category: '給与',
      note: note.trim() || null,
      date,
    })
    setSaving(false)
    setAmount('')
    setNote('')
    setIsModalOpen(false)
    fetchSalaries()
  }

  async function handleDelete(id: string) {
    await supabase.from('transactions').delete().eq('id', id)
    fetchSalaries()
  }

  const total = salaries.reduce((sum, s) => sum + s.amount, 0)
  const avg = salaries.length > 0 ? Math.round(total / salaries.length) : 0

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      <div className="max-w-md mx-auto px-4 pb-36 pt-12">

        <h1 className="text-2xl font-bold text-white text-center mb-6">給与履歴</h1>

        {/* サマリー */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
            <p className="text-purple-300 text-xs mb-1">累計</p>
            <p className="text-white font-bold text-lg">¥{total.toLocaleString()}</p>
          </div>
          <div className="flex-1 bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
            <p className="text-purple-300 text-xs mb-1">平均月収</p>
            <p className="text-white font-bold text-lg">¥{avg.toLocaleString()}</p>
          </div>
        </div>

        {/* 給与リスト */}
        <div className="bg-white/10 backdrop-blur rounded-3xl p-6 border border-white/20">
          <h2 className="text-white font-medium text-sm mb-4">月別一覧</h2>
          {loading ? (
            <p className="text-purple-300 text-center py-6 text-sm">読み込み中...</p>
          ) : salaries.length === 0 ? (
            <p className="text-purple-400 text-center py-8 text-sm">まだ記録がありません</p>
          ) : (
            <div className="space-y-1">
              {salaries.map(s => (
                <div key={s.id} className="flex items-center gap-3 py-3 border-b border-white/10 last:border-0">
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{s.date}</p>
                    {s.note && <p className="text-purple-400 text-xs">{s.note}</p>}
                  </div>
                  <p className="text-emerald-400 font-semibold text-sm">¥{s.amount.toLocaleString()}</p>
                  <button onClick={() => handleDelete(s.id)} className="text-slate-600 hover:text-rose-400 transition-colors ml-1">
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
        className="fixed bottom-20 right-6 w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full shadow-xl shadow-emerald-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
      >
        <Plus size={28} className="text-white" strokeWidth={2.5} />
      </button>

      {/* 追加モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50" onClick={() => setIsModalOpen(false)}>
          <div className="bg-slate-900 rounded-t-3xl p-6 w-full max-w-md border-t border-x border-white/20" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-lg">給与を追加</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-purple-400 hover:text-white"><X size={22} /></button>
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

            <div className="mb-4">
              <label className="text-purple-300 text-xs mb-1.5 block">メモ（任意）</label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="例：6月分給与"
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-purple-500 focus:outline-none focus:border-purple-400 text-sm"
              />
            </div>

            <div className="mb-6">
              <label className="text-purple-300 text-xs mb-1.5 block">日付</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-purple-400 text-sm"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={!amount || saving}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl text-white font-bold text-sm disabled:opacity-40"
            >
              {saving ? '保存中...' : '保存する'}
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

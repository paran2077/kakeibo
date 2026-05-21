'use client'

import { useState, useEffect } from 'react'
import { supabase, FixedExpense } from '@/lib/supabase'
import { Plus, X, Pencil } from 'lucide-react'

const CATEGORIES = ['家賃', '保険', 'サブスク', '通信費', '光熱費', 'ローン', 'その他']

type ModalState = { open: boolean; editing: FixedExpense | null }

export default function FixedPage() {
  const [items, setItems] = useState<FixedExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<ModalState>({ open: false, editing: null })
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('その他')
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchItems() }, [])

  async function fetchItems() {
    setLoading(true)
    const { data } = await supabase.from('fixed_expenses').select('*').order('created_at', { ascending: true })
    setItems(data || [])
    setLoading(false)
  }

  function openAdd() {
    setName(''); setAmount(''); setCategory('その他')
    setModal({ open: true, editing: null })
  }

  function openEdit(item: FixedExpense) {
    setName(item.name); setAmount(String(item.amount)); setCategory(item.category)
    setModal({ open: true, editing: item })
  }

  function closeModal() { setModal({ open: false, editing: null }) }

  async function handleSave() {
    if (!name || !amount || saving) return
    setSaving(true)
    if (modal.editing) {
      await supabase.from('fixed_expenses').update({ name, amount: parseInt(amount, 10), category }).eq('id', modal.editing.id)
    } else {
      await supabase.from('fixed_expenses').insert({ name, amount: parseInt(amount, 10), category })
    }
    setSaving(false)
    closeModal()
    fetchItems()
  }

  async function handleDelete(id: string) {
    await supabase.from('fixed_expenses').delete().eq('id', id)
    fetchItems()
  }

  const total = items.reduce((sum, i) => sum + i.amount, 0)

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      <div className="max-w-md mx-auto px-4 pb-36 pt-12">

        <h1 className="text-2xl font-bold text-white text-center mb-6">固定費</h1>

        {/* 合計 */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20 mb-4">
          <p className="text-purple-300 text-xs mb-1">月々の固定費合計</p>
          <p className="text-white font-bold text-3xl">¥{total.toLocaleString()}</p>
        </div>

        {/* リスト */}
        <div className="bg-white/10 backdrop-blur rounded-3xl p-6 border border-white/20">
          <h2 className="text-white font-medium text-sm mb-4">登録済み固定費</h2>
          {loading ? (
            <p className="text-purple-300 text-center py-6 text-sm">読み込み中...</p>
          ) : items.length === 0 ? (
            <p className="text-purple-400 text-center py-8 text-sm">まだ登録がありません</p>
          ) : (
            <div className="space-y-1">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-3 py-3 border-b border-white/10 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{item.name}</p>
                    <p className="text-purple-400 text-xs">{item.category}</p>
                  </div>
                  <p className="text-rose-400 font-semibold text-sm">¥{item.amount.toLocaleString()}</p>
                  <button onClick={() => openEdit(item)} className="text-slate-500 hover:text-purple-400 transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-slate-500 hover:text-rose-400 transition-colors">
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
        onClick={openAdd}
        className="fixed bottom-20 right-6 w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full shadow-xl shadow-purple-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
      >
        <Plus size={28} className="text-white" strokeWidth={2.5} />
      </button>

      {/* モーダル */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50" onClick={closeModal}>
          <div className="bg-slate-900 rounded-t-3xl p-6 w-full max-w-md border-t border-x border-white/20" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-lg">{modal.editing ? '固定費を編集' : '固定費を追加'}</h2>
              <button onClick={closeModal} className="text-purple-400 hover:text-white"><X size={22} /></button>
            </div>

            <div className="mb-4">
              <label className="text-purple-300 text-xs mb-1.5 block">名称</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="例：家賃、Netflix"
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
              <label className="text-purple-300 text-xs mb-2 block">カテゴリ</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-sm transition-all ${category === cat ? 'bg-purple-500 text-white' : 'bg-white/10 text-purple-300 hover:bg-white/20'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={!name || !amount || saving}
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

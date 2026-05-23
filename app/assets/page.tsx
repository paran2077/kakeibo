'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase, BankBalance } from '@/lib/supabase'
import { Plus, X, Pencil } from 'lucide-react'
import { dbPost } from '@/lib/dbPost'

type ModalState = { open: boolean; editing: BankBalance | null }

export default function AssetsPage() {
  const [balances, setBalances] = useState<BankBalance[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<ModalState>({ open: false, editing: null })
  const [bankName, setBankName] = useState('')
  const [balance, setBalance] = useState('')
  const [updatedDate, setUpdatedDate] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)

  const fetchBalances = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('bank_balances')
      .select('*')
      .order('created_at', { ascending: true })
    setBalances(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchBalances() }, [fetchBalances])

  function openAdd() {
    setBankName(''); setBalance(''); setUpdatedDate(new Date().toISOString().split('T')[0])
    setModal({ open: true, editing: null })
  }

  function openEdit(item: BankBalance) {
    setBankName(item.bank_name); setBalance(String(item.balance)); setUpdatedDate(item.updated_date)
    setModal({ open: true, editing: item })
  }

  function closeModal() { setModal({ open: false, editing: null }) }

  async function handleSave() {
    if (!bankName || !balance || saving) return
    setSaving(true)
    try {
      const payload = { bank_name: bankName, balance: Number(balance), updated_date: updatedDate }
      if (modal.editing) {
        await dbPost('bank_balances', 'PATCH', { id: modal.editing.id, ...payload })
      } else {
        await dbPost('bank_balances', 'POST', payload)
      }
      closeModal()
      await fetchBalances()
    } catch (err) { alert(String(err)) }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    await dbPost('bank_balances', 'DELETE', { id })
    await fetchBalances()
  }

  const total = balances.reduce((sum, b) => sum + b.balance, 0)

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      <div className="max-w-md mx-auto px-4 pb-36 pt-12">

        <h1 className="text-2xl font-bold text-white text-center mb-6">資産・預金残高</h1>

        {/* 合計資産 */}
        <div className="bg-gradient-to-r from-purple-600/40 to-indigo-600/40 backdrop-blur rounded-3xl p-6 border border-purple-400/30 mb-4">
          <p className="text-purple-300 text-xs mb-1">総資産</p>
          <p className="text-white font-bold text-4xl">¥{total.toLocaleString()}</p>
          <p className="text-purple-300 text-xs mt-2">{balances.length}口座</p>
        </div>

        {/* 口座リスト */}
        <div className="bg-white/10 backdrop-blur rounded-3xl p-6 border border-white/20">
          <h2 className="text-white font-medium text-sm mb-4">口座一覧</h2>
          {loading ? (
            <p className="text-purple-300 text-center py-6 text-sm">読み込み中...</p>
          ) : balances.length === 0 ? (
            <p className="text-purple-400 text-center py-8 text-sm">まだ登録がありません</p>
          ) : (
            <div className="space-y-1">
              {balances.map(b => (
                <div key={b.id} className="flex items-center gap-3 py-3 border-b border-white/10 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{b.bank_name}</p>
                    <p className="text-purple-400 text-xs">更新日: {b.updated_date}</p>
                  </div>
                  <p className="text-white font-semibold text-sm">¥{b.balance.toLocaleString()}</p>
                  <button onClick={() => openEdit(b)} className="text-slate-500 hover:text-purple-400 transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(b.id)} className="text-slate-500 hover:text-rose-400 transition-colors">
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
              <h2 className="text-white font-bold text-lg">{modal.editing ? '口座を編集' : '口座を追加'}</h2>
              <button onClick={closeModal} className="text-purple-400 hover:text-white"><X size={22} /></button>
            </div>

            <div className="mb-4">
              <label className="text-purple-300 text-xs mb-1.5 block">銀行・口座名</label>
              <input
                type="text"
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                placeholder="例：三菱UFJ、ゆうちょ"
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-purple-500 focus:outline-none focus:border-purple-400 text-sm"
              />
            </div>

            <div className="mb-4">
              <label className="text-purple-300 text-xs mb-1.5 block">残高</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300 text-lg">¥</span>
                <input
                  type="number"
                  value={balance}
                  onChange={e => setBalance(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white/10 border border-white/20 rounded-2xl pl-9 pr-4 py-3.5 text-white placeholder-purple-500 focus:outline-none focus:border-purple-400 text-xl font-semibold"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="text-purple-300 text-xs mb-1.5 block">確認日</label>
              <input
                type="date"
                value={updatedDate}
                onChange={e => setUpdatedDate(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-purple-400 text-sm"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={!bankName || !balance || saving}
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

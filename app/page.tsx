'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase, Transaction } from '@/lib/supabase'
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import AddTransactionModal from './components/AddTransactionModal'

const COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#f43f5e', '#6366f1', '#ec4899', '#84cc16']

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    const y = currentDate.getFullYear()
    const m = currentDate.getMonth() + 1
    const startDate = `${y}-${String(m).padStart(2, '0')}-01`
    const endDate = `${y}-${String(m).padStart(2, '0')}-31`

    const { data } = await supabase
      .from('transactions')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })

    setTransactions(data || [])
    setLoading(false)
  }, [currentDate])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpense

  const expenseByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

  const chartData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }))

  const prevMonth = () => {
    const d = new Date(currentDate)
    d.setMonth(d.getMonth() - 1)
    setCurrentDate(d)
  }

  const nextMonth = () => {
    const d = new Date(currentDate)
    d.setMonth(d.getMonth() + 1)
    setCurrentDate(d)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      <div className="max-w-md mx-auto px-4 pb-28">

        {/* ヘッダー */}
        <div className="pt-12 pb-6 text-center">
          <h1 className="text-2xl font-bold text-white tracking-wide">家計簿</h1>
          <div className="flex items-center justify-center gap-6 mt-3">
            <button onClick={prevMonth} className="text-purple-400 hover:text-white transition-colors">
              <ChevronLeft size={22} />
            </button>
            <span className="text-white font-medium text-base">{year}年{month}月</span>
            <button onClick={nextMonth} className="text-purple-400 hover:text-white transition-colors">
              <ChevronRight size={22} />
            </button>
          </div>
        </div>

        {/* 残高カード */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-4 border border-white/20">
          <p className="text-purple-300 text-sm mb-1">今月の残高</p>
          <p className={`text-4xl font-bold mb-5 ${balance >= 0 ? 'text-white' : 'text-rose-400'}`}>
            ¥{balance.toLocaleString()}
          </p>
          <div className="flex gap-3">
            <div className="flex-1 bg-emerald-500/20 rounded-2xl p-3">
              <div className="flex items-center gap-1 text-emerald-400 text-xs mb-1">
                <TrendingUp size={12} />
                <span>収入</span>
              </div>
              <p className="text-white font-semibold text-sm">¥{totalIncome.toLocaleString()}</p>
            </div>
            <div className="flex-1 bg-rose-500/20 rounded-2xl p-3">
              <div className="flex items-center gap-1 text-rose-400 text-xs mb-1">
                <TrendingDown size={12} />
                <span>支出</span>
              </div>
              <p className="text-white font-semibold text-sm">¥{totalExpense.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* 支出グラフ */}
        {chartData.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-4 border border-white/20">
            <h2 className="text-white font-medium mb-4 text-sm">支出内訳</h2>
            <div className="flex items-center gap-2">
              <ResponsiveContainer width="45%" height={150}>
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={38} outerRadius={65} dataKey="value" paddingAngle={2}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => typeof v === 'number' ? `¥${v.toLocaleString()}` : String(v)}
                    contentStyle={{ background: '#1e1b4b', border: 'none', borderRadius: 12, color: '#fff', fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2 min-w-0">
                {chartData.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-purple-200 text-xs truncate">{item.name}</span>
                    <span className="text-white text-xs ml-auto flex-shrink-0">¥{item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 取引履歴 */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
          <h2 className="text-white font-medium mb-4 text-sm">取引履歴</h2>
          {loading ? (
            <p className="text-purple-300 text-center py-6 text-sm">読み込み中...</p>
          ) : transactions.length === 0 ? (
            <p className="text-purple-400 text-center py-8 text-sm">まだ記録がありません</p>
          ) : (
            <div className="space-y-1">
              {transactions.map(t => (
                <div key={t.id} className="flex items-center gap-3 py-3 border-b border-white/10 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{t.category}</p>
                    {t.note && <p className="text-purple-400 text-xs truncate">{t.note}</p>}
                    <p className="text-purple-500 text-xs mt-0.5">{t.date}</p>
                  </div>
                  <p className={`font-semibold text-sm flex-shrink-0 ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {t.type === 'income' ? '+' : '-'}¥{t.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 追加ボタン */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-6 w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full shadow-xl shadow-purple-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
        aria-label="追加"
      >
        <Plus size={28} className="text-white" strokeWidth={2.5} />
      </button>

      {isModalOpen && (
        <AddTransactionModal
          onClose={() => setIsModalOpen(false)}
          onSave={() => {
            fetchTransactions()
            setIsModalOpen(false)
          }}
        />
      )}
    </main>
  )
}

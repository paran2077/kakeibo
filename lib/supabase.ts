import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Transaction = {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  note: string | null
  date: string
  created_at: string
}

export type FixedExpense = {
  id: string
  name: string
  amount: number
  category: string
  active: boolean
  created_at: string
}

export type CreditCardUsage = {
  id: string
  card_name: string
  year: number
  month: number
  amount: number
  note: string | null
  created_at: string
}

export type BankBalance = {
  id: string
  bank_name: string
  balance: number
  updated_date: string
  created_at: string
}

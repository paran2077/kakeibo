'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Wallet, BookMarked, CreditCard, Landmark } from 'lucide-react'

const navItems = [
  { href: '/', label: 'ホーム', icon: LayoutDashboard },
  { href: '/salary', label: '給与', icon: Wallet },
  { href: '/fixed', label: '固定費', icon: BookMarked },
  { href: '/cards', label: 'カード', icon: CreditCard },
  { href: '/assets', label: '資産', icon: Landmark },
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur border-t border-white/10 z-40">
      <div className="max-w-md mx-auto flex">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center py-2.5 gap-1 transition-colors ${
                active ? 'text-purple-400' : 'text-slate-500 hover:text-purple-400'
              }`}
            >
              <Icon size={18} />
              <span className="text-[10px]">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

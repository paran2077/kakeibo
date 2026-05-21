import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import './globals.css'
import BottomNav from './components/BottomNav'

const noto = Noto_Sans_JP({ subsets: ['latin'], weight: ['400', '500', '700'] })

export const metadata: Metadata = {
  title: '家計簿',
  description: 'シンプルな家計簿アプリ',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={noto.className}>
        {children}
        <BottomNav />
      </body>
    </html>
  )
}

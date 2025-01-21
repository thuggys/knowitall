import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from './components/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Know It All',
  description: 'A journey through tech and knowledge sharing',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={inter.className}>
        <div className="min-h-screen bg-black text-white relative">
          <Sidebar />
          <main className="lg:pl-64 pt-16 lg:pt-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}

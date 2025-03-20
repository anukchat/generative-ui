import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { MyRuntimeProvider } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Generative UI Demo',
  description: 'A demo of generative UI using LangGraph and Assistant UI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MyRuntimeProvider>
          {children}
        </MyRuntimeProvider>
      </body>
    </html>
  )
}

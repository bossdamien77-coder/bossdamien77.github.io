import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '3DForge — AI 3D Generation',
  description: 'Generate 3D models from text and images using AI',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

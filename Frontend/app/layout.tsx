import './globals.css'
import { Poppins } from 'next/font/google'

const poppins = Poppins({ 
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = {
  title: 'Exoplanet Data Viewer',
  description: 'View exoplanet data visualizations in a soothing interface',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={poppins.className}>{children}</body>
    </html>
  )
}


'use client';

import { useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavDrawer from './components/NavDrawer';
import { usePathname } from 'next/navigation';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname() || '/';
  const isDashboard = pathname.startsWith('/dashboard');
  const isLogin = pathname === '/';
  const showHamburger = !isLogin && !isDashboard;
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-slate-50 flex text-gray-900 font-sans relative">
        {showHamburger && (
          <>
            <NavDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
            <button
              onClick={() => setDrawerOpen(true)}
              className="fixed top-3 left-4 z-30 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur border border-gray-200 shadow-md hover:bg-white transition-all"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </>
        )}
        <div className="flex-1 min-h-screen flex flex-col w-full">
          {children}
        </div>
      </body>
    </html>
  );
}
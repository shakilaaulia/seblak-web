'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import logo1 from '../../../assets/Logo 1.png';

export default function OrderStatusPage() {
  const router = useRouter();
  
  // Interactive status index: 0 = Verifikasi WA, 1 = Sedang Dimasak, 2 = Siap Diambil
  const [statusIndex, setStatusIndex] = useState<number>(1);

  // Auto advance status for presentation simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (statusIndex < 2) {
        setStatusIndex(prev => prev + 1);
      }
    }, 8000); // Advances from "Sedang Dimasak" to "Siap Diambil" after 8 seconds
    return () => clearTimeout(timer);
  }, [statusIndex]);

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-red-900 to-red-950 min-h-screen pb-24 relative select-none text-white overflow-hidden">
      {/* Decorative Chili Graphics Background */}
      <div className="absolute top-10 -left-6 opacity-5 text-8xl pointer-events-none transform -rotate-45">🌶️</div>
      <div className="absolute bottom-24 -right-6 opacity-5 text-8xl pointer-events-none transform rotate-12">🌶️</div>

      {/* Header bar */}
      <header className="sticky top-0 bg-red-950/40 backdrop-blur border-b border-red-800/30 text-white flex items-center justify-between px-4 py-3.5 z-20">
        <button onClick={() => router.push('/menu')} className="hover:opacity-80 transition-opacity">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <img src={logo1.src} alt="Seblak Mamah Zahwa" className="h-7 sm:h-9 md:h-11 object-contain" />
        <button onClick={() => router.push('/cart')} className="relative p-1">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-red-850">
            1
          </span>
        </button>
      </header>

      {/* Content Container */}
      <div className="flex-1 px-4 py-8 flex flex-col items-center justify-center space-y-10 z-10 my-auto">
        {/* Main Title Banner */}
        <h1 className="text-2xl font-black italic tracking-widest text-center text-white drop-shadow-md animate-pulse">
          PANTAU SEBLAKMU! 🌶️
        </h1>

        {/* Queue Antrean Card (Translucent container) */}
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-[28px] py-7 px-8 text-center shadow-2xl w-full max-w-xs space-y-2.5">
          <p className="text-[10px] font-bold tracking-widest text-red-200/60 uppercase">
            NOMOR ANTREAN
          </p>
          <h2 className="text-4xl font-black tracking-wider text-white">
            #SBK-023
          </h2>
        </div>

        {/* Timeline Status Progress */}
        <div className="flex flex-col items-center space-y-0 w-full max-w-xs">
          {/* Step 1: Verifikasi WA */}
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs px-5 py-2.5 rounded-full shadow-lg shadow-emerald-950/25">
              <span>Verifikasi WA</span>
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-black text-[9px] font-black flex items-center justify-center">✓</span>
            </div>
            {/* Connector */}
            <div className={`w-0.5 h-10 ${statusIndex >= 1 ? 'bg-gradient-to-b from-emerald-500 to-amber-500' : 'bg-gray-700'}`}></div>
          </div>

          {/* Step 2: Sedang Dimasak */}
          <div className="flex flex-col items-center">
            {statusIndex >= 1 ? (
              <div className={`flex items-center space-x-2 bg-black/60 font-extrabold text-xs px-6 py-3 rounded-full shadow-2xl ${
                statusIndex === 1 
                  ? 'border-2 border-amber-400 ring-4 ring-amber-400/25 text-amber-300 animate-pulse'
                  : 'border border-amber-500/30 text-amber-200/80'
              }`}>
                <span>🔥 Sedang Dimasak...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 bg-black/20 border border-white/5 text-gray-500 font-bold text-xs px-5 py-2.5 rounded-full">
                <span>Sedang Dimasak</span>
              </div>
            )}
            {/* Connector */}
            <div className={`w-0.5 h-10 ${statusIndex >= 2 ? 'bg-gradient-to-b from-amber-500 to-emerald-500' : 'bg-gray-700'}`}></div>
          </div>

          {/* Step 3: Siap Diambil */}
          <div className="flex flex-col items-center">
            {statusIndex >= 2 ? (
              <div className="flex items-center space-x-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs px-6 py-3 rounded-full shadow-2xl animate-bounce">
                <span>Siap Diambil!</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 bg-black/20 border border-white/5 text-gray-600 font-bold text-xs px-5 py-2.5 rounded-full">
                <span>Siap Diambil!</span>
              </div>
            )}
          </div>
        </div>

        {/* Interactive Simulation Helper */}
        {statusIndex < 2 && (
          <button
            onClick={() => setStatusIndex(2)}
            className="text-[9px] text-red-300 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 py-1.5 px-3.5 rounded-full transition-all"
          >
            Simulasikan status siap diambil
          </button>
        )}
      </div>

      {/* Bottom Sticky Navigation */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 py-3.5 px-4 flex justify-between items-center z-10 text-gray-800">
        <button
          onClick={() => router.push('/menu')}
          className="flex-1 flex flex-col items-center justify-center space-y-1 py-1 rounded-xl transition-all text-gray-400 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[10px]">Beranda</span>
        </button>

        <button
          onClick={() => router.push('/cart')}
          className="flex-1 flex flex-col items-center justify-center space-y-1 py-1 rounded-xl transition-all text-gray-400 font-medium relative"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-[10px]">Keranjang</span>
          <span className="absolute top-1 right-5 bg-red-600 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
            1
          </span>
        </button>

        <button
          onClick={() => {}}
          className="flex-1 flex flex-col items-center justify-center space-y-1 py-1 rounded-xl transition-all bg-amber-500 text-white font-bold p-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="text-[10px]">Status</span>
        </button>

        <button
          onClick={() => router.push('/')}
          className="flex-1 flex flex-col items-center justify-center space-y-1 py-1 rounded-xl transition-all text-gray-400 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A9 9 0 0112 15a9 9 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-[10px]">Profile</span>
        </button>
      </nav>
    </div>
  );
}
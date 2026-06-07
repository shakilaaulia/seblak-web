'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import logo from '../../../assets/Logo 2.png';

export default function AdminLoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePinChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newPin = [...pin];
    newPin[idx] = val.slice(-1);
    setPin(newPin);
    setError('');

    // Auto-focus next input
    if (val && idx < 5) {
      const nextInput = document.getElementById(`pin-${idx + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[idx] && idx > 0) {
      const prevInput = document.getElementById(`pin-${idx - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pinStr = pin.join('');
    if (pinStr.length !== 6) {
      setError('PIN harus 6 digit');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinStr }),
      });

      if (res.ok) {
        router.push('/dashboard');
      } else {
        setError('PIN salah! Coba lagi.');
        setPin(['', '', '', '', '', '']);
        document.getElementById('pin-0')?.focus();
      }
    } catch {
      setError('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-b from-rose-50 via-white to-amber-50/50 min-h-screen">
      <div className="w-full max-w-xs flex flex-col items-center text-center space-y-8">
        {/* Logo */}
        <img src={logo.src} alt="Seblak Mamah Zahwa" className="w-36 h-36 object-contain" />

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-red-700 tracking-tight">Admin Dashboard</h1>
          <p className="text-xs text-gray-500">Masukkan PIN 6 digit untuk masuk</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          {/* PIN Input Grid */}
          <div className="flex justify-center space-x-3">
            {pin.map((digit, idx) => (
              <input
                key={idx}
                id={`pin-${idx}`}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePinChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`w-11 h-14 text-center text-xl font-black border-2 rounded-2xl outline-none transition-all ${
                  error
                    ? 'border-red-500 bg-red-50 text-red-600'
                    : digit
                      ? 'border-red-700 bg-red-50 text-red-700'
                      : 'border-gray-200 bg-white text-gray-800'
                }`}
                autoFocus={idx === 0}
              />
            ))}
          </div>

          {error && (
            <p className="text-xs font-bold text-red-600 text-center animate-pulse">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-red-700/10 active:scale-[0.98] transition-all text-sm"
          >
            {loading ? 'Memverifikasi...' : 'Masuk Dashboard'}
          </button>

          <p className="text-[10px] text-gray-400">
            Kembali ke{' '}
            <button type="button" onClick={() => router.push('/menu')} className="text-red-600 font-bold hover:underline">
              Menu Utama
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

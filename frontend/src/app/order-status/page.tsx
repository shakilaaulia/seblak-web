'use client';

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Order, OrderItem } from '@/lib/types';

function OrderStatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');

  const [order, setOrder] = useState<(Order & { items: OrderItem[] }) | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const statusIndex = order
    ? order.status === 'PENDING' ? 0
      : order.status === 'PROCESSING' ? 1
      : order.status === 'READY' ? 2
      : order.status === 'COMPLETED' ? 3
      : -1
    : 0;

  const loadOrder = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
        localStorage.setItem('seblak_active_order', JSON.stringify(data));
      }
    } catch (e) {
      console.error('Error loading order:', e);
    }
  }, []);

  useEffect(() => {
    if (orderId) {
      loadOrder(orderId);
    } else {
      const stored = localStorage.getItem('seblak_active_order');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.id) {
            loadOrder(parsed.id);
          } else {
            setOrder(parsed);
          }
        } catch {}
      }
    }
  }, [orderId, loadOrder]);

  useEffect(() => {
    if (!orderId) return;
    if (order?.status === 'COMPLETED' || order?.status === 'DECLINED') return;
    const interval = setInterval(() => loadOrder(orderId), 5000);
    return () => clearInterval(interval);
  }, [orderId, loadOrder, order?.status]);

  const prevStatusRef = React.useRef(order?.status);
  useEffect(() => {
    if (order?.status === 'READY' && prevStatusRef.current !== 'READY') {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 6000);
      return () => clearTimeout(timer);
    }
    prevStatusRef.current = order?.status;
  }, [order?.status]);

  const currentOrderId = order?.orderNumber || '#SBK-000';
  const isDeclined = order?.status === 'DECLINED';
  const isCompleted = order?.status === 'COMPLETED';

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen relative font-sans text-gray-800">

      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[32px] p-8 mx-5 max-w-sm text-center shadow-2xl animate-bounceIn">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎉</span>
            </div>
            <h2 className="text-lg font-black text-gray-900 mb-2">Pesanan Siap Diambil!</h2>
            <p className="text-xs font-semibold text-gray-500 mb-1">ID Pesanan: {currentOrderId}</p>
            <p className="text-xs text-gray-400 mb-6">Yey! Silakan ambil pesanan seblak hangatmu ke kedai Mamah Zahwa</p>
            <button
              onClick={() => setShowCelebration(false)}
              className="bg-red-700 hover:bg-red-800 text-white font-black py-3 px-8 rounded-2xl text-xs uppercase tracking-wider transition-all active:scale-95"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      <header className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3.5 z-30 flex items-center justify-between">
        <button onClick={() => router.push('/menu')} className="hover:opacity-85 transition-opacity">
          <svg className="w-6 h-6 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-base font-black text-red-700 tracking-wide text-center">Pantau Pesananmu!</h1>

        <button
          onClick={() => {
            window.open(`https://wa.me/6281234567890?text=Halo%20Mamah%20Zahwa%20saya%20ingin%20tanya%20status%20pesanan%20${encodeURIComponent(currentOrderId)}`, '_blank');
          }}
          className="w-6 h-6 rounded-full bg-red-700 flex items-center justify-center text-white text-xs font-black hover:opacity-90 shadow-sm"
        >
          ?
        </button>
      </header>

      <div className="flex-1 px-5 py-8 flex flex-col items-center justify-start space-y-10">

        <div className="text-center space-y-1">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID Pesanan</p>
          <h2 className="text-3xl font-black text-red-700 tracking-wider">{currentOrderId}</h2>
        </div>

        {isDeclined ? (
          <div className="w-full max-w-sm bg-red-50 border border-red-200 rounded-3xl p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <span className="text-2xl">😔</span>
            </div>
            <h3 className="text-lg font-black text-red-700">Pesanan Ditolak</h3>
            {order?.declineReason && (
              <div className="bg-white border border-red-100 rounded-2xl p-3.5 text-left">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Alasan</p>
                <p className="text-xs font-semibold text-gray-700">{order.declineReason}</p>
              </div>
            )}
            <p className="text-xs font-semibold text-gray-500">
              Maaf, pesananmu tidak dapat diproses. Silakan hubungi Mamah Zahwa untuk info lebih lanjut.
            </p>
            <button
              onClick={() => router.push('/menu')}
              className="bg-red-700 text-white font-black py-3 px-8 rounded-2xl text-xs uppercase tracking-wider mt-2"
            >
              Pesan Lagi
            </button>
          </div>
        ) : isCompleted ? (
          <div className="w-full max-w-sm bg-emerald-50 border border-emerald-200 rounded-3xl p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="text-lg font-black text-emerald-700">Pesanan Selesai</h3>
            <p className="text-xs font-semibold text-gray-500">
              Pesananmu sudah selesai. Terima kasih sudah memesan di Seblak Mamah Zahwa!
            </p>
            <button
              onClick={() => router.push('/menu')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-8 rounded-2xl text-xs uppercase tracking-wider mt-2 active:scale-95 transition-all"
            >
              Pesan Lagi
            </button>
          </div>
        ) : (
          <>
            <div className="w-full max-w-sm space-y-0.5 relative pl-4 pr-2">

              <div className="flex items-start relative pb-10">
                <div className={`absolute top-8 left-4.5 -bottom-2 w-0.5 ${statusIndex >= 1 ? 'bg-red-600' : 'bg-gray-200'}`} />

                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 z-10 shrink-0 ${
                  statusIndex >= 1
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-600 shadow'
                    : 'bg-white border-red-700 text-red-700'
                }`}>
                  {statusIndex >= 1 ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full bg-red-700 animate-ping" />
                  )}
                </div>

                <div className="ml-4 pt-1 space-y-0.5">
                  <h3 className="text-xs font-extrabold text-gray-900 leading-none">Verifikasi Pesanan</h3>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
                    {statusIndex >= 1 ? 'SELESAI' : 'MENUNGGU VERIFIKASI'}
                  </p>
                </div>
              </div>

              <div className="flex items-start relative pb-10">
                <div className={`absolute top-8 left-4.5 -bottom-2 w-0.5 ${statusIndex >= 2 ? 'bg-red-600' : 'bg-gray-200'}`} />

                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 z-10 shrink-0 ${
                  statusIndex === 1
                    ? 'bg-red-600 border-red-700 text-white shadow-lg animate-pulse'
                    : statusIndex >= 2
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                      : 'bg-white border-gray-200 text-gray-400'
                }`}>
                  {statusIndex >= 2 ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-md">🔥</span>
                  )}
                </div>

                <div className="ml-4 flex-1">
                  {statusIndex === 1 ? (
                    <div className="bg-white border border-rose-100 rounded-2xl p-4 shadow-sm space-y-1">
                      <h3 className="text-xs font-black text-red-700">Sedang Dimasak...</h3>
                      <p className="text-[10px] font-semibold text-gray-500 leading-relaxed">
                        Chef sedang menyiapkan pesananmu
                      </p>
                    </div>
                  ) : (
                    <div className="pt-1.5 space-y-0.5">
                      <h3 className={`text-xs font-extrabold ${statusIndex >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>
                        Sedang Dimasak...
                      </h3>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
                        {statusIndex >= 2 ? 'SELESAI' : 'MENDATANG'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start relative">
                {statusIndex >= 2 ? (
                  <div className="w-9 h-9 rounded-full flex items-center justify-center border-2 z-10 shrink-0 bg-emerald-600 border-emerald-700 text-white shadow-lg animate-bounce">
                    <span className="text-sm">🏍️</span>
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-full flex items-center justify-center border-2 z-10 shrink-0 bg-white border-gray-200 text-gray-300">
                    <span className="text-sm">🏍️</span>
                  </div>
                )}

                <div className="ml-4 flex-1">
                  {statusIndex >= 2 ? (
                    <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-sm space-y-1">
                      <h3 className="text-xs font-black text-emerald-700">Siap Diambil!</h3>
                      <p className="text-[10px] font-semibold text-gray-500 leading-relaxed">
                        Yey! Silakan ambil pesanan seblak hangatmu ke kedai Mamah Zahwa
                      </p>
                    </div>
                  ) : (
                    <div className="pt-1.5 ml-0.5 space-y-0.5">
                      <h3 className="text-xs font-extrabold text-gray-400">Siap Diambil!</h3>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">MENDATANG</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            <div className="text-center pt-5">
              <p className="text-xs font-semibold text-gray-400">
                Estimasi pesanan selesai dalam 15 menit.
              </p>
            </div>
          </>
        )}

        {order && order.items && (
          <div className="w-full max-w-xs bg-white border border-gray-100 p-5 rounded-3xl shadow-sm space-y-3">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Detail Pesanan</h4>
            <div className="space-y-2">
              {order.items.slice(0, 3).map((item, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="font-bold text-gray-700">{item.productName} × {item.quantity}</span>
                  <span className="font-black text-red-600">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                </div>
              ))}
              {order.items.length > 3 && (
                <p className="text-[10px] text-gray-400 font-bold">+{order.items.length - 3} item lainnya</p>
              )}
            </div>
            <div className="border-t border-gray-100 pt-2 flex justify-between">
              <span className="text-xs font-black text-gray-700">Total</span>
              <span className="text-sm font-black text-red-700">Rp {order.totalPrice?.toLocaleString('id-ID') || 0}</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default function OrderStatusPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50"><div className="w-7 h-7 rounded-full border-2 border-red-700 border-t-transparent animate-spin" /></div>}>
      <OrderStatusContent />
    </Suspense>
  );
}

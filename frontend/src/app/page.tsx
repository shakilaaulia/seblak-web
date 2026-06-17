"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import logo from "../../assets/Logo 2.png";

interface TrackOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

const ONGOING_STATUSES = ['PENDING', 'PROCESSING', 'READY'];

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Menunggu Verifikasi',
  PROCESSING: 'Sedang Dimasak',
  READY: 'Siap Diambil',
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'text-red-600 bg-red-50',
  PROCESSING: 'text-amber-600 bg-amber-50',
  READY: 'text-emerald-600 bg-emerald-50',
};

export default function HomePage() {
  const router = useRouter();
  const [showTrack, setShowTrack] = useState(false);
  const [storeOpen, setStoreOpen] = useState(true);

  useEffect(() => {
    fetch('/api/restaurant').then(r => r.ok && r.json()).then(d => { if (d) setStoreOpen(d.isOpen); }).catch(() => {});
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [tracking, setTracking] = useState(false);
  const [trackError, setTrackError] = useState("");
  const [searchResults, setSearchResults] = useState<TrackOrder[] | null>(null);

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setTracking(true);
    setTrackError("");
    setSearchResults(null);

    try {
      const res = await fetch(`/api/orders?search=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const orders = await res.json();
        const ongoing = orders.filter((o: TrackOrder) => ONGOING_STATUSES.includes(o.status));
        if (ongoing.length === 0) {
          setTrackError("Tidak ada pesanan aktif ditemukan. Periksa kembali nomor WhatsApp.");
        } else {
          setSearchResults(ongoing);
        }
      } else {
        setTrackError("Gagal mencari pesanan. Coba lagi.");
      }
    } catch {
      setTrackError("Gagal terhubung ke server");
    } finally {
      setTracking(false);
    }
  };

  // Polling: auto-refresh search results every 5 seconds
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const pollOrders = useRef(async () => {
    if (!searchQuery.trim() || !showTrack) return;
    try {
      const res = await fetch(`/api/orders?search=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const orders = await res.json();
        const ongoing = orders.filter((o: TrackOrder) => ONGOING_STATUSES.includes(o.status));
        setSearchResults(ongoing.length > 0 ? ongoing : null);
        if (ongoing.length === 0) {
          setTrackError("Semua pesanan sudah selesai.");
          if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
        }
      }
    } catch {}
  });

  useEffect(() => {
    if (showTrack && searchResults && searchResults.length > 0) {
      pollRef.current = setInterval(() => pollOrders.current(), 5000);
    }
    return () => {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    };
  }, [showTrack, searchResults]);

  return (
    <div className="flex-1 flex flex-col justify-between items-center px-8 py-12 bg-gradient-to-b from-rose-50 via-white to-amber-50/50 min-h-screen">
      <div></div>

      <div className="w-full flex flex-col items-center text-center space-y-8 my-auto">
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center mb-2">
            <img src={logo.src} alt="Logo Seblak Mamah Zahwa" className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 object-contain" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-red-700 tracking-tight">
            Seblak Mamah Zahwa
          </h1>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            Seblak, Makanan, dan Minuman kekinian dengan cita rasa khas rumahan.
          </p>
        </div>

        <div className="w-full space-y-4">
          <button
            onClick={() => router.push('/menu')}
            disabled={!storeOpen}
            className={`w-full font-bold py-4 px-6 rounded-2xl shadow-lg transition-all text-lg ${
              storeOpen
                ? "bg-red-700 hover:bg-red-800 text-white shadow-red-700/10 active:scale-[0.98]"
                : "bg-gray-400 text-gray-200 cursor-not-allowed"
            }`}
          >
            {storeOpen ? "Mulai Pesan" : "🔒 Toko Tutup"}
          </button>

          <button
            onClick={() => { setShowTrack(true); setSearchResults(null); setSearchQuery(""); setTrackError(""); }}
            className="w-full bg-white hover:bg-gray-50 text-gray-600 font-semibold py-3 px-6 rounded-2xl border border-gray-200 active:scale-[0.98] transition-all text-sm"
          >
            Lacak Pesanan
          </button>
        </div>
      </div>

      {/* Track Order Modal */}
      {showTrack && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6" onClick={() => setShowTrack(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-black text-gray-900 text-center mb-1">Lacak Pesanan</h2>
            <p className="text-xs text-gray-400 text-center mb-5">Masukkan nomor WhatsApp yang digunakan saat checkout</p>

            <form onSubmit={handleTrackOrder} className="space-y-4">
              <input
                type="tel"
                className="w-full bg-gray-50 border border-transparent rounded-2xl px-4 py-3 text-sm font-semibold outline-none focus:bg-white focus:border-red-500 transition-all text-gray-700"
                placeholder="Nomor WhatsApp"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value.replace(/\D/g, '')); setSearchResults(null); setTrackError(""); }}
                autoFocus
              />

              {trackError && (
                <p className="text-xs font-bold text-red-600 text-center">{trackError}</p>
              )}

              <button
                type="submit"
                disabled={tracking || !searchQuery.trim()}
                className="w-full bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-2xl text-sm active:scale-[0.98] transition-all"
              >
                {tracking ? "Mencari..." : "Cari Pesanan"}
              </button>
            </form>

            {/* Search Results */}
            {searchResults && searchResults.length > 0 && (
              <div className="mt-5 space-y-3 overflow-y-auto flex-1">
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    {searchResults.length} pesanan aktif
                  </p>
                </div>
                {searchResults.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => { setShowTrack(false); router.push(`/order-status?id=${order.id}`); }}
                    className="w-full text-left bg-gray-50 hover:bg-red-50 border border-gray-100 hover:border-red-200 rounded-2xl p-4 transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-black text-gray-900 text-sm">{order.orderNumber}</span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${STATUS_COLOR[order.status] || 'text-gray-500 bg-gray-100'}`}>
                        {STATUS_LABEL[order.status] || order.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500">{order.customerName}</span>
                      <span className="text-xs font-black text-red-600">Rp {order.totalPrice.toLocaleString('id-ID')}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowTrack(false)}
              className="w-full text-gray-400 font-semibold text-xs py-3 mt-4 hover:text-gray-600 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-xs text-center">
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Dengan memesan, kamu menyetujui{" "}
          <span className="text-red-600 font-semibold cursor-pointer hover:underline">
            Syarat & Ketentuan
          </span>{" "}
          serta{" "}
          <span className="text-gray-500 cursor-pointer hover:underline">
            Kebijakan Privasi
          </span>
          .
        </p>
      </div>
    </div>
  );
}

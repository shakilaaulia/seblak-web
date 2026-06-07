"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import logo1 from "../../../assets/Logo 1.png";
import type { OrderStatus } from "@/lib/types";

interface DashboardOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  totalPrice: number;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  paymentProofUrl?: string;
  paymentProofFileName?: string;
  items?: { productName: string; quantity: number; price: number; subtotal: number }[];
}

interface StockItem {
  id: string;
  name: string;
  remaining: number;
  unit: string;
  minWarning: number;
}

interface RevenueRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  time: string;
  items: { name: string; qty: number; price: number; customization?: string }[];
  orderNotes?: string;
  paymentMethod: string;
}

interface DashboardSummary {
  totalOrdersToday: number;
  pendingOrders: number;
  processingOrders: number;
  completedToday: number;
  totalRevenueToday: number;
}

type TabId = "orders" | "stock" | "revenue" | "settings";

const STATUS_ACTIONS: Record<OrderStatus, { label: string; action: string; color: string }[]> = {
  PENDING: [
    { label: 'Tolak', action: 'decline', color: 'bg-gray-50 border-gray-100 text-gray-700' },
    { label: 'Verifikasi', action: 'approve', color: 'bg-red-700 text-white' },
  ],
  PROCESSING: [
    { label: 'Selesai Masak', action: 'ready', color: 'bg-amber-500 text-white' },
  ],
  READY: [
    { label: 'Selesaikan', action: 'complete', color: 'bg-emerald-600 text-white' },
  ],
  COMPLETED: [],
  DECLINED: [],
};

export default function SellerDashboard() {
  const router = useRouter();

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [summary, setSummary] = useState<DashboardSummary>({
    totalOrdersToday: 0,
    pendingOrders: 0,
    processingOrders: 0,
    completedToday: 0,
    totalRevenueToday: 0,
  });
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("orders");
  const [loading, setLoading] = useState(true);

  // Payment proof preview
  const [paymentProofPreview, setPaymentProofPreview] = useState<{ url: string; name: string; orderId: string } | null>(null);

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error('Error fetching orders:', e);
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/sum');
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (e) {
      console.error('Error fetching summary:', e);
    }
  }, []);

  useEffect(() => {
    setIsClient(true);
    Promise.all([fetchOrders(), fetchSummary()]).finally(() => setLoading(false));
  }, [fetchOrders, fetchSummary]);

  // Poll every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders();
      fetchSummary();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders, fetchSummary]);

  const handleOrderAction = async (orderId: string, action: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        await fetchOrders();
        await fetchSummary();

        const actionLabels: Record<string, string> = {
          approve: '✅ Pesanan diverifikasi, sedang dimasak...',
          ready: '🍽️ Pesanan siap diambil!',
          complete: '✅ Pesanan selesai',
          decline: '✕ Pesanan ditolak',
        };
        showToast(actionLabels[action] || 'Berhasil', 'success');
      } else {
        showToast('Gagal memperbarui pesanan', 'error');
      }
    } catch {
      showToast('Gagal terhubung ke server', 'error');
    }
  };

  // --- STOCK STATE ---
  const [stockItems, setStockItems] = useState<StockItem[]>([
    { id: "s1", name: "Kerupuk Oren", remaining: 5, unit: "porsi", minWarning: 3 },
    { id: "s2", name: "Cireng", remaining: 10, unit: "porsi", minWarning: 5 },
    { id: "s3", name: "Ceker Ayam", remaining: 8, unit: "porsi", minWarning: 4 },
    { id: "s4", name: "Sosis", remaining: 12, unit: "porsi", minWarning: 5 },
    { id: "s5", name: "Siomay", remaining: 6, unit: "porsi", minWarning: 3 },
    { id: "s6", name: "Makaroni", remaining: 15, unit: "porsi", minWarning: 5 },
    { id: "s7", name: "Telur Puyuh", remaining: 20, unit: "butir", minWarning: 10 },
    { id: "s8", name: "Mie", remaining: 9, unit: "bungkus", minWarning: 5 },
  ]);

  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editStockValue, setEditStockValue] = useState<number>(0);

  const handleStockEdit = (id: string) => {
    const item = stockItems.find(s => s.id === id);
    if (item) {
      setEditingStockId(id);
      setEditStockValue(item.remaining);
    }
  };

  const handleStockSave = (id: string) => {
    setStockItems(prev => prev.map(s => (s.id === id ? { ...s, remaining: Math.max(0, editStockValue) } : s)));
    setEditingStockId(null);
    showToast("Stok berhasil diperbarui", "success");
  };

  const handleStockAdjust = (id: string, delta: number) => {
    setStockItems(prev => prev.map(s => (s.id === id ? { ...s, remaining: Math.max(0, s.remaining + delta) } : s)));
  };

  // --- REVENUE STATE ---
  const revenueRecords: RevenueRecord[] = orders
    .filter(o => o.status === 'COMPLETED')
    .map(o => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      amount: o.totalPrice,
      time: new Date(o.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      paymentMethod: 'QRIS',
      items: (o.items || []).map(i => ({
        name: i.productName,
        qty: i.quantity,
        price: i.price,
      })),
      orderNotes: o.notes,
    }));

  const totalRevenue = revenueRecords.reduce((sum, r) => sum + r.amount, 0);

  const [selectedRevenue, setSelectedRevenue] = useState<RevenueRecord | null>(null);

  // --- SETTINGS STATE ---
  const [storeSettings, setStoreSettings] = useState({
    storeName: "Seblak Mamah Zahwa",
    whatsapp: "6281234567890",
    address: "Jl. Pedas Manis No. 10, Bandung",
    openHour: "09:00",
    closeHour: "21:00",
    qrisName: "SEBLAK MAMAH ZAHWA",
  });

  const pendingCount = orders.filter(o => o.status === 'PENDING').length;
  const processingCount = orders.filter(o => o.status === 'PROCESSING').length;

  if (!isClient) return null;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen pb-24 relative select-none">
      {toast && (
        <div className={`fixed top-5 inset-x-4 z-50 text-xs text-center py-3.5 px-5 rounded-xl shadow-2xl font-bold transition-all animate-bounce ${
          toast.type === "success" ? "bg-emerald-700 text-white" :
          toast.type === "error" ? "bg-red-700 text-white" : "bg-gray-900 text-white"
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 bg-red-800 text-white flex items-center justify-between px-4 py-3.5 shadow-md z-30">
        <button onClick={() => router.push("/")} className="hover:opacity-80 transition-opacity">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <img src={logo1.src} alt="Seblak Mamah Zahwa" className="h-8 sm:h-10 md:h-12 object-contain" />
        <div className="relative">
          <div className="w-8 h-8 rounded-full border border-red-400 bg-red-600 flex items-center justify-center text-xs font-bold shadow-inner">P</div>
          {(pendingCount + processingCount) > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-red-800">
              {pendingCount + processingCount}
            </span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        <div className="flex items-baseline justify-between">
          <h1 className="text-xl font-bold text-red-700 tracking-tight">Ringkasan Dapur</h1>
          <span className="text-xs text-gray-400 font-semibold">Hari ini</span>
        </div>

        {/* Stats Cards */}
        <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-none">
          <div className="bg-white border border-rose-100/50 rounded-2xl p-4 shadow-sm min-w-[120px] flex-1 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Pesanan Hari Ini</span>
            <span className="text-2xl font-black text-gray-900">{summary.totalOrdersToday}</span>
          </div>
          <div className="bg-white border border-rose-100/50 rounded-2xl p-4 shadow-sm min-w-[120px] flex-1 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-2">Pending</span>
            <span className="text-2xl font-black text-red-600">{summary.pendingOrders}</span>
          </div>
          <div className="bg-amber-500 rounded-2xl p-4 shadow-sm min-w-[120px] flex-1 flex flex-col justify-between text-white">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-100 mb-2">Processing</span>
            <span className="text-2xl font-black text-white">{summary.processingOrders}</span>
          </div>
        </div>

        {/* Revenue Banner */}
        <div className="relative bg-gradient-to-r from-red-700 to-red-800 text-white rounded-2xl p-5 shadow-md overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none transform translate-x-8 -translate-y-8">
            <svg viewBox="0 0 100 100" fill="currentColor"><rect x="10" y="10" width="80" height="80" rx="15" /></svg>
          </div>
          <div className="space-y-1 relative z-10">
            <p className="text-[11px] font-bold text-red-200 uppercase tracking-widest">Pendapatan Hari Ini</p>
            <h2 className="text-2xl font-black tracking-tight">Rp {summary.totalRevenueToday.toLocaleString('id-ID')}</h2>
          </div>
        </div>

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-red-700 tracking-tight">Pesanan</h3>
              <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{orders.length} pesanan</span>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm">Memuat...</div>
              ) : orders.length === 0 ? (
                <div className="bg-white border border-rose-100 rounded-2xl p-8 text-center text-gray-400 text-sm">Belum ada pesanan 📋</div>
              ) : (
                orders.map((order) => {
                  const statusLabel: Record<OrderStatus, string> = {
                    PENDING: 'Menunggu Verifikasi',
                    PROCESSING: 'Sedang Dimasak',
                    READY: 'Siap Diambil',
                    COMPLETED: 'Selesai',
                    DECLINED: 'Ditolak',
                  };
                  const statusColor: Record<OrderStatus, string> = {
                    PENDING: 'bg-rose-50 text-red-600',
                    PROCESSING: 'bg-amber-50 text-amber-600',
                    READY: 'bg-emerald-50 text-emerald-600',
                    COMPLETED: 'bg-gray-50 text-gray-600',
                    DECLINED: 'bg-gray-100 text-gray-500',
                  };
                  const borderColor: Record<OrderStatus, string> = {
                    PENDING: 'border-l-red-600',
                    PROCESSING: 'border-l-amber-500',
                    READY: 'border-l-emerald-500',
                    COMPLETED: 'border-l-gray-400',
                    DECLINED: 'border-l-gray-300',
                  };

                  return (
                    <div key={order.id} className={`bg-white border-l-4 rounded-2xl p-4 shadow-sm border border-rose-50/50 flex flex-col space-y-3.5 transition-all ${borderColor[order.status]}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor[order.status]}`}>{order.orderNumber}</span>
                          <span className="text-[9px] text-gray-400 font-bold">— {order.customerName}</span>
                        </div>
                        <span className="font-bold text-red-600 text-sm">Rp {order.totalPrice.toLocaleString('id-ID')}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${statusColor[order.status]}`}>{statusLabel[order.status]}</span>
                        {order.notes && <span className="text-[9px] text-gray-400">📝 {order.notes}</span>}
                      </div>

                      {/* Items summary */}
                      {order.items && order.items.length > 0 && (
                        <div className="text-[10px] text-gray-500 font-semibold">
                          {order.items.map((item, i) => (
                            <span key={i}>{item.productName} × {item.quantity}{i < order.items!.length - 1 ? ', ' : ''}</span>
                          ))}
                        </div>
                      )}

                      {/* Payment Proof for PENDING */}
                      {order.status === 'PENDING' && order.paymentProofUrl && (
                        <div className="bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-2.5 flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-10 rounded-lg overflow-hidden border border-amber-200 bg-white flex-shrink-0">
                              <img src={order.paymentProofUrl} alt="Bukti TF" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[10px] font-bold text-amber-800">{order.paymentProofFileName || 'Bukti Transfer'}</span>
                          </div>
                          <button onClick={() => setPaymentProofPreview({ url: order.paymentProofUrl!, name: order.paymentProofFileName || 'Bukti Transfer', orderId: order.id })} className="text-[10px] font-black text-red-700 hover:underline">Lihat</button>
                        </div>
                      )}

                      {/* Action Buttons */}
                      {STATUS_ACTIONS[order.status]?.length > 0 && (
                        <div className="flex items-center space-x-2 pt-1 border-t border-gray-50">
                          {STATUS_ACTIONS[order.status].map((btn) => (
                            <button
                              key={btn.action}
                              onClick={() => handleOrderAction(order.id, btn.action)}
                              className={`flex-1 ${btn.color} font-bold py-2.5 px-4 rounded-xl text-xs active:scale-[0.98] transition-all flex items-center justify-center space-x-1 shadow-sm`}
                            >
                              {btn.action === 'approve' && <span>✓</span>}
                              {btn.action === 'decline' && <span>✕</span>}
                              {btn.action === 'ready' && <span>🔥</span>}
                              {btn.action === 'complete' && <span>✅</span>}
                              <span>{btn.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* STOCK TAB (sama seperti sebelumnya) */}
        {activeTab === "stock" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-red-700 tracking-tight">Manajemen Stok</h3>
              <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{stockItems.filter(s => s.remaining <= s.minWarning).length} hampir habis</span>
            </div>
            <div className="space-y-2.5">
              {stockItems.map((item) => {
                const isLow = item.remaining <= item.minWarning;
                const isEditing = editingStockId === item.id;
                return (
                  <div key={item.id} className={`bg-white rounded-2xl p-4 shadow-sm border transition-all ${isLow ? "border-red-200 border-l-4 border-l-red-500" : "border-rose-50/50"}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
                        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Satuan: {item.unit}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        {isEditing ? (
                          <div className="flex items-center space-x-2">
                            <input type="number" className="w-20 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-center outline-none focus:border-red-500" value={editStockValue} onChange={(e) => setEditStockValue(Math.max(0, parseInt(e.target.value) || 0))} min={0} />
                            <button onClick={() => handleStockSave(item.id)} className="bg-red-700 text-white font-black text-[10px] px-3 py-2 rounded-xl hover:bg-red-800 active:scale-95">Simpan</button>
                            <button onClick={() => setEditingStockId(null)} className="bg-gray-100 text-gray-500 font-bold text-[10px] px-3 py-2 rounded-xl hover:bg-gray-200 active:scale-95">Batal</button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center space-x-2.5">
                              <button onClick={() => handleStockAdjust(item.id, -1)} className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 font-extrabold text-xs active:scale-90">-</button>
                              <span className={`text-sm font-black min-w-[40px] text-center ${isLow ? "text-red-600" : "text-gray-800"}`}>{item.remaining}</span>
                              <button onClick={() => handleStockAdjust(item.id, 1)} className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white font-extrabold text-xs active:scale-90">+</button>
                            </div>
                            <button onClick={() => handleStockEdit(item.id)} className="text-[9px] font-bold text-red-600 hover:underline ml-1">Edit</button>
                          </>
                        )}
                      </div>
                    </div>
                    {isLow && !isEditing && <p className="text-[9px] font-bold text-red-600 mt-2 bg-red-50 px-3 py-1 rounded-lg inline-block">⚠️ Stok menipis! Segera restock.</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* REVENUE TAB */}
        {activeTab === "revenue" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-red-700 tracking-tight">Pendapatan</h3>
              <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{revenueRecords.length} transaksi</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-rose-100/50 rounded-2xl p-4 shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Pendapatan</p>
                <p className="text-xl font-black text-red-700 mt-1">Rp {totalRevenue.toLocaleString('id-ID')}</p>
              </div>
              <div className="bg-white border border-rose-100/50 rounded-2xl p-4 shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Transaksi Selesai</p>
                <p className="text-xl font-black text-gray-900 mt-1">{revenueRecords.length}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-rose-50/50 shadow-sm">
              <h4 className="text-xs font-black text-gray-800 mb-4">Riwayat Transaksi</h4>
              <div className="space-y-3">
                {revenueRecords.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">Belum ada transaksi selesai</p>
                ) : (
                  revenueRecords.map((record) => {
                    const maxAmount = Math.max(...revenueRecords.map(r => r.amount), 1);
                    const barWidth = (record.amount / maxAmount) * 100;
                    return (
                      <button key={record.id} onClick={() => setSelectedRevenue(record)} className="w-full text-left space-y-1 group">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-gray-700 group-hover:text-red-700 transition-colors">{record.orderNumber}</span>
                            <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{record.customerName}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] text-gray-400">{record.time}</span>
                            <span className="font-black text-red-600">Rp {record.amount.toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-red-600 to-amber-500 transition-all group-hover:from-red-500 group-hover:to-amber-400" style={{ width: `${barWidth}%` }} />
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div className="space-y-4">
            <h3 className="font-bold text-red-700 tracking-tight">Pengaturan Toko</h3>
            <div className="bg-white rounded-2xl p-5 border border-rose-50/50 shadow-sm space-y-5">
              {[
                { label: "Nama Toko", value: storeSettings.storeName, key: "storeName" },
                { label: "Nomor WhatsApp", value: storeSettings.whatsapp, key: "whatsapp" },
                { label: "Alamat", value: storeSettings.address, key: "address" },
                { label: "Nama QRIS", value: storeSettings.qrisName, key: "qrisName" },
              ].map((field: any) => (
                <div key={field.key}>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">{field.label}</label>
                  <input type="text" className="w-full bg-gray-50 border border-transparent rounded-2xl px-4 py-3 text-xs font-semibold outline-none focus:bg-white focus:border-red-500 transition-all text-gray-700" value={field.value} onChange={(e) => setStoreSettings((prev: any) => ({ ...prev, [field.key]: e.target.value }))} />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Buka</label>
                  <input type="time" className="w-full bg-gray-50 border border-transparent rounded-2xl px-4 py-3 text-xs font-semibold outline-none focus:bg-white focus:border-red-500 transition-all text-gray-700" value={storeSettings.openHour} onChange={(e) => setStoreSettings(prev => ({ ...prev, openHour: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Tutup</label>
                  <input type="time" className="w-full bg-gray-50 border border-transparent rounded-2xl px-4 py-3 text-xs font-semibold outline-none focus:bg-white focus:border-red-500 transition-all text-gray-700" value={storeSettings.closeHour} onChange={(e) => setStoreSettings(prev => ({ ...prev, closeHour: e.target.value }))} />
                </div>
              </div>
              <button onClick={() => showToast("Pengaturan berhasil disimpan", "success")} className="w-full bg-red-700 hover:bg-red-800 text-white font-black py-3.5 px-6 rounded-2xl text-xs tracking-wider active:scale-[0.98] transition-all">Simpan Pengaturan</button>
            </div>
          </div>
        )}
      </div>

      {/* Revenue Detail Modal */}
      {selectedRevenue && (
        <div className="fixed inset-0 bg-black/60 z-50 flex flex-col justify-end" onClick={() => setSelectedRevenue(null)}>
          <div className="flex-1" />
          <div className="bg-white rounded-t-[32px] shadow-2xl flex flex-col max-h-[80vh] w-full overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-black text-gray-900">Detail Transaksi</h2>
              <button onClick={() => setSelectedRevenue(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">ID Pesanan</p>
                    <h3 className="text-lg font-black text-red-700 mt-0.5">{selectedRevenue.orderNumber}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Waktu</p>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">{selectedRevenue.time}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-black">{selectedRevenue.customerName.charAt(0).toUpperCase()}</div>
                <div>
                  <p className="text-xs font-black text-gray-900">{selectedRevenue.customerName}</p>
                  <p className="text-[10px] text-gray-400 font-bold mt-0.5">Pembayaran: {selectedRevenue.paymentMethod}</p>
                </div>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-2 shadow-sm">
                <div className="px-3 py-2 border-b border-gray-50"><p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Pesanan ({selectedRevenue.items.length} item)</p></div>
                <div className="divide-y divide-gray-50">
                  {selectedRevenue.items.map((item, i) => (
                    <div key={i} className="px-3 py-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 pr-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-gray-900 text-sm">{item.name}</span>
                            <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{item.qty}x</span>
                          </div>
                          {item.customization && <p className="text-[9px] text-gray-400 font-bold mt-1">{item.customization}</p>}
                        </div>
                        <span className="font-black text-red-600 text-xs shrink-0">Rp {(item.price * item.qty).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {selectedRevenue.orderNotes && (
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start space-x-2.5">
                    <span className="text-sm">📝</span>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Catatan</p>
                      <p className="text-xs font-semibold text-gray-700 mt-1">{selectedRevenue.orderNotes}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-red-700 rounded-2xl p-5 text-white flex items-center justify-between shadow-lg">
                <p className="text-sm font-black uppercase tracking-wider">Total Pembayaran</p>
                <p className="text-xl font-black">Rp {selectedRevenue.amount.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Proof Preview Modal */}
      {paymentProofPreview && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6" onClick={() => setPaymentProofPreview(null)}>
          <div className="relative max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setPaymentProofPreview(null)} className="absolute -top-10 right-0 text-white/80 hover:text-white text-xs font-bold bg-white/10 px-3 py-1.5 rounded-full">Tutup ✕</button>
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
              <div className="bg-red-50 px-4 py-3 border-b border-red-100 flex items-center justify-between">
                <p className="text-xs font-black text-gray-700">Bukti Transfer</p>
                <p className="text-[9px] font-bold text-gray-400 truncate max-w-[150px]">{paymentProofPreview.name}</p>
              </div>
              <img src={paymentProofPreview.url} alt={paymentProofPreview.name} className="w-full h-auto object-contain max-h-[70vh]" />
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-center">
                <button onClick={() => { const id = paymentProofPreview.orderId; setPaymentProofPreview(null); handleOrderAction(id, 'approve'); }} className="bg-red-700 text-white font-black py-2 px-6 rounded-xl text-xs active:scale-95 transition-all">Verifikasi Sekarang</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 py-3 px-4 flex justify-between items-center z-10">
        {([
          { id: "orders" as TabId, label: "Orders", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
          { id: "stock" as TabId, label: "Stock", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> },
          { id: "revenue" as TabId, label: "Revenue", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
          { id: "settings" as TabId, label: "Settings", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
        ]).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex flex-col items-center justify-center space-y-1 py-1 rounded-xl transition-all relative ${isActive ? "bg-red-700 text-white font-bold p-2" : "text-gray-400 font-medium"}`}>
              <div className="relative">
                {tab.icon}
                {tab.id === "orders" && pendingCount > 0 && !isActive && (
                  <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[7px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">{pendingCount}</span>
                )}
              </div>
              <span className="text-[10px]">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

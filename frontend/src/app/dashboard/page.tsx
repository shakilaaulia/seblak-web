"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import logo1 from "../../../assets/Logo 1.png";

interface Order {
  id: string;
  title: string;
  price: string;
  toppings: string;
  status: "pending" | "cooking";
  color: "red" | "orange";
}

interface StockItem {
  name: string;
  remaining: number;
  color: "red" | "orange";
}

export default function SellerDashboard() {
  const router = useRouter();

  // Interactive mock state
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "#SBK-024",
      title: "Seblak Campur Pedas Gila",
      price: "Rp 25.000",
      toppings: "Topping: Kerupuk Oren, Makaroni, Sosis, Telur Puyuh",
      status: "pending",
      color: "red",
    },
    {
      id: "#SBK-023",
      title: "Seblak Ceker Biasa",
      price: "Rp 18.000",
      toppings: "Topping: Ceker, Kerupuk Bawang",
      status: "cooking",
      color: "orange",
    },
  ]);

  const [stock, setStock] = useState<StockItem[]>([
    { name: "Kerupuk Oren", remaining: 5, color: "red" },
    { name: "Cireng", remaining: 10, color: "orange" },
  ]);

  const [activeTab, setActiveTab] = useState<
    "orders" | "stock" | "revenue" | "settings"
  >("orders");

  const handleVerifyOrder = (id: string) => {
    setOrders(
      orders.map((order) =>
        order.id === id
          ? { ...order, status: "cooking", color: "orange" }
          : order,
      ),
    );
  };

  const handleRejectOrder = (id: string) => {
    setOrders(orders.filter((order) => order.id !== id));
  };

  const handleFinishCooking = (id: string) => {
    setOrders(orders.filter((order) => order.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen pb-24 relative select-none">
      {/* Red Header Bar */}
      <header className="sticky top-0 bg-red-800 text-white flex items-center justify-between px-4 py-3.5 shadow-md z-20">
        <button
          onClick={() => router.push("/")}
          className="hover:opacity-80 transition-opacity"
        >
          {/* Hamburger Menu Icon */}
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <img src={logo1.src} alt="Seblak Mamah Zahwa" className="h-8 sm:h-10 md:h-12 object-contain" />
        <div className="w-8 h-8 rounded-full border border-red-400 bg-red-600 flex items-center justify-center text-xs font-bold shadow-inner">
          P
        </div>
      </header>

      {/* Main Content Scrollable */}
      <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        {/* Title Ringkasan Dapur */}
        <div className="flex items-baseline justify-between">
          <h1 className="text-xl font-bold text-red-700 tracking-tight">
            Ringkasan Dapur
          </h1>
          <span className="text-xs text-gray-400 font-semibold">Hari ini</span>
        </div>

        {/* Horizontal scroll grid of stats */}
        <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-none">
          {/* Stat 1 */}
          <div className="bg-white border border-rose-100/50 rounded-2xl p-4 shadow-sm min-w-[130px] flex-1 flex flex-col justify-between">
            <div className="flex items-center space-x-1.5 text-gray-500 mb-2">
              {/* <span className="text-amber-500 text-sm">🔥</span> */}
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Total Pesanan
              </span>
            </div>
            <span className="text-2xl font-black text-gray-900">42</span>
          </div>

          {/* Stat 2 */}
          <div className="bg-white border border-rose-100/50 rounded-2xl p-4 shadow-sm min-w-[130px] flex-1 flex flex-col justify-between">
            <div className="flex items-center space-x-1.5 text-red-500 mb-2">
              {/* <span className="text-sm">⚠️</span> */}
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">
                Menunggu Verifikasi
              </span>
            </div>
            <span className="text-2xl font-black text-red-600">5</span>
          </div>

          {/* Stat 3 */}
          <div className="bg-red-800 rounded-2xl p-4 shadow-sm min-w-[130px] flex-1 flex flex-col justify-between text-white">
            <div className="flex items-center space-x-1.5 mb-2">
              {/* <span className="text-sm">✓</span> */}
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-200">
                Selesai
              </span>
            </div>
            <span className="text-2xl font-black text-white">12</span>
          </div>
        </div>

        {/* Pendapatan Banner Card */}
        <div className="relative bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl p-5 shadow-md shadow-amber-500/10 overflow-hidden">
          {/* Background Decorative Pattern */}
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none transform translate-x-8 -translate-y-8">
            <svg viewBox="0 0 100 100" fill="currentColor">
              <rect x="10" y="10" width="80" height="80" rx="15" />
            </svg>
          </div>

          <div className="space-y-1 relative z-10">
            <p className="text-[11px] font-bold text-amber-100 uppercase tracking-widest">
              Pendapatan Hari Ini
            </p>
            <h2 className="text-2xl font-black tracking-tight">Rp 1.250.000</h2>
          </div>
        </div>

        {/* Pesanan Aktif Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-red-700 tracking-tight">
              Pesanan Aktif
            </h3>
            <button className="flex items-center space-x-1 text-xs font-semibold text-amber-500 hover:text-amber-600">
              <span>Lihat Semua</span>
              <span>→</span>
            </button>
          </div>

          {/* Active Orders List */}
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="bg-white border border-rose-100 rounded-2xl p-8 text-center text-gray-400 text-sm">
                Semua pesanan selesai dimasak! 🎉
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className={`bg-white border-l-4 rounded-2xl p-4 shadow-sm border border-rose-50/50 flex flex-col space-y-3.5 transition-all ${
                    order.color === "red"
                      ? "border-l-red-600"
                      : "border-l-amber-500"
                  }`}
                >
                  {/* Order Card Header */}
                  <div className="flex justify-between items-start">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        order.color === "red"
                          ? "bg-rose-50 text-red-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {order.id}
                    </span>
                    <span className="font-bold text-red-600 text-sm">
                      {order.price}
                    </span>
                  </div>

                  {/* Title and toppings */}
                  <div className="space-y-1">
                    <h4 className="font-bold text-gray-900 text-[15px]">
                      {order.title}
                    </h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {order.toppings}
                    </p>
                  </div>

                  {/* Interactive Action Buttons */}
                  <div className="flex items-center space-x-2 pt-1 border-t border-gray-50">
                    {order.status === "pending" ? (
                      <>
                        <button
                          onClick={() => handleRejectOrder(order.id)}
                          className="flex-1 bg-gray-50 border border-gray-100 text-gray-700 font-bold py-2.5 px-4 rounded-xl text-xs hover:bg-gray-100 active:scale-[0.98] transition-all flex items-center justify-center space-x-1"
                        >
                          <span>✕</span>
                          <span>Tolak</span>
                        </button>
                        <button
                          onClick={() => handleVerifyOrder(order.id)}
                          className="flex-1 bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs hover:bg-red-800 active:scale-[0.98] transition-all flex items-center justify-center space-x-1 shadow-sm shadow-red-700/10"
                        >
                          <span>✓</span>
                          <span>Verifikasi</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleFinishCooking(order.id)}
                        className="w-full bg-amber-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs hover:bg-amber-600 active:scale-[0.98] transition-all flex items-center justify-center space-x-1.5 shadow-sm shadow-amber-500/10"
                      >
                        {/* Pot / Cooking SVG */}
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                          />
                        </svg>
                        <span>Selesai Masak</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Stok Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-1.5">
            {/* <span className="text-red-500">s */}
            <h3 className="font-bold text-red-700 tracking-tight">Stok</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {stock.map((item, index) => (
              <div
                key={index}
                className="bg-white border border-rose-100/50 rounded-2xl p-3.5 shadow-sm flex items-center justify-between"
              >
                <span className="font-bold text-gray-800 text-xs">
                  {item.name}
                </span>
                <span
                  className={`text-[9px] font-black px-2 py-1 rounded-lg text-white ${
                    item.color === "red" ? "bg-red-700" : "bg-amber-500"
                  }`}
                >
                  Sisa {item.remaining} Porsi
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation Drawer */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 py-3 px-4 flex justify-between items-center z-10">
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex-1 flex flex-col items-center justify-center space-y-1 py-1 rounded-xl transition-all ${
            activeTab === "orders"
              ? "bg-red-700 text-white font-bold p-2"
              : "text-gray-400 font-medium"
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <span className="text-[10px]">Orders</span>
        </button>

        <button
          onClick={() => setActiveTab("stock")}
          className={`flex-1 flex flex-col items-center justify-center space-y-1 py-1 rounded-xl transition-all ${
            activeTab === "stock"
              ? "bg-red-700 text-white font-bold p-2"
              : "text-gray-400 font-medium"
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <span className="text-[10px]">Stock</span>
        </button>

        <button
          onClick={() => setActiveTab("revenue")}
          className={`flex-1 flex flex-col items-center justify-center space-y-1 py-1 rounded-xl transition-all ${
            activeTab === "revenue"
              ? "bg-red-700 text-white font-bold p-2"
              : "text-gray-400 font-medium"
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-[10px]">Revenue</span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-1 flex flex-col items-center justify-center space-y-1 py-1 rounded-xl transition-all ${
            activeTab === "settings"
              ? "bg-red-700 text-white font-bold p-2"
              : "text-gray-400 font-medium"
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="text-[10px]">Settings</span>
        </button>
      </nav>
    </div>
  );
}

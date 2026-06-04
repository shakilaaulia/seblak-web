'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import logo1 from '../../../assets/Logo 1.png';

interface CartItem {
  id: string;
  name: string;
  description1: string;
  description2: string;
  price: number;
}

export default function CartPage() {
  const router = useRouter();
  
  // Interactive mock state for the cart
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 'c1',
      name: 'Seblak 1',
      description1: 'Pedes, Kuah Banjir',
      description2: 'Topping: Ceker, Bakso',
      price: 25000,
    },
    {
      id: 'c2',
      name: 'Cilok Goang (2 porsi)',
      description1: 'Porsi jumbo, kuah segar',
      description2: '',
      price: 16000,
    },
    {
      id: 'c3',
      name: 'Teh Tarik',
      description1: 'Es, Gula Aren',
      description2: '',
      price: 4000,
    },
  ]);

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price, 0);
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const handleCheckout = () => {
    // Navigate to status page with custom transition
    router.push('/order-status');
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-red-900 to-red-950 min-h-screen pb-24 relative select-none text-white">
      {/* Header bar */}
      <header className="sticky top-0 bg-red-950/40 backdrop-blur border-b border-red-800/30 text-white flex items-center justify-between px-4 py-3.5 z-20">
        <button onClick={() => router.push('/menu')} className="hover:opacity-80 transition-opacity">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <img src={logo1.src} alt="Seblak Mamah Zahwa" className="h-7 sm:h-9 md:h-11 object-contain" />
        <button onClick={handleClearCart} className="hover:opacity-85 transition-opacity p-1">
          {/* Trash Can SVG */}
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </header>

      {/* Main content scroll area */}
      <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        <h2 className="text-xs font-black italic tracking-widest text-red-200 uppercase">
          RINGKASAN PESANAN
        </h2>

        {/* Item List */}
        <div className="space-y-3.5">
          {cartItems.length === 0 ? (
            <div className="bg-white/5 border border-white/10 backdrop-blur rounded-2xl p-12 text-center text-red-200/50 text-sm">
              Keranjang kosong. Yuk tambah seblak! 🥣
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 shadow-xl flex items-center justify-between border border-white/5 relative group transition-all"
              >
                {/* Text Details (Dark gray/black text like in image) */}
                <div className="space-y-1 pr-6">
                  <h3 className="font-extrabold text-gray-900 text-sm leading-tight">{item.name}</h3>
                  {item.description1 && (
                    <p className="text-[10px] text-gray-400 font-bold leading-normal">{item.description1}</p>
                  )}
                  {item.description2 && (
                    <p className="text-[10px] text-gray-400 font-bold leading-normal">{item.description2}</p>
                  )}
                </div>

                {/* Price and actions */}
                <div className="flex flex-col items-end space-y-2">
                  <span className="font-black text-red-600 text-sm">
                    Rp {item.price.toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-[10px] text-gray-400 hover:text-red-600 font-semibold transition-colors"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Total and Checkout Block */}
        {cartItems.length > 0 && (
          <div className="bg-black/30 backdrop-blur border border-white/10 rounded-2xl p-5 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-red-200 tracking-wider uppercase">
                TOTAL HARGA :
              </span>
              <span className="text-xl font-black tracking-tight text-white">
                Rp {calculateTotal().toLocaleString()}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] transition-all text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-red-950/50 flex items-center justify-center space-x-2"
            >
              <span>PESAN SEKARANG</span>
              <span>→</span>
            </button>
          </div>
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
          onClick={() => {}}
          className="flex-1 flex flex-col items-center justify-center space-y-1 py-1 rounded-xl transition-all bg-amber-500 text-white font-bold p-2 relative"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-[10px]">Keranjang</span>
          {cartItems.length > 0 && (
            <span className="absolute top-1 right-5 bg-red-600 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow border border-amber-400">
              {cartItems.length}
            </span>
          )}
        </button>

        <button
          onClick={() => router.push('/order-status')}
          className="flex-1 flex flex-col items-center justify-center space-y-1 py-1 rounded-xl transition-all text-gray-400 font-medium"
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
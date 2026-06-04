'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import logo1 from '../../../assets/Logo 1.png';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string;
  emoji: string;
  category: 'makanan' | 'minuman';
}

interface Customization {
  spiciness: 'Original' | 'Pedas Sedikit' | 'Sedang' | 'Pedas';
  texture: 'Kering' | 'Sedang' | 'Banjir';
  soupType: 'Asin' | 'Manis' | 'Gurih';
  toppings: {
    [key: string]: number;
  };
}

const PLACEHOLDER = (name: string) =>
  `https://placehold.co/200x150/FEE2E2/991B1B?text=${encodeURIComponent(name)}`;
const DRINK_PLACEHOLDER = (name: string) =>
  `https://placehold.co/200x150/E0F2FE/075985?text=${encodeURIComponent(name)}`;

const FOOD_ITEMS: MenuItem[] = [
  { id: 'm1', name: 'Cilok Goang', price: 10000, image: PLACEHOLDER('Cilok Goang'), emoji: '', category: 'makanan' },
  { id: 'm2', name: 'Mie Ayam + Ceker', price: 12000, image: PLACEHOLDER('Mie Ayam Ceker'), emoji: '', category: 'makanan' },
  { id: 'm3', name: 'Mie Bakso', price: 13000, image: PLACEHOLDER('Mie Bakso'), emoji: '', category: 'makanan' },
  { id: 'm4', name: 'Karedok Basreng', price: 6000, image: PLACEHOLDER('Karedok Basreng'), emoji: '', category: 'makanan' },
  { id: 'm5', name: 'Citul', price: 1000, image: PLACEHOLDER('Citul'), emoji: '', category: 'makanan' },
  { id: 'm6', name: 'Cireng Kuah', price: 10000, image: PLACEHOLDER('Cireng Kuah'), emoji: '', category: 'makanan' },
  { id: 'm7', name: 'Martabak Telor', price: 8000, image: PLACEHOLDER('Martabak Telor'), emoji: '', category: 'makanan' },
];

const DRINK_ITEMS: MenuItem[] = [
  { id: 'd1', name: 'Pop Ice', price: 5000, image: DRINK_PLACEHOLDER('Pop Ice'), emoji: '', category: 'minuman' },
  { id: 'd2', name: 'Teh Tarik', price: 6000, image: DRINK_PLACEHOLDER('Teh Tarik'), emoji: '', category: 'minuman' },
  { id: 'd3', name: 'Creamy Latte', price: 6000, image: DRINK_PLACEHOLDER('Creamy Latte'), emoji: '', category: 'minuman' },
];

export default function MenuPage() {
  const router = useRouter();
  
  // Interactive client states
  const [activeCategory, setActiveCategory] = useState<'all' | 'custom' | 'makanan' | 'minuman'>('all');
  const [cartCount, setCartCount] = useState<number>(1); // Mock 1 item initially to match design cart badge
  const [isCustomizing, setIsCustomizing] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  // Customization States
  const [customization, setCustomization] = useState<Customization>({
    spiciness: 'Sedang',
    texture: 'Sedang',
    soupType: 'Gurih',
    toppings: {
      'Kerupuk': 1,
      'Siomay': 2,
      'Ceker Ayam': 0,
      'Sosis': 0,
    }
  });

  const TOPPING_PRICES: { [key: string]: number } = {
    'Kerupuk': 2000,
    'Siomay': 3000,
    'Ceker Ayam': 5000,
    'Sosis': 4000,
  };

  const calculateCustomPrice = () => {
    let basePrice = 12000; // Base Seblak Price
    let toppingCost = Object.entries(customization.toppings).reduce(
      (sum, [name, qty]) => sum + (TOPPING_PRICES[name] || 0) * qty,
      0
    );
    return basePrice + toppingCost;
  };

  const triggerToast = (message: string) => {
    setShowToast(message);
    setTimeout(() => setShowToast(null), 2000);
  };

  const handleAddToBag = (name: string) => {
    setCartCount(prev => prev + 1);
    triggerToast(`${name} berhasil ditambahkan!`);
  };

  const handleSaveCustomization = () => {
    setIsCustomizing(false);
    setCartCount(prev => prev + 1);
    triggerToast(`Kustomisasi Seblak berhasil ditambahkan ke keranjang!`);
  };

  const handleToppingQty = (name: string, diff: number) => {
    setCustomization(prev => ({
      ...prev,
      toppings: {
        ...prev.toppings,
        [name]: Math.max(0, (prev.toppings[name] || 0) + diff)
      }
    }));
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen pb-24 relative select-none">
      {/* Toast Notification */}
      {showToast && (
        <div className="absolute top-16 inset-x-4 bg-gray-900 text-white text-xs text-center py-3 px-4 rounded-xl shadow-lg z-50 transition-all animate-bounce">
          {showToast}
        </div>
      )}

      {/* RENDER CUSTOMIZATION SCREEN OVERLAY */}
      {isCustomizing ? (
        <div className="absolute inset-0 bg-slate-50 flex flex-col z-40">
          {/* Header */}
          <header className="sticky top-0 bg-red-800 text-white flex items-center justify-between px-4 py-3.5 shadow-md">
            <button onClick={() => setIsCustomizing(false)} className="hover:opacity-80 transition-opacity">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <img src={logo1.src} alt="Seblak Mamah Zahwa" className="h-10 sm:h-12 md:h-14 object-contain" />
            <button onClick={() => router.push('/cart')} className="relative p-1">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-red-800">
                  {cartCount}
                </span>
              )}
            </button>
          </header>

          {/* Form Scroll Content */}
          <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Pilih Kustomisasi Seblak</h1>
              <span className="text-[10px] font-bold bg-gray-100 text-red-600 px-3 py-1 rounded-full">
                Antrean: <strong className="font-extrabold">#SBK-023</strong>
              </span>
            </div>

            {/* Tingkat Kepedasan */}
            <div className="space-y-3">
              <h3 className="font-bold text-gray-800 text-[14px]">Tingkat Kepedasan</h3>
              <div className="grid grid-cols-2 gap-2">
                {(['Original', 'Pedas Sedikit', 'Sedang', 'Pedas'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setCustomization(prev => ({ ...prev, spiciness: level }))}
                    className={`py-3 px-4 rounded-xl border-2 text-xs font-bold transition-all text-center ${
                      customization.spiciness === level
                        ? 'border-red-600 bg-red-50 text-red-600 shadow-sm'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Tekstur Kuah */}
            <div className="space-y-3">
              <h3 className="font-bold text-gray-800 text-[14px]">Tekstur Kuah</h3>
              <div className="grid grid-cols-3 gap-2">
                {(['Kering', 'Sedang', 'Banjir'] as const).map((text) => (
                  <button
                    key={text}
                    onClick={() => setCustomization(prev => ({ ...prev, texture: text }))}
                    className={`py-3 px-2 rounded-xl border-2 text-xs font-bold transition-all text-center ${
                      customization.texture === text
                        ? 'border-red-600 bg-red-50 text-red-600 shadow-sm'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>

            {/* Tipe Kuah */}
            <div className="space-y-3">
              <h3 className="font-bold text-gray-800 text-[14px]">Tipe Kuah</h3>
              <div className="grid grid-cols-3 gap-2">
                {(['Asin', 'Manis', 'Gurih'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setCustomization(prev => ({ ...prev, soupType: type }))}
                    className={`py-3 px-2 rounded-xl border-2 text-xs font-bold transition-all text-center ${
                      customization.soupType === type
                        ? 'border-red-600 bg-red-50 text-red-600 shadow-sm'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Toppings Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800 text-[14px]">Topping</h3>
                <span className="text-xs font-bold text-red-600 cursor-pointer">Lihat Semua</span>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                {Object.keys(TOPPING_PRICES).map((name) => {
                  const qty = customization.toppings[name] || 0;
                  const isActive = qty > 0;
                  
                  const illustration = (() => {
                    const map: Record<string, string> = {
                      'Kerupuk': 'https://placehold.co/60x60/FEE2E2/991B1B?text=Kerupuk',
                      'Siomay': 'https://placehold.co/60x60/FEE2E2/991B1B?text=Siomay',
                      'Ceker Ayam': 'https://placehold.co/60x60/FEE2E2/991B1B?text=Ceker',
                      'Sosis': 'https://placehold.co/60x60/FEE2E2/991B1B?text=Sosis',
                    };
                    return map[name] || 'https://placehold.co/60x60/FEE2E2/991B1B?text=Toping';
                  })();

                  return (
                    <div
                      key={name}
                      className={`bg-white border rounded-2xl p-3.5 flex flex-col items-center justify-between shadow-sm relative transition-all ${
                        isActive ? 'border-red-600 ring-2 ring-red-500/10' : 'border-rose-100/50'
                      }`}
                    >
                      {isActive && (
                        <span className="absolute top-2.5 right-2.5 bg-red-600 text-white text-[8px] font-black p-0.5 rounded-full flex items-center justify-center w-4 h-4 shadow">
                          ✓
                        </span>
                      )}

                      <img src={illustration} alt={name} className="w-14 h-14 rounded-xl object-cover mb-1.5" />
                      
                      <div className="text-center mb-3">
                        <p className="font-extrabold text-gray-800 text-xs">{name}</p>
                        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Rp {TOPPING_PRICES[name].toLocaleString()}</p>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center justify-between bg-slate-50 border border-gray-100 rounded-full w-full py-1.5 px-3">
                        <button
                          onClick={() => handleToppingQty(name, -1)}
                          className="w-5 h-5 flex items-center justify-center bg-white border border-gray-150 rounded-full text-gray-500 text-xs font-bold active:scale-90"
                        >
                          -
                        </button>
                        <span className="text-xs font-black text-gray-800">{qty}</span>
                        <button
                          onClick={() => handleToppingQty(name, 1)}
                          className="w-5 h-5 flex items-center justify-center bg-red-600 rounded-full text-white text-xs font-bold active:scale-90"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sticky Total bar */}
          <div className="sticky bottom-0 bg-white border-t border-gray-150 p-4 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Total Harga</p>
              <h2 className="text-xl font-black text-gray-900 mt-0.5">
                Rp {calculateCustomPrice().toLocaleString()}
              </h2>
            </div>

            <button
              onClick={handleSaveCustomization}
              className="bg-gradient-to-r from-red-700 to-amber-500 hover:opacity-95 active:scale-[0.98] text-white font-extrabold py-3.5 px-8 rounded-full flex items-center space-x-2 text-sm shadow-md"
            >
              <span>Pesan</span>
              <span>→</span>
            </button>
          </div>
        </div>
      ) : (
        /* MAIN MENU SCREEN */
        <>
          {/* Header */}
          <header className="sticky top-0 bg-red-800 text-white flex items-center justify-between px-4 py-3.5 shadow-md z-20">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🌶️</span>
              <img src={logo1.src} alt="Seblak Mamah Zahwa" className="h-8 sm:h-10 md:h-12 object-contain" />
            </div>

            <div className="flex items-center space-x-3.5">
              <button onClick={() => router.push('/cart')} className="relative p-1">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-red-800">
                    {cartCount}
                  </span>
                )}
              </button>

              <div className="w-7 h-7 rounded-full border-2 border-amber-400 bg-red-600 flex items-center justify-center text-[10px] font-bold shadow-inner">
                SP
              </div>
            </div>
          </header>

          {/* Horizontal scroll category segments */}
          <div className="sticky top-[52px] bg-white border-b border-gray-100 px-4 py-3 flex space-x-2 overflow-x-auto z-15 scrollbar-none">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full text-xs font-black transition-all ${
                activeCategory === 'all' ? 'bg-red-700 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              Semua Menu
            </button>
            <button
              onClick={() => setActiveCategory('custom')}
              className={`px-4 py-2 rounded-full text-xs font-black transition-all ${
                activeCategory === 'custom' ? 'bg-red-700 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              Custom Seblak
            </button>
            <button
              onClick={() => setActiveCategory('makanan')}
              className={`px-4 py-2 rounded-full text-xs font-black transition-all ${
                activeCategory === 'makanan' ? 'bg-red-700 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              Makanan
            </button>
            <button
              onClick={() => setActiveCategory('minuman')}
              className={`px-4 py-2 rounded-full text-xs font-black transition-all ${
                activeCategory === 'minuman' ? 'bg-red-700 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              Minuman
            </button>
          </div>

          {/* Menu Main Content Scrollable */}
          <div className="flex-1 px-4 py-5 space-y-6 overflow-y-auto">
            {/* Custom Seblak Section */}
            {(activeCategory === 'all' || activeCategory === 'custom') && (
              <section className="space-y-3.5">
                <div className="flex items-center space-x-2 text-red-700 font-bold">
                  <span className="text-lg">🥣</span>
                  <h2 className="tracking-tight text-md">Custom Seblak</h2>
                </div>

                {/* Custom Box card */}
                <div className="bg-white border border-rose-100 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                  <div className="flex items-center space-x-3.5">
                    <img src="https://placehold.co/56x56/FEE2E2/991B1B?text=Custom" alt="Custom Seblak" className="w-14 h-14 rounded-2xl object-cover" />
                    <div>
                      <h4 className="font-extrabold text-gray-800 text-[14px]">Seblak Pilihan 1</h4>
                      <p className="text-[10px] text-gray-400 font-semibold mt-1">Pilihan Opsional • Racik seblakmu...</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsCustomizing(true)}
                    className="w-8 h-8 rounded-full border-2 border-red-600 flex items-center justify-center text-red-600 font-bold hover:bg-red-50 active:scale-95 transition-all"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => setIsCustomizing(true)}
                  className="w-full bg-red-700 hover:bg-red-800 text-white font-black py-3.5 px-6 rounded-2xl flex items-center justify-center space-x-1.5 shadow-sm shadow-red-700/10 active:scale-[0.99] transition-all text-xs uppercase tracking-wider"
                >
                  <span>+</span>
                  <span>Tambah Seblak Custom</span>
                </button>
              </section>
            )}

            {/* Makanan Section */}
            {(activeCategory === 'all' || activeCategory === 'makanan') && (
              <section className="space-y-3.5">
                <div className="flex items-center space-x-2 text-red-700 font-bold">
                  <span className="text-lg">🍴</span>
                  <h2 className="tracking-tight text-md">Makanan</h2>
                </div>

                {/* 2-Column Grid */}
                <div className="grid grid-cols-2 gap-3.5">
                  {FOOD_ITEMS.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-rose-100 rounded-2xl p-3.5 shadow-sm flex flex-col justify-between"
                    >
                      {/* Placeholder Image */}
                      <img src={item.image} alt={item.name} className="w-full h-24 object-cover rounded-xl mb-3" />

                      <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                        <h4 className="font-bold text-gray-800 text-xs line-clamp-1">{item.name}</h4>
                        <div className="flex justify-between items-center pt-1.5">
                          <span className="font-black text-red-600 text-xs">
                            Rp {item.price.toLocaleString()}
                          </span>
                          <button
                            onClick={() => handleAddToBag(item.name)}
                            className="w-7 h-7 bg-red-600 hover:bg-red-700 active:scale-90 text-white font-extrabold rounded-full flex items-center justify-center shadow shadow-red-600/10"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Minuman Section */}
            {(activeCategory === 'all' || activeCategory === 'minuman') && (
              <section className="space-y-3.5">
                <div className="flex items-center space-x-2 text-red-700 font-bold">
                  <span className="text-lg">🥛</span>
                  <h2 className="tracking-tight text-md">Minuman</h2>
                </div>

                {/* Row layout */}
                <div className="space-y-3">
                  {DRINK_ITEMS.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-rose-50 rounded-2xl p-3 flex items-center justify-between shadow-sm"
                    >
                      <div className="flex items-center space-x-3.5">
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
                        <div>
                          <h4 className="font-extrabold text-gray-800 text-xs">{item.name}</h4>
                          <p className="font-black text-red-600 text-xs mt-1">Rp {item.price.toLocaleString()}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddToBag(item.name)}
                        className="w-7 h-7 rounded-full border-2 border-red-600 flex items-center justify-center text-red-600 font-bold hover:bg-red-50 active:scale-95 transition-all text-sm"
                      >
                        +
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Bottom Sticky Navigation */}
          <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 py-3.5 px-4 flex justify-between items-center z-10">
            <button
              onClick={() => setActiveCategory('all')}
              className="flex-1 flex flex-col items-center justify-center space-y-1 py-1 rounded-xl transition-all bg-amber-500 text-white font-bold p-2"
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
              {cartCount > 0 && (
                <span className="absolute top-1 right-5 bg-red-600 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {cartCount}
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
        </>
      )}
    </div>
  );
}
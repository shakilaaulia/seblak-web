'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import logo1 from '../../../assets/Logo 1.png';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: 'seblak' | 'makanan' | 'minuman';
}

interface ToppingSelection {
  name: string;
  quantity: number;
}

interface Customization {
  spiciness: '' | 'Original' | 'Pedas Sedikit' | 'Sedang' | 'Pedas';
  soup: '' | 'Kering' | 'Sedang' | 'Banjir' | 'Gurih';
  toppings: ToppingSelection[];
  notes: string;
}

interface CartItem {
  id: string;
  menuId: string;
  name: string;
  price: number;
  basePrice: number;
  quantity: number;
  customization?: Customization;
  image: string;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'seblak-1',
    name: 'Seblak Mamah Zahwa',
    price: 0,
    image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?q=80&w=400&auto=format&fit=crop',
    category: 'seblak'
  },
  {
    id: 'm1',
    name: 'Cilok Goang',
    price: 10000,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=400&auto=format&fit=crop',
    category: 'makanan'
  },
  {
    id: 'm2',
    name: 'Mie Bakso',
    price: 13000,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=400&auto=format&fit=crop',
    category: 'makanan'
  },
  {
    id: 'm3',
    name: 'Mie Jeletot',
    price: 10000,
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=400&auto=format&fit=crop',
    category: 'makanan'
  },
  {
    id: 'd1',
    name: 'Pop Ice',
    price: 5000,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=400&auto=format&fit=crop',
    category: 'minuman'
  },
  {
    id: 'd2',
    name: 'Nutrisari',
    price: 5000,
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=400&auto=format&fit=crop',
    category: 'minuman'
  },
  {
    id: 'd3',
    name: 'Beng-beng Drink',
    price: 6000,
    image: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?q=80&w=400&auto=format&fit=crop',
    category: 'minuman'
  }
];

export default function MenuPage() {
  const router = useRouter();

  // Navigation states
  const [activeTab, setActiveTab] = useState<'seblak' | 'makanan' | 'minuman'>('seblak');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart state sync with localStorage
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Modal states
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [customQty, setCustomQty] = useState(1);
  const [customization, setCustomization] = useState<Customization>({
    spiciness: '',
    soup: '',
    toppings: [],
    notes: ''
  });

  // Editing existing cart item customization state
  const [editingCartItemId, setEditingCartItemId] = useState<string | null>(null);

  // Cart bottom sheet overlay state
  const [showCartOverlay, setShowCartOverlay] = useState(false);

  // Topping list and prices
  const TOPPING_OPTIONS = [
    { name: 'Kerupuk', price: 2000 },
    { name: 'Siomay', price: 3000 },
    { name: 'Ceker Ayam', price: 5000 },
    { name: 'Sosis', price: 4000 }
  ];

  // Load cart from localStorage on mount
  useEffect(() => {
    setIsClient(true);
    const storedCart = localStorage.getItem('seblak_cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        console.error('Error parsing stored cart:', e);
      }
    }
  }, []);

  // Save cart to localStorage
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('seblak_cart', JSON.stringify(newCart));
  };

  // Calculate sum total of cart
  const calculateCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Get total quantity of items in cart
  const calculateCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  // Add normal (non-seblak) menu item to cart
  const handleAddSimpleItem = (item: MenuItem) => {
    const existing = cart.find(c => c.menuId === item.id && !c.customization);
    if (existing) {
      const updated = cart.map(c => 
        c.id === existing.id ? { ...c, quantity: c.quantity + 1 } : c
      );
      saveCart(updated);
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        menuId: item.id,
        name: item.name,
        price: item.price,
        basePrice: item.price,
        quantity: 1,
        image: item.image
      };
      saveCart([...cart, newItem]);
    }
  };

  // Reduce simple item quantity or remove it
  const handleDecreaseSimpleItem = (item: MenuItem) => {
    const existing = cart.find(c => c.menuId === item.id && !c.customization);
    if (!existing) return;

    if (existing.quantity > 1) {
      const updated = cart.map(c => 
        c.id === existing.id ? { ...c, quantity: c.quantity - 1 } : c
      );
      saveCart(updated);
    } else {
      const updated = cart.filter(c => c.id !== existing.id);
      saveCart(updated);
    }
  };

  // Get simple item count in cart
  const getSimpleItemCount = (itemId: string) => {
    const found = cart.find(c => c.menuId === itemId && !c.customization);
    return found ? found.quantity : 0;
  };

  // Get custom seblak count in cart
  const getSeblakItemCount = () => {
    return cart
      .filter(c => c.menuId === 'seblak-1')
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  // Open customization modal
  const openCustomizationModal = (item: MenuItem, existingCartItem?: CartItem) => {
    if (existingCartItem) {
      // Editing mode
      setEditingCartItemId(existingCartItem.id);
      setCustomizingItem(item);
      setCustomQty(existingCartItem.quantity);
      if (existingCartItem.customization) {
        setCustomization(existingCartItem.customization);
      }
    } else {
      // Adding new mode
      setEditingCartItemId(null);
      setCustomizingItem(item);
      setCustomQty(1);
      setCustomization({
        spiciness: '',
        soup: '',
        toppings: [],
        notes: ''
      });
    }
  };

  // Calculate customized seblak price
  const calculateCustomizedPrice = () => {
    if (!customizingItem) return 0;
    let price = customizingItem.price;
    customization.toppings.forEach(t => {
      const tOption = TOPPING_OPTIONS.find(opt => opt.name === t.name);
      if (tOption) {
        price += tOption.price * t.quantity;
      }
    });
    return price;
  };

  // Save customization to cart
  const handleSaveCustomization = () => {
    if (!customizingItem) return;

    const unitPrice = calculateCustomizedPrice();

    if (editingCartItemId) {
      // Update existing item
      const updated = cart.map(c => {
        if (c.id === editingCartItemId) {
          return {
            ...c,
            price: unitPrice,
            quantity: customQty,
            customization: { ...customization }
          };
        }
        return c;
      });
      saveCart(updated);
      setEditingCartItemId(null);
    } else {
      // Add new customized item
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        menuId: customizingItem.id,
        name: customizingItem.name,
        price: unitPrice,
        basePrice: customizingItem.price,
        quantity: customQty,
        customization: { ...customization },
        image: customizingItem.image
      };
      saveCart([...cart, newItem]);
    }

    setCustomizingItem(null);
  };

  // Handle topping quantity changes in customization modal
  const handleToppingQty = (name: string, delta: number) => {
    setCustomization(prev => {
      const existing = prev.toppings.find(t => t.name === name);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) {
          return { ...prev, toppings: prev.toppings.filter(t => t.name !== name) };
        }
        return { ...prev, toppings: prev.toppings.map(t => t.name === name ? { ...t, quantity: newQty } : t) };
      }
      if (delta > 0) {
        return { ...prev, toppings: [...prev.toppings, { name, quantity: 1 }] };
      }
      return prev;
    });
  };

  // Handle direct cart quantity changes in bottom sheet list
  const handleUpdateCartItemQty = (id: string, delta: number) => {
    const updated = cart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[];
    saveCart(updated);
  };

  // Format price as Indonesian currency string
  const formatPrice = (num: number) => {
    return 'Rp' + num.toLocaleString('id-ID').replace(/\s/g, '');
  };

  // Filter menu items by search query and active tab
  const filteredItems = MENU_ITEMS.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = item.category === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen relative font-sans text-gray-800">
      
      {/* Header with Search and Back navigation */}
      <header className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3.5 z-30 flex items-center space-x-3.5">
        <button onClick={() => router.push('/')} className="hover:opacity-85 transition-opacity">
          <svg className="w-6 h-6 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {/* Search Bar matching "Cari menu favoritmu..." */}
        <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2 border border-transparent focus-within:border-gray-200 transition-all">
          <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            className="w-full bg-transparent border-none outline-none text-xs font-semibold placeholder-gray-400 text-gray-700"
            placeholder="Cari menu favoritmu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      {/* Tabs segment: Seblak, Makanan, Minuman */}
      <div className="sticky top-[61px] bg-white border-b border-gray-100 py-1 px-2 flex justify-around items-center z-25">
        {[
          { id: 'seblak', label: 'Seblak', icon: '🌶️' },
          { id: 'makanan', label: 'Makanan', icon: '🍲' },
          { id: 'minuman', label: 'Minuman', icon: '🥤' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3.5 flex flex-col items-center justify-center space-y-1 relative transition-all border-b-2 ${
                isActive ? 'border-red-700 text-red-700 font-extrabold' : 'border-transparent text-gray-400 font-bold'
              }`}
            >
              <div className="flex items-center space-x-1.5 text-[14px]">
                <span>{tab.icon}</span>
                <span className="tracking-wide text-xs">{tab.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* List of filtered items in Category */}
      <main className="flex-1 px-4 py-5 space-y-6 overflow-y-auto pb-32">
        <div className="space-y-4">
          <h2 className="text-sm font-black text-gray-800 uppercase tracking-wider">
            {activeTab === 'seblak' ? 'Seblak (1)' : activeTab === 'makanan' ? `Makanan (${filteredItems.length})` : `Minuman (${filteredItems.length})`}
          </h2>

          <div className="space-y-3.5">
            {filteredItems.map((item) => {
              const isSeblak = item.category === 'seblak';
              const simpleCount = getSimpleItemCount(item.id);
              const totalSeblakInCart = getSeblakItemCount();

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-3.5 border border-rose-50/50 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover border border-rose-50"
                    />
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-sm">{item.name}</h3>
                      <p className="font-black text-red-600 text-xs mt-1">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>

                  {/* Add action */}
                  {isSeblak ? (
                    // For custom Seblak
                    totalSeblakInCart > 0 ? (
                      <div className="flex items-center space-x-3.5 bg-gray-50 border border-gray-150 rounded-full px-3 py-1.5 shadow-inner">
                        <button
                          onClick={() => {
                            // Find the first seblak and decrease it
                            const firstSeblak = cart.find(c => c.menuId === item.id);
                            if (firstSeblak) handleUpdateCartItemQty(firstSeblak.id, -1);
                          }}
                          className="w-5 h-5 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-500 font-extrabold text-xs active:scale-90"
                        >
                          -
                        </button>
                        <span className="text-xs font-black text-gray-800">{totalSeblakInCart}</span>
                        <button
                          onClick={() => openCustomizationModal(item)}
                          className="w-5 h-5 flex items-center justify-center bg-red-600 rounded-full text-white font-extrabold text-xs active:scale-90"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => openCustomizationModal(item)}
                        className="w-7.5 h-7.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black rounded-xl flex items-center justify-center shadow shadow-red-600/20 transition-all text-lg"
                      >
                        +
                      </button>
                    )
                  ) : (
                    // For simple items
                    simpleCount > 0 ? (
                      <div className="flex items-center space-x-3.5 bg-gray-50 border border-gray-150 rounded-full px-3 py-1.5 shadow-inner">
                        <button
                          onClick={() => handleDecreaseSimpleItem(item)}
                          className="w-5 h-5 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-500 font-extrabold text-xs active:scale-90"
                        >
                          -
                        </button>
                        <span className="text-xs font-black text-gray-800">{simpleCount}</span>
                        <button
                          onClick={() => handleAddSimpleItem(item)}
                          className="w-5 h-5 flex items-center justify-center bg-red-600 rounded-full text-white font-extrabold text-xs active:scale-90"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddSimpleItem(item)}
                        className="w-7.5 h-7.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black rounded-xl flex items-center justify-center shadow shadow-red-600/20 transition-all text-lg"
                      >
                        +
                      </button>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Sticky Bottom Cart Bar */}
      {isClient && cart.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100/80 shadow-2xl px-5 py-4 flex items-center justify-between z-40">
          <div onClick={() => setShowCartOverlay(true)} className="flex items-center space-x-3.5 cursor-pointer hover:opacity-90 active:scale-98 transition-all">
            {/* Basket icon with count badge */}
            <div className="relative p-1">
              <div className="w-11 h-11 bg-rose-50 border border-red-100 rounded-full flex items-center justify-center text-red-700 shadow-inner">
                <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-white shadow">
                {calculateCartCount()}
              </span>
            </div>
            
            {/* Price indicator */}
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Total Pembayaran</p>
              <p className="text-md font-black text-red-600 mt-0.5">{formatPrice(calculateCartTotal())}</p>
            </div>
          </div>

          <button
            onClick={() => router.push('/cart')}
            className="bg-red-600 hover:bg-red-700 active:scale-98 text-white font-black py-3.5 px-7 rounded-2xl flex items-center space-x-2 text-xs uppercase tracking-widest shadow-md shadow-red-600/10 transition-all"
          >
            <span>Checkout</span>
          </button>
        </div>
      )}

      {/* CUSTOMIZATION SCREEN OVERLAY MODAL ("Tambahkan Menu") */}
      {customizingItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex flex-col justify-end transition-opacity duration-300">
          {/* Dismiss Back-tap area */}
          <div className="flex-1" onClick={() => setCustomizingItem(null)} />

          {/* Modal Panel container */}
          <div className="bg-white rounded-t-[32px] shadow-2xl flex flex-col max-h-[85vh] w-full transition-transform duration-300 transform translate-y-0 overflow-hidden">
            
            {/* Header bar */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-black text-gray-900">Tambahkan Menu</h2>
              <button
                onClick={() => setCustomizingItem(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Scrollable form details */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
              
              {/* Product Card Row */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-5">
                <div className="flex items-center space-x-4">
                  <img
                    src={customizingItem.image}
                    alt={customizingItem.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-rose-50"
                  />
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-[15px]">{customizingItem.name}</h3>
                    <p className="font-black text-red-600 text-xs mt-1">
                      {formatPrice(calculateCustomizedPrice())}
                    </p>
                  </div>
                </div>

                {/* Main customization Qty Selector */}
                <div className="flex items-center space-x-3 bg-gray-50 border border-gray-150 rounded-full px-3 py-1.5 shadow-inner">
                  <button
                    onClick={() => setCustomQty(prev => Math.max(1, prev - 1))}
                    className="w-5 h-5 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-500 font-extrabold text-xs active:scale-90"
                  >
                    -
                  </button>
                  <span className="text-xs font-black text-gray-800">{customQty}</span>
                  <button
                    onClick={() => setCustomQty(prev => prev + 1)}
                    className="w-5 h-5 flex items-center justify-center bg-red-600 rounded-full text-white font-extrabold text-xs active:scale-90"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* TINGKAT KEPEDASAN */}
              <div className="space-y-3">
                <h3 className="text-[11px] font-black tracking-wider uppercase text-gray-400">
                  Tingkat Kepedasan (Pilih 1)
                </h3>
                <div className="space-y-0.5 border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                  {(['Original', 'Pedas Sedikit', 'Sedang', 'Pedas'] as const).map((level) => {
                    const isActive = customization.spiciness === level;
                    return (
                      <label
                        key={level}
                        onClick={() => setCustomization(prev => ({ ...prev, spiciness: level }))}
                        className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-slate-50 border-b border-gray-50 last:border-none transition-colors"
                      >
                        <div>
                          <p className={`text-xs font-bold ${isActive ? 'text-red-700' : 'text-gray-800'}`}>{level}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Rp0</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isActive ? 'border-red-600 bg-white' : 'border-gray-200'
                        }`}>
                          {isActive && <div className="w-2.5 h-2.5 rounded-full bg-red-600" />}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* KUAH SELECTION */}
              <div className="space-y-3">
                <h3 className="text-[11px] font-black tracking-wider uppercase text-gray-400">
                  Kuah (Pilih 1)
                </h3>
                <div className="space-y-0.5 border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                  {(['Kering', 'Sedang', 'Banjir', 'Gurih'] as const).map((soupOpt) => {
                    const isActive = customization.soup === soupOpt;
                    return (
                      <label
                        key={soupOpt}
                        onClick={() => setCustomization(prev => ({ ...prev, soup: soupOpt }))}
                        className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-slate-50 border-b border-gray-50 last:border-none transition-colors"
                      >
                        <div>
                          <p className={`text-xs font-bold ${isActive ? 'text-red-700' : 'text-gray-800'}`}>{soupOpt}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Rp0</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isActive ? 'border-red-600 bg-white' : 'border-gray-200'
                        }`}>
                          {isActive && <div className="w-2.5 h-2.5 rounded-full bg-red-600" />}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* TOPPINGS */}
              <div className="space-y-3">
                <h3 className="text-[11px] font-black tracking-wider uppercase text-gray-400">
                  Topping (Bisa Pilih Lebih Dari 1)
                </h3>
                <div className="space-y-0.5 border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                  {TOPPING_OPTIONS.map((tOpt) => {
                    const selected = customization.toppings.find(t => t.name === tOpt.name);
                    const qty = selected?.quantity || 0;
                    return (
                      <div
                        key={tOpt.name}
                        className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50 last:border-none"
                      >
                        <div>
                          <p className={`text-xs font-bold ${qty > 0 ? 'text-red-700' : 'text-gray-800'}`}>{tOpt.name}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{formatPrice(tOpt.price)}</p>
                        </div>
                        {qty > 0 ? (
                          <div className="flex items-center space-x-2.5 bg-gray-50 border border-gray-150 rounded-full px-2.5 py-1 shadow-inner">
                            <button
                              onClick={() => handleToppingQty(tOpt.name, -1)}
                              className="w-5 h-5 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-500 font-extrabold text-xs active:scale-90"
                            >
                              -
                            </button>
                            <span className="text-xs font-black text-gray-800 min-w-[16px] text-center">{qty}</span>
                            <button
                              onClick={() => handleToppingQty(tOpt.name, 1)}
                              className="w-5 h-5 flex items-center justify-center bg-red-600 rounded-full text-white font-extrabold text-xs active:scale-90"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleToppingQty(tOpt.name, 1)}
                            className="w-7 h-7 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black rounded-xl flex items-center justify-center shadow shadow-red-600/20 transition-all"
                          >
                            +
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* DENGAN KOLOM CATATAN */}
              <div className="space-y-3">
                <h3 className="text-[11px] font-black tracking-wider uppercase text-gray-400">
                  Catatan (Opsional)
                </h3>
                <textarea
                  className="w-full bg-gray-50 border border-gray-150 rounded-2xl p-4 text-xs font-medium outline-none focus:bg-white focus:border-red-500 transition-all text-gray-700"
                  rows={3}
                  placeholder="Contoh: Jangan pakai daun bawang ya..."
                  value={customization.notes}
                  onChange={(e) => setCustomization(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

            </div>

            {/* Bottom sticky submission button */}
            <div className="p-4 border-t border-gray-100 bg-white space-y-2">
              {(!customization.spiciness || !customization.soup || customization.toppings.length === 0) && (
                <p className="text-[10px] font-bold text-red-500 text-center">
                  Lengkapi kepedasan, kuah, dan minimal 1 topping
                </p>
              )}
              <button
                onClick={handleSaveCustomization}
                disabled={!customization.spiciness || !customization.soup || customization.toppings.length === 0}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-98 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-red-600/15 transition-all flex items-center justify-center space-x-2"
              >
                <span>Tambahkan ke Keranjang - {formatPrice(calculateCustomizedPrice() * customQty)}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* BOTTOM SHEET OVERLAY FOR CART: "Keranjang Saya" */}
      {showCartOverlay && (
        <div className="fixed inset-0 bg-black/60 z-50 flex flex-col justify-end transition-opacity duration-300">
          {/* Backdrop click dismiss */}
          <div className="flex-1" onClick={() => setShowCartOverlay(false)} />

          {/* Cart Panel wrapper */}
          <div className="bg-white rounded-t-[32px] shadow-2xl flex flex-col max-h-[80vh] w-full transition-transform duration-300 transform translate-y-0 overflow-hidden">
            
            {/* Header bar */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-black text-gray-900">Keranjang Saya</h2>
              <button
                onClick={() => setShowCartOverlay(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {cart.map((item) => {
                const isCustom = !!item.customization;
                return (
                  <div
                    key={item.id}
                    className="bg-white border border-rose-50/50 rounded-2xl p-4 shadow-sm flex items-start justify-between relative"
                  >
                    <div className="flex items-start space-x-4 pr-16">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover border border-rose-50 mt-0.5"
                      />
                      <div className="space-y-1">
                        <h3 className="font-extrabold text-gray-900 text-sm leading-tight">{item.name}</h3>
                        
                        {/* Custom attributes */}
                        {isCustom && item.customization && (
                          <p className="text-[10px] text-gray-400 font-bold leading-normal">
                            {[item.customization.spiciness, item.customization.soup, ...item.customization.toppings.map(t => `${t.name}${t.quantity > 1 ? ` ×${t.quantity}` : ''}`)].filter(Boolean).join(', ') || 'Tanpa custom'}
                          </p>
                        )}
                        
                        {/* Note link */}
                        {isCustom && item.customization && (
                          <div className="flex items-center space-x-1 text-[10px] font-bold text-gray-500">
                            <span>✍️</span>
                            <span>{item.customization.notes || 'Add note...'}</span>
                          </div>
                        )}

                        <p className="font-black text-red-600 text-xs pt-1">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>

                    {/* Edit Option for customized elements */}
                    {isCustom && (
                      <button
                        onClick={() => {
                          const originalItem = MENU_ITEMS.find(m => m.id === item.menuId);
                          if (originalItem) {
                            setShowCartOverlay(false);
                            openCustomizationModal(originalItem, item);
                          }
                        }}
                        className="absolute right-4 top-4 text-xs font-black text-red-600 hover:opacity-80"
                      >
                        Edit
                      </button>
                    )}

                    {/* Direct Quantity selector */}
                    <div className="absolute right-4 bottom-4 flex items-center space-x-2.5 bg-gray-50 border border-gray-150 rounded-full px-2.5 py-1 shadow-inner">
                      <button
                        onClick={() => handleUpdateCartItemQty(item.id, -1)}
                        className="w-4.5 h-4.5 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-500 font-extrabold text-xs active:scale-90"
                      >
                        -
                      </button>
                      <span className="text-xs font-black text-gray-800">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateCartItemQty(item.id, 1)}
                        className="w-4.5 h-4.5 flex items-center justify-center bg-red-600 rounded-full text-white font-extrabold text-xs active:scale-90"
                      >
                        +
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Sticky Bottom bar for cart sheet */}
            <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative p-1">
                  <div className="w-10 h-10 bg-rose-50 border border-red-100 rounded-full flex items-center justify-center text-red-700 shadow-inner">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white shadow">
                    {calculateCartCount()}
                  </span>
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Total Pembayaran</p>
                  <p className="text-sm font-black text-red-600 mt-0.5">{formatPrice(calculateCartTotal())}</p>
                </div>
              </div>

              <button
                onClick={() => router.push('/cart')}
                className="bg-red-600 hover:bg-red-700 active:scale-98 text-white font-black py-3.5 px-6 rounded-2xl flex items-center space-x-2 text-xs uppercase tracking-widest shadow-md shadow-red-600/10 transition-all"
              >
                <span>Checkout</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

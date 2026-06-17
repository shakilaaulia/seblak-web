'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import SeblakForm from './seblak-form';

interface ApiProduct {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  categoryId: string;
  variants?: { name: string; price: number }[];
}

interface ToppingSelection {
  id?: string;
  name: string;
  price?: number;
  quantity: number;
}

interface ToppingOption {
  id: string;
  name: string;
  price: number;
  remaining: number;
}

interface Customization {
  spiciness: '' | 'Original' | 'Pedas Sedikit' | 'Sedang' | 'Pedas';
  soup: '' | 'Kering' | 'Sedang' | 'Banjir';
  flavors: string[];
  toppings: ToppingSelection[];
  notes: string;
}

interface SelectedVariant {
  name: string;
  price: number;
  quantity: number;
}

interface CartItem {
  id: string;
  menuId: string;
  name: string;
  price: number;
  basePrice: number;
  quantity: number;
  customization?: Customization;
  selectedVariants?: SelectedVariant[];
  image: string;
}

const FLAVOR_OPTIONS = ['Gurih', 'Asin', 'Manis'];

const CATEGORY_LABELS: Record<string, string> = {
  seblak: 'Seblak',
  makanan: 'Makanan',
  minuman: 'Minuman',
};

export default function MenuPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'seblak' | 'makanan' | 'minuman'>('seblak');
  const [searchQuery, setSearchQuery] = useState('');

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [toppingOptions, setToppingOptions] = useState<ToppingOption[]>([]);

  // Seblak customization
  const [customizingItem, setCustomizingItem] = useState<ApiProduct | null>(null);
  const [customQty, setCustomQty] = useState(1);
  const [customization, setCustomization] = useState<Customization>({
    spiciness: '',
    soup: '',
    flavors: [],
    toppings: [],
    notes: ''
  });
  const [editingCartItemId, setEditingCartItemId] = useState<string | null>(null);

  // Variant modal
  const [variantItem, setVariantItem] = useState<ApiProduct | null>(null);
  const [variantQty, setVariantQty] = useState(1);
  const [variantSelections, setVariantSelections] = useState<SelectedVariant[]>([]);

  // Store status
  const [storeOpen, setStoreOpen] = useState(true);
  const [storeLoading, setStoreLoading] = useState(true);

  // Cart overlay
  const [showCartOverlay, setShowCartOverlay] = useState(false);

  const cartIdCounter = useRef(0);

  const generateCartId = () => {
    cartIdCounter.current += 1;
    return `cart-${cartIdCounter.current}`;
  };

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) {
      console.error('Error fetching products:', e);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const fetchToppings = useCallback(async () => {
    try {
      const res = await fetch('/api/toppings');
      if (res.ok) {
        const data = await res.json();
        setToppingOptions(data);
      }
    } catch (e) {
      console.error('Error fetching toppings:', e);
    }
  }, []);

  useEffect(() => {
    setIsClient(true);
    const storedCart = localStorage.getItem('seblak_cart');
    if (storedCart) {
      try {
        const items = JSON.parse(storedCart);
        setCart(items);
        const maxId = items.reduce((max: number, item: { id: string }) => {
          const match = item.id.match(/^cart-(\d+)$/);
          return match ? Math.max(max, parseInt(match[1])) : max;
        }, 0);
        cartIdCounter.current = maxId;
      } catch (e) {
        console.error('Error parsing stored cart:', e);
      }
    }
    fetchProducts();
    fetchToppings();
    fetch('/api/restaurant')
      .then(r => r.json())
      .then(data => { setStoreOpen(data.isOpen); setStoreLoading(false); })
      .catch(() => setStoreLoading(false));
  }, [fetchProducts, fetchToppings]);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('seblak_cart', JSON.stringify(newCart));
  };

  const calculateCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const calculateCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const filteredItems = products.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = item.categoryId === activeTab;
    return matchesSearch && matchesTab;
  });

  // Simple item handlers (makanan / minuman without variants)
  const handleAddSimpleItem = (item: ApiProduct) => {
    const existing = cart.find(c => c.menuId === item.id && !c.customization && !c.selectedVariants);
    if (existing) {
      saveCart(cart.map(c => c.id === existing.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      saveCart([...cart, {
        id: generateCartId(),
        menuId: item.id,
        name: item.name,
        price: item.price,
        basePrice: item.price,
        quantity: 1,
        image: item.imageUrl
      }]);
    }
  };

  const handleDecreaseSimpleItem = (item: ApiProduct) => {
    const existing = cart.find(c => c.menuId === item.id && !c.customization && !c.selectedVariants);
    if (!existing) return;
    if (existing.quantity > 1) {
      saveCart(cart.map(c => c.id === existing.id ? { ...c, quantity: c.quantity - 1 } : c));
    } else {
      saveCart(cart.filter(c => c.id !== existing.id));
    }
  };

  const getSimpleItemCount = (itemId: string) => {
    const found = cart.find(c => c.menuId === itemId && !c.customization && !c.selectedVariants);
    return found ? found.quantity : 0;
  };

  // Variant handlers
  const openVariantModal = (item: ApiProduct) => {
    setVariantItem(item);
    setVariantQty(1);
    setVariantSelections(item.variants?.map(v => ({ name: v.name, price: v.price, quantity: 0 })) || []);
  };

  const handleVariantQtyChange = (name: string, delta: number) => {
    setVariantSelections(prev => prev.map(v =>
      v.name === name ? { ...v, quantity: Math.max(0, v.quantity + delta) } : v
    ));
  };

  const totalVariantSelected = () => variantSelections.reduce((sum, v) => sum + v.quantity, 0);

  const calculateVariantPrice = () => {
    return variantSelections.reduce((sum, v) => sum + v.price * v.quantity, 0);
  };

  const handleSaveVariant = () => {
    if (!variantItem) return;
    const activeSelections = variantSelections.filter(v => v.quantity > 0);
    const itemPrice = calculateVariantPrice();
    const newItem: CartItem = {
      id: generateCartId(),
      menuId: variantItem.id,
      name: variantItem.name,
      price: itemPrice,
      basePrice: variantItem.price || 0,
      quantity: variantQty,
      selectedVariants: activeSelections,
      image: variantItem.imageUrl
    };
    saveCart([...cart, newItem]);
    setVariantItem(null);
  };

  // Seblak customization (OLD - keeping for editing existing items)
  const openCustomizationModal = (item: ApiProduct, existingCartItem?: CartItem) => {
    if (existingCartItem) {
      setEditingCartItemId(existingCartItem.id);
      setCustomizingItem(item);
      setCustomQty(existingCartItem.quantity);
      if (existingCartItem.customization) {
        setCustomization(existingCartItem.customization);
      }
    } else {
      setEditingCartItemId(null);
      setCustomizingItem(item);
      setCustomQty(1);
      setCustomization({ spiciness: '', soup: '', flavors: [], toppings: [], notes: '' });
    }
  };

  const calculateCustomizedPrice = () => {
    if (!customizingItem) return 0;
    let price = customizingItem.price;
    customization.toppings.forEach(t => {
      const tOption = toppingOptions.find(opt => opt.name === t.name);
      if (tOption) price += tOption.price * t.quantity;
    });
    return price;
  };

  const handleSaveCustomization = () => {
    if (!customizingItem) return;
    const unitPrice = calculateCustomizedPrice();

    if (editingCartItemId) {
      saveCart(cart.map(c =>
        c.id === editingCartItemId ? { ...c, price: unitPrice, quantity: customQty, customization: { ...customization } } : c
      ));
      setEditingCartItemId(null);
    } else {
      saveCart([...cart, {
        id: generateCartId(),
        menuId: customizingItem.id,
        name: customizingItem.name,
        price: unitPrice,
        basePrice: customizingItem.price,
        quantity: customQty,
        customization: { ...customization },
        image: customizingItem.imageUrl
      }]);
    }
    setCustomizingItem(null);
    setCustomization({ spiciness: '', soup: '', flavors: [], toppings: [], notes: '' });
    setCustomQty(1);
  };

  const handleToppingQty = (name: string, delta: number) => {
    const option = toppingOptions.find(t => t.name === name);
    const maxQty = Math.max(0, option?.remaining ?? 0);
    setCustomization(prev => {
      const existing = prev.toppings.find(t => t.name === name);
      if (existing) {
        const newQty = existing.quantity + delta;
        const clampedQty = Math.min(newQty, maxQty);
        if (clampedQty <= 0) return { ...prev, toppings: prev.toppings.filter(t => t.name !== name) };
        return {
          ...prev,
          toppings: prev.toppings.map(t => t.name === name ? {
            ...t,
            id: t.id || option?.id,
            price: t.price ?? option?.price,
            quantity: clampedQty
          } : t)
        };
      }
      if (delta > 0 && maxQty > 0) return {
        ...prev,
        toppings: [...prev.toppings, { id: option?.id, name, price: option?.price, quantity: 1 }]
      };
      return prev;
    });
  };

  const handleToggleFlavor = (flavor: string) => {
    setCustomization(prev => ({
      ...prev,
      flavors: prev.flavors.includes(flavor) ? prev.flavors.filter(f => f !== flavor) : [...prev.flavors, flavor]
    }));
  };

  const handleUpdateCartItemQty = (id: string, delta: number) => {
    saveCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const formatPrice = (num: number) => 'Rp' + num.toLocaleString('id-ID').replace(/\s/g, '');

  if (!isClient) return null;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen relative font-sans text-gray-800">

      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3.5 z-30 flex items-center space-x-3.5">
        <button onClick={() => router.push('/')} className="hover:opacity-85 transition-opacity">
          <svg className="w-6 h-6 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
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

      {/* Tabs */}
      <div className="sticky top-[61px] bg-white border-b border-gray-100 py-1 px-2 flex justify-around items-center z-25">
        {(['seblak', 'makanan', 'minuman'] as const).map((tab) => {
          const isActive = activeTab === tab;
          const icons = { seblak: '🌶️', makanan: '🍲', minuman: '🥤' };
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3.5 flex flex-col items-center justify-center space-y-1 relative transition-all border-b-2 ${
                isActive ? 'border-red-700 text-red-700 font-extrabold' : 'border-transparent text-gray-400 font-bold'
              }`}
            >
              <div className="flex items-center space-x-1.5 text-[14px]">
                <span>{icons[tab]}</span>
                <span className="tracking-wide text-xs">{CATEGORY_LABELS[tab]}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Store Closed Banner */}
      {!storeLoading && !storeOpen && (
        <div className="bg-amber-500 text-white text-center py-3 px-4 text-xs font-bold">
          🕐 Warung sedang tutup. Silakan kembali saat jam operasional.
        </div>
      )}

      {/* Product List */}
      <main className="flex-1 px-4 py-5 space-y-6 overflow-y-auto pb-32">
        {loadingProducts ? (
          <div className="text-center py-12 text-gray-400 text-sm font-bold">Memuat menu...</div>
        ) : activeTab === 'seblak' ? (
          <SeblakForm
            products={products}
            toppingOptions={toppingOptions}
            customization={customization}
            customQty={customQty}
            setCustomQty={setCustomQty}
            setCustomization={setCustomization}
            handleToggleFlavor={handleToggleFlavor}
            handleToppingQty={handleToppingQty}
            cart={cart}
            editItemId={editingCartItemId}
            setEditItemId={setEditingCartItemId}
            saveCart={saveCart}
            generateCartId={generateCartId}
            formatPrice={formatPrice}
          />
        ) : (
          <div className="space-y-4">
            <h2 className="text-sm font-black text-gray-800 uppercase tracking-wider">
              {CATEGORY_LABELS[activeTab]} ({filteredItems.length})
            </h2>
            <div className="space-y-3.5">
              {filteredItems.map((item) => {
                const hasVariants = !!(item.variants && item.variants.length > 0);
                const simpleCount = getSimpleItemCount(item.id);
                const hasVariantInCart = cart.find(c => c.menuId === item.id && c.selectedVariants);

                return (
                  <div key={item.id} className="bg-white rounded-2xl p-3.5 border border-rose-50/50 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-xl object-cover border border-rose-50" />
                      <div>
                        <h3 className="font-extrabold text-gray-900 text-sm">{item.name}</h3>
                        <p className="font-black text-red-600 text-xs mt-1">{formatPrice(item.price)}</p>
                      </div>
                    </div>

                    {hasVariants ? (
                      hasVariantInCart ? (
                        <div className="flex items-center space-x-3.5 bg-gray-50 border border-gray-150 rounded-full px-3 py-1.5 shadow-inner">
                          <button onClick={() => handleUpdateCartItemQty(hasVariantInCart.id, -1)} className="w-5 h-5 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-500 font-extrabold text-xs active:scale-90">-</button>
                          <span className="text-xs font-black text-gray-800">{hasVariantInCart.quantity}</span>
                          <button onClick={() => openVariantModal(item)} disabled={!storeOpen} className={`rounded-full text-xs font-extrabold active:scale-90 ${
                            !storeOpen
                              ? 'w-5 h-5 bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'w-5 h-5 bg-red-600 text-white'
                          }`}>+</button>
                        </div>
                      ) : (
                        <button onClick={() => openVariantModal(item)} disabled={!storeOpen} className={`font-black rounded-xl flex items-center justify-center shadow transition-all text-lg ${
                          !storeOpen
                            ? 'w-7.5 h-7.5 bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'w-7.5 h-7.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white shadow-red-600/20'
                        }`}>+</button>
                      )
                    ) : (
                      simpleCount > 0 ? (
                        <div className="flex items-center space-x-3.5 bg-gray-50 border border-gray-150 rounded-full px-3 py-1.5 shadow-inner">
                          <button onClick={() => handleDecreaseSimpleItem(item)} className="w-5 h-5 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-500 font-extrabold text-xs active:scale-90">-</button>
                          <span className="text-xs font-black text-gray-800">{simpleCount}</span>
                          <button onClick={() => handleAddSimpleItem(item)} disabled={!storeOpen} className={`rounded-full text-xs font-extrabold active:scale-90 ${
                            !storeOpen
                              ? 'w-5 h-5 bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'w-5 h-5 bg-red-600 text-white'
                          }`}>+</button>
                        </div>
                      ) : (
                        <button onClick={() => handleAddSimpleItem(item)} disabled={!storeOpen} className={`font-black rounded-xl flex items-center justify-center shadow transition-all text-lg ${
                          !storeOpen
                            ? 'w-7.5 h-7.5 bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'w-7.5 h-7.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white shadow-red-600/20'
                        }`}>+</button>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

        {/* Cart Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100/80 shadow-2xl px-5 py-4 flex items-center justify-between z-40">
          <div onClick={() => setShowCartOverlay(true)} className="flex items-center space-x-3.5 cursor-pointer hover:opacity-90 active:scale-98 transition-all">
            <div className="relative p-1">
              <div className="w-11 h-11 bg-rose-50 border border-red-100 rounded-full flex items-center justify-center text-red-700 shadow-inner">
                <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-white shadow">{calculateCartCount()}</span>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Total Pembayaran</p>
              <p className="text-md font-black text-red-600 mt-0.5">{formatPrice(calculateCartTotal())}</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/cart')}
            disabled={!storeOpen}
            className={`font-black py-3.5 px-7 rounded-2xl flex items-center space-x-2 text-xs uppercase tracking-widest shadow-md transition-all ${
              !storeOpen
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 active:scale-98 text-white shadow-red-600/10'
            }`}
          >
            <span>{!storeOpen ? 'Toko Tutup' : 'Checkout'}</span>
          </button>
        </div>
      )}

      {/* SEBLAK CUSTOMIZATION MODAL */}
      {customizingItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex flex-col justify-end transition-opacity duration-300">
          <div className="flex-1" onClick={() => setCustomizingItem(null)} />
          <div className="bg-white rounded-t-[32px] shadow-2xl flex flex-col max-h-[85vh] w-full transition-transform duration-300 transform translate-y-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-black text-gray-900">Tambahkan Menu</h2>
              <button onClick={() => setCustomizingItem(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
              {/* Product Card Row */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-5">
                <div className="flex items-center space-x-4">
                  <img src={customizingItem.imageUrl} alt={customizingItem.name} className="w-16 h-16 rounded-2xl object-cover border border-rose-50" />
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-[15px]">{customizingItem.name}</h3>
                    <p className="font-black text-red-600 text-xs mt-1">{formatPrice(calculateCustomizedPrice())}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 bg-gray-50 border border-gray-150 rounded-full px-3 py-1.5 shadow-inner">
                  <button onClick={() => setCustomQty(prev => Math.max(1, prev - 1))} className="w-5 h-5 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-500 font-extrabold text-xs active:scale-90">-</button>
                  <span className="text-xs font-black text-gray-800">{customQty}</span>
                  <button onClick={() => setCustomQty(prev => prev + 1)} className="w-5 h-5 flex items-center justify-center bg-red-600 rounded-full text-white font-extrabold text-xs active:scale-90">+</button>
                </div>
              </div>

              {/* TINGKAT KEPEDASAN */}
              <div className="space-y-3">
                <h3 className="text-[11px] font-black tracking-wider uppercase text-gray-400">Tingkat Kepedasan (Pilih 1)</h3>
                <div className="space-y-0.5 border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                  {(['Original', 'Pedas Sedikit', 'Sedang', 'Pedas'] as const).map((level) => {
                    const isActive = customization.spiciness === level;
                    return (
                      <label key={level} onClick={() => setCustomization(prev => ({ ...prev, spiciness: level }))} className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-slate-50 border-b border-gray-50 last:border-none transition-colors">
                        <div>
                          <p className={`text-xs font-bold ${isActive ? 'text-red-700' : 'text-gray-800'}`}>{level}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Rp0</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isActive ? 'border-red-600 bg-white' : 'border-gray-200'}`}>
                          {isActive && <div className="w-2.5 h-2.5 rounded-full bg-red-600" />}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* KUAH */}
              <div className="space-y-3">
                <h3 className="text-[11px] font-black tracking-wider uppercase text-gray-400">Kuah (Pilih 1)</h3>
                <div className="space-y-0.5 border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                  {(['Kering', 'Sedang', 'Banjir'] as const).map((soupOpt) => {
                    const isActive = customization.soup === soupOpt;
                    return (
                      <label key={soupOpt} onClick={() => setCustomization(prev => ({ ...prev, soup: soupOpt }))} className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-slate-50 border-b border-gray-50 last:border-none transition-colors">
                        <div>
                          <p className={`text-xs font-bold ${isActive ? 'text-red-700' : 'text-gray-800'}`}>{soupOpt}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Rp0</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isActive ? 'border-red-600 bg-white' : 'border-gray-200'}`}>
                          {isActive && <div className="w-2.5 h-2.5 rounded-full bg-red-600" />}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* RASA KUAH */}
              <div className="space-y-3">
                <h3 className="text-[11px] font-black tracking-wider uppercase text-gray-400">Rasa Kuah (Bisa Pilih Lebih Dari 1)</h3>
                <div className="space-y-0.5 border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                  {FLAVOR_OPTIONS.map((flavor) => {
                    const isActive = customization.flavors.includes(flavor);
                    return (
                      <label key={flavor} onClick={() => handleToggleFlavor(flavor)} className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-slate-50 border-b border-gray-50 last:border-none transition-colors">
                        <div>
                          <p className={`text-xs font-bold ${isActive ? 'text-red-700' : 'text-gray-800'}`}>{flavor}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Rp0</p>
                        </div>
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isActive ? 'border-red-600 bg-red-600' : 'border-gray-200'}`}>
                          {isActive && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* TOPPINGS */}
              <div className="space-y-3">
                <h3 className="text-[11px] font-black tracking-wider uppercase text-gray-400">Topping (Bisa Pilih Lebih Dari 1)</h3>
                <div className="space-y-0.5 border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                  {toppingOptions.map((tOpt) => {
                    const selected = customization.toppings.find(t => t.name === tOpt.name);
                    const qty = selected?.quantity || 0;
                    const soldOut = tOpt.remaining <= 0;
                    const maxReached = qty >= tOpt.remaining;
                    return (
                      <div key={tOpt.name} className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50 last:border-none">
                        <div>
                          <p className={`text-xs font-bold ${qty > 0 ? 'text-red-700' : soldOut ? 'text-gray-400' : 'text-gray-800'}`}>
                            {tOpt.name} {soldOut && <span className="text-[9px] text-red-500 font-bold">(Habis)</span>}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{formatPrice(tOpt.price)} {!soldOut && <span className="text-gray-300">· Sisa {tOpt.remaining}</span>}</p>
                        </div>
                        {qty > 0 ? (
                          <div className="flex items-center space-x-2.5 bg-gray-50 border border-gray-150 rounded-full px-2.5 py-1 shadow-inner">
                            <button onClick={() => handleToppingQty(tOpt.name, -1)} className="w-5 h-5 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-500 font-extrabold text-xs active:scale-90">-</button>
                            <span className="text-xs font-black text-gray-800 min-w-[16px] text-center">{qty}</span>
                            <button onClick={() => !maxReached && handleToppingQty(tOpt.name, 1)} disabled={maxReached} className={`w-5 h-5 flex items-center justify-center rounded-full text-white font-extrabold text-xs active:scale-90 ${maxReached ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-600'}`}>+</button>
                          </div>
                        ) : (
                          !soldOut && (
                            <button onClick={() => handleToppingQty(tOpt.name, 1)} className="w-7 h-7 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black rounded-xl flex items-center justify-center shadow shadow-red-600/20 transition-all">+</button>
                          )
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CATATAN */}
              <div className="space-y-3">
                <h3 className="text-[11px] font-black tracking-wider uppercase text-gray-400">Catatan (Opsional)</h3>
                <textarea className="w-full bg-gray-50 border border-gray-150 rounded-2xl p-4 text-xs font-medium outline-none focus:bg-white focus:border-red-500 transition-all text-gray-700" rows={3} placeholder="Contoh: Jangan pakai daun bawang ya..." value={customization.notes} onChange={(e) => setCustomization(prev => ({ ...prev, notes: e.target.value }))} />
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-white space-y-2">
              {(!customization.spiciness || !customization.soup || customization.toppings.length === 0) && (
                <p className="text-[10px] font-bold text-red-500 text-center">Lengkapi kepedasan, kuah, dan minimal 1 topping</p>
              )}
              <button onClick={handleSaveCustomization} disabled={!customization.spiciness || !customization.soup || customization.toppings.length === 0} className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-98 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-red-600/15 transition-all flex items-center justify-center space-x-2">
                <span>Tambahkan ke Keranjang - {formatPrice(calculateCustomizedPrice() * customQty)}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VARIANT MODAL */}
      {variantItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex flex-col justify-end transition-opacity duration-300">
          <div className="flex-1" onClick={() => setVariantItem(null)} />
          <div className="bg-white rounded-t-[32px] shadow-2xl flex flex-col max-h-[85vh] w-full transition-transform duration-300 transform translate-y-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-black text-gray-900">Pilih Varian</h2>
              <button onClick={() => setVariantItem(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-5">
                <div className="flex items-center space-x-4">
                  <img src={variantItem.imageUrl} alt={variantItem.name} className="w-16 h-16 rounded-2xl object-cover border border-rose-50" />
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-[15px]">{variantItem.name}</h3>
                    <p className="font-black text-red-600 text-xs mt-1">{formatPrice(calculateVariantPrice())}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 bg-gray-50 border border-gray-150 rounded-full px-3 py-1.5 shadow-inner">
                  <button onClick={() => setVariantQty(prev => Math.max(1, prev - 1))} className="w-5 h-5 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-500 font-extrabold text-xs active:scale-90">-</button>
                  <span className="text-xs font-black text-gray-800">{variantQty}</span>
                  <button onClick={() => setVariantQty(prev => prev + 1)} className="w-5 h-5 flex items-center justify-center bg-red-600 rounded-full text-white font-extrabold text-xs active:scale-90">+</button>
                </div>
              </div>

              {/* Selection constraint */}
              <div className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
                <p className="text-xs font-bold text-amber-800">Pilih Varian</p>
                <p className={`text-xs font-black ${totalVariantSelected() === variantQty ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {totalVariantSelected()} / {variantQty}
                </p>
              </div>

              {/* Variant list with quantity selectors */}
              <div className="space-y-0.5 border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                {variantSelections.map((v) => (
                  <div key={v.name} className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50 last:border-none">
                    <div>
                      <p className={`text-xs font-bold ${v.quantity > 0 ? 'text-red-700' : 'text-gray-800'}`}>{v.name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{formatPrice(v.price)}</p>
                    </div>
                    {v.quantity > 0 ? (
                      <div className="flex items-center space-x-2.5 bg-gray-50 border border-gray-150 rounded-full px-2.5 py-1 shadow-inner">
                        <button onClick={() => handleVariantQtyChange(v.name, -1)} className="w-5 h-5 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-500 font-extrabold text-xs active:scale-90">-</button>
                        <span className="text-xs font-black text-gray-800 min-w-[16px] text-center">{v.quantity}</span>
                        <button onClick={() => handleVariantQtyChange(v.name, 1)} className="w-5 h-5 flex items-center justify-center bg-red-600 rounded-full text-white font-extrabold text-xs active:scale-90">+</button>
                      </div>
                    ) : (
                      <button onClick={() => handleVariantQtyChange(v.name, 1)} className="w-7 h-7 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black rounded-xl flex items-center justify-center shadow shadow-red-600/20 transition-all">+</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-white space-y-2">
              {totalVariantSelected() !== variantQty && (
                <p className="text-[10px] font-bold text-red-500 text-center">
                  Pilih total {variantQty} varian (saat ini: {totalVariantSelected()})
                </p>
              )}
              <button
                onClick={handleSaveVariant}
                disabled={totalVariantSelected() !== variantQty}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-98 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-red-600/15 transition-all flex items-center justify-center space-x-2"
              >
                <span>Tambahkan ke Keranjang - {formatPrice(calculateVariantPrice())}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CART OVERLAY */}
      {showCartOverlay && (
        <div className="fixed inset-0 bg-black/60 z-50 flex flex-col justify-end transition-opacity duration-300">
          <div className="flex-1" onClick={() => setShowCartOverlay(false)} />
          <div className="bg-white rounded-t-[32px] shadow-2xl flex flex-col max-h-[80vh] w-full transition-transform duration-300 transform translate-y-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-black text-gray-900">Keranjang Saya</h2>
              <button onClick={() => setShowCartOverlay(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {cart.map((item) => {
                const isCustom = !!item.customization;
                const hasVariants = !!(item.selectedVariants && item.selectedVariants.length > 0);
                return (
                  <div key={item.id} className="bg-white border border-rose-50/50 rounded-2xl p-4 shadow-sm flex items-start justify-between relative">
                    <div className="flex items-start space-x-4 pr-16">
                      <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover border border-rose-50 mt-0.5" />
                      <div className="space-y-1">
                        <h3 className="font-extrabold text-gray-900 text-sm leading-tight">{item.name}</h3>
                        {isCustom && item.customization && (
                          <p className="text-[10px] text-gray-400 font-bold leading-normal">
                            {[
                              item.customization.spiciness || null,
                              item.customization.soup || null,
                              ...(item.customization.flavors.length > 0 ? [item.customization.flavors.join(' + ')] : []),
                              ...item.customization.toppings.map(t => `${t.name}${t.quantity > 1 ? ` ×${t.quantity}` : ''}`)
                            ].filter(Boolean).join(', ') || 'Tanpa custom'}
                          </p>
                        )}
                        {hasVariants && item.selectedVariants && (
                          <p className="text-[10px] text-gray-400 font-bold leading-normal">
                            {item.selectedVariants.map(v => `${v.name}${v.quantity > 1 ? ` ×${v.quantity}` : ''}`).join(', ')}
                          </p>
                        )}
                        {isCustom && item.customization && (
                          <div className="flex items-center space-x-1 text-[10px] font-bold text-gray-500">
                            <span>✍️</span>
                            <span>{item.customization.notes || 'Add note...'}</span>
                          </div>
                        )}
                        <p className="font-black text-red-600 text-xs pt-1">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>

                    {(isCustom || hasVariants) && (
                      <button
                        onClick={() => {
                          const apiItem = products.find(p => p.id === item.menuId);
                          if (apiItem) {
                            setShowCartOverlay(false);
                            if (isCustom) openCustomizationModal(apiItem, item);
                          }
                        }}
                        className="absolute right-4 top-4 text-xs font-black text-red-600 hover:opacity-80"
                      >
                        Edit
                      </button>
                    )}

                    <div className="absolute right-4 bottom-4 flex items-center space-x-2.5 bg-gray-50 border border-gray-150 rounded-full px-2.5 py-1 shadow-inner">
                      <button onClick={() => handleUpdateCartItemQty(item.id, -1)} className="w-4.5 h-4.5 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-500 font-extrabold text-xs active:scale-90">-</button>
                      <span className="text-xs font-black text-gray-800">{item.quantity}</span>
                      <button onClick={() => handleUpdateCartItemQty(item.id, 1)} className="w-4.5 h-4.5 flex items-center justify-center bg-red-600 rounded-full text-white font-extrabold text-xs active:scale-90">+</button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative p-1">
                  <div className="w-10 h-10 bg-rose-50 border border-red-100 rounded-full flex items-center justify-center text-red-700 shadow-inner">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white shadow">{calculateCartCount()}</span>
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Total Pembayaran</p>
                  <p className="text-sm font-black text-red-600 mt-0.5">{formatPrice(calculateCartTotal())}</p>
                </div>
              </div>
              <button onClick={() => router.push('/cart')} className="bg-red-600 hover:bg-red-700 active:scale-98 text-white font-black py-3.5 px-6 rounded-2xl flex items-center space-x-2 text-xs uppercase tracking-widest shadow-md shadow-red-600/10 transition-all">
                <span>Checkout</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

'use client';

import React from 'react';

interface ApiProduct {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  categoryId: string;
  variants?: { name: string; price: number }[];
}

interface ToppingSelection {
  name: string;
  quantity: number;
}

interface CartItem {
  id: string;
  menuId: string;
  name: string;
  price: number;
  basePrice: number;
  quantity: number;
  customization?: {
    spiciness: '' | 'Original' | 'Pedas Sedikit' | 'Sedang' | 'Pedas';
    soup: '' | 'Kering' | 'Sedang' | 'Banjir';
    flavors: string[];
    toppings: ToppingSelection[];
    notes: string;
  };
  selectedVariants?: { name: string; price: number; quantity: number }[];
  image: string;
}

interface Customization {
  spiciness: '' | 'Original' | 'Pedas Sedikit' | 'Sedang' | 'Pedas';
  soup: '' | 'Kering' | 'Sedang' | 'Banjir';
  flavors: string[];
  toppings: ToppingSelection[];
  notes: string;
}

const FLAVOR_OPTIONS = ['Gurih', 'Asin', 'Manis'];

interface Props {
  products: ApiProduct[];
  toppingOptions: { name: string; price: number }[];
  customization: Customization;
  customQty: number;
  setCustomQty: React.Dispatch<React.SetStateAction<number>>;
  setCustomization: React.Dispatch<React.SetStateAction<Customization>>;
  handleToggleFlavor: (f: string) => void;
  handleToppingQty: (n: string, d: number) => void;
  cart: CartItem[];
  editItemId: string | null;
  setEditItemId: React.Dispatch<React.SetStateAction<string | null>>;
  saveCart: (items: CartItem[]) => void;
  generateCartId: () => string;
  formatPrice: (num: number) => string;
  storeOpen: boolean;
}

export default function SeblakForm({
  products,
  toppingOptions,
  customization,
  customQty,
  setCustomQty,
  setCustomization,
  handleToggleFlavor,
  handleToppingQty,
  cart,
  editItemId,
  setEditItemId,
  saveCart,
  generateCartId,
  formatPrice,
  storeOpen
}: Props) {
  const seblakProduct = products.find(p => p.categoryId === 'seblak');
  if (!seblakProduct) return <div className="text-center py-12 text-gray-400 text-sm font-bold">Menu tidak tersedia</div>;

  const basePrice = seblakProduct.price;
  const toppingSum = customization.toppings.reduce((s, t) => s + (toppingOptions.find(o => o.name === t.name)?.price || 0) * t.quantity, 0);
  const unitPrice = basePrice + toppingSum;
  const totalSeblakInCart = cart.filter(c => c.customization).reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-rose-50/50 shadow-sm">
        <div className="flex items-center space-x-4">
          <img src={seblakProduct.imageUrl} alt={seblakProduct.name} className="w-16 h-16 rounded-2xl object-cover border border-rose-50" />
          <div>
            <h3 className="font-extrabold text-gray-900 text-[15px]">{seblakProduct.name}</h3>
            <p className="font-black text-red-600 text-xs mt-1">{formatPrice(unitPrice)} / porsi</p>
            {totalSeblakInCart > 0 && (
              <p className="text-[10px] font-bold text-emerald-600 mt-0.5">{totalSeblakInCart} porsi di keranjang</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3 bg-gray-50 border border-gray-150 rounded-full px-3 py-1.5 shadow-inner">
          <button onClick={() => setCustomQty(prev => Math.max(1, prev - 1))} className="w-5 h-5 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-500 font-extrabold text-xs active:scale-90">-</button>
          <span className="text-xs font-black text-gray-800">{customQty}</span>
          <button onClick={() => setCustomQty(prev => prev + 1)} className="w-5 h-5 flex items-center justify-center bg-red-600 rounded-full text-white font-extrabold text-xs active:scale-90">+</button>
        </div>
      </div>

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

      <div className="space-y-3">
        <h3 className="text-[11px] font-black tracking-wider uppercase text-gray-400">Topping (Bisa Pilih Lebih Dari 1)</h3>
        <div className="space-y-0.5 border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
          {toppingOptions.map((tOpt) => {
            const selected = customization.toppings.find(t => t.name === tOpt.name);
            const qty = selected?.quantity || 0;
            return (
              <div key={tOpt.name} className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50 last:border-none">
                <div>
                  <p className={`text-xs font-bold ${qty > 0 ? 'text-red-700' : 'text-gray-800'}`}>{tOpt.name}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{formatPrice(tOpt.price)}</p>
                </div>
                {qty > 0 ? (
                  <div className="flex items-center space-x-2.5 bg-gray-50 border border-gray-150 rounded-full px-2.5 py-1 shadow-inner">
                    <button onClick={() => handleToppingQty(tOpt.name, -1)} className="w-5 h-5 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-500 font-extrabold text-xs active:scale-90">-</button>
                    <span className="text-xs font-black text-gray-800 min-w-[16px] text-center">{qty}</span>
                    <button onClick={() => handleToppingQty(tOpt.name, 1)} className="w-5 h-5 flex items-center justify-center bg-red-600 rounded-full text-white font-extrabold text-xs active:scale-90">+</button>
                  </div>
                ) : (
                  <button onClick={() => handleToppingQty(tOpt.name, 1)} className="w-7 h-7 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black rounded-xl flex items-center justify-center shadow shadow-red-600/20 transition-all">+</button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-[11px] font-black tracking-wider uppercase text-gray-400">Catatan (Opsional)</h3>
        <textarea className="w-full bg-gray-50 border border-gray-150 rounded-2xl p-4 text-xs font-medium outline-none focus:bg-white focus:border-red-500 transition-all text-gray-700" rows={3} placeholder="Contoh: Jangan pakai daun bawang ya..." value={customization.notes} onChange={(e) => setCustomization(prev => ({ ...prev, notes: e.target.value }))} />
      </div>

      <div className="space-y-2 pb-6">
        {!storeOpen && (
          <p className="text-[10px] font-bold text-red-500 text-center">🔒 Toko tutup, belum bisa order</p>
        )}
        {(!customization.spiciness || !customization.soup || customization.toppings.length === 0) && storeOpen && (
          <p className="text-[10px] font-bold text-red-500 text-center">Lengkapi kepedasan, kuah, dan minimal 1 topping</p>
        )}
        <button
          onClick={() => {
            const seblakProduct = products.find(p => p.categoryId === 'seblak');
            if (!seblakProduct) return;
            let price = seblakProduct.price;
            customization.toppings.forEach(t => {
              const tOption = toppingOptions.find(opt => opt.name === t.name);
              if (tOption) price += tOption.price * t.quantity;
            });
            if (editItemId) {
              saveCart(cart.map(c =>
                c.id === editItemId ? { ...c, price, quantity: customQty, customization: { ...customization } } : c
              ));
              setEditItemId(null);
            } else {
              saveCart([...cart, {
                id: generateCartId(),
                menuId: seblakProduct.id,
                name: seblakProduct.name,
                price,
                basePrice: seblakProduct.price,
                quantity: customQty,
                customization: { ...customization },
                image: seblakProduct.imageUrl
              }]);
            }
            setCustomization({ spiciness: '', soup: '', flavors: [], toppings: [], notes: '' });
            setCustomQty(1);
          }}
          disabled={!storeOpen || !customization.spiciness || !customization.soup || customization.toppings.length === 0}
          className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-98 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-red-600/15 transition-all flex items-center justify-center space-x-2"
        >
          <span>{storeOpen ? `Tambahkan ke Keranjang - ${formatPrice(unitPrice * customQty)}` : '🔒 Toko Sedang Tutup'}</span>
        </button>
      </div>
    </div>
  );
}

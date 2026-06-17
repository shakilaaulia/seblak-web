"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import qris from "../../../assets/Qris.jpeg";

interface ToppingSelection {
  id?: string;
  name: string;
  price?: number;
  quantity: number;
}

interface SelectedVariant {
  name: string;
  price: number;
  quantity: number;
}

interface Customization {
  spiciness: "Original" | "Pedas Sedikit" | "Sedang" | "Pedas";
  soup: "Kering" | "Sedang" | "Banjir";
  flavors: string[];
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
  selectedVariants?: SelectedVariant[];
  image: string;
}

export default function CartPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Form states
  const [customerName, setCustomerName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("QRIS");

  // Payment proof states
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [paymentProofDataUrl, setPaymentProofDataUrl] = useState<string | null>(
    null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Store status
  const [storeOpen, setStoreOpen] = useState(true);
  const [storeLoading, setStoreLoading] = useState(true);

  // Form validation state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load cart on mount
  useEffect(() => {
    setIsClient(true);
    const storedCart = localStorage.getItem("seblak_cart");
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        console.error("Error loading cart:", e);
      }
    }
    fetch("/api/restaurant")
      .then((r) => r.json())
      .then((data) => {
        setStoreOpen(data.isOpen);
        setStoreLoading(false);
      })
      .catch(() => setStoreLoading(false));
  }, []);

  // Format price helper
  const formatPrice = (num: number) => {
    return "Rp" + num.toLocaleString("id-ID").replace(/\s/g, "");
  };

  // Calculate sum total
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Show message briefly
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle real file upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      triggerToast("Format file harus JPG atau PNG");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      triggerToast("Ukuran file maksimal 5MB");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setPaymentProofDataUrl(reader.result as string);
      setUploadedFileName(file.name);
      setIsUploading(false);
      triggerToast("Bukti pembayaran berhasil diunggah!");
    };
    reader.onerror = () => {
      setIsUploading(false);
      triggerToast("Gagal membaca file");
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Remove uploaded proof
  const handleRemoveProof = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedFileName(null);
    setPaymentProofDataUrl(null);
  };

  // Handle Checkout / Pesan Sekarang
  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      triggerToast("Mohon masukkan nama Anda");
      return;
    }
    if (!whatsappNumber.trim()) {
      triggerToast("Mohon masukkan nomor WhatsApp Anda");
      return;
    }
    if (!uploadedFileName) {
      triggerToast("Mohon unggah bukti pembayaran QRIS Anda");
      return;
    }

    const payload = {
      customerName,
      customerWhatsapp: whatsappNumber,
      notes: orderNotes,
      totalPrice: calculateTotal(),
      paymentProofUrl: paymentProofDataUrl,
      items: cart.map((item) => ({
        productId: item.menuId,
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
        customization: item.customization,
        selectedVariants: item.selectedVariants,
      })),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        triggerToast(errData.message || "Gagal mengirim pesanan. Coba lagi.");
        return;
      }

      const createdOrder = await res.json();

      // Save minimal reference to localStorage
      localStorage.setItem("seblak_active_order", JSON.stringify(createdOrder));

      // Clear the cart
      localStorage.removeItem("seblak_cart");
      setCart([]);

      triggerToast("Pesanan berhasil dibuat! Mengalihkan ke halaman status...");

      setTimeout(() => {
        router.push(`/order-status?id=${createdOrder.id}`);
      }, 1500);
    } catch {
      triggerToast("Gagal terhubung ke server");
    }
  };

  if (!isClient) return null;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen relative font-sans text-gray-800">
      {/* Toast Validation Box */}
      {toastMessage && (
        <div className="fixed top-5 inset-x-4 bg-gray-900/95 backdrop-blur text-white text-xs text-center py-3.5 px-5 rounded-xl shadow-2xl z-50 transition-all animate-bounce font-bold">
          {toastMessage}
        </div>
      )}

      {/* Header Bar */}
      <header className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3.5 z-30 flex items-center justify-between">
        <button
          onClick={() => router.push("/menu")}
          className="hover:opacity-85 transition-opacity"
        >
          <svg
            className="w-6 h-6 text-red-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h1 className="text-base font-black text-red-700 tracking-wide text-center">
          Konfirmasi Pesanan
        </h1>
        <div className="w-6 h-6" /> {/* Spacer to center the title */}
      </header>

      {/* Store Closed Banner */}
      {!storeLoading && !storeOpen && (
        <div className="bg-amber-500 text-white text-center py-3 px-4 text-xs font-bold">
          🕐 Warung sedang tutup. Kamu belum bisa melakukan pemesanan saat ini.
        </div>
      )}

      {/* Form Container */}
      <form
        onSubmit={handleOrderSubmit}
        className="flex-1 px-4 py-5 space-y-5 overflow-y-auto pb-32"
      >
        {/* 1. DATA PEMESAN */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center space-x-2.5 text-red-700">
            <svg
              className="w-5.5 h-5.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <h2 className="text-sm font-black tracking-wide text-gray-900">
              Data Pemesan
            </h2>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">
                Nama
              </label>
              <input
                type="text"
                required
                className="w-full bg-gray-50 border border-transparent rounded-2xl px-4 py-3 text-xs font-semibold outline-none focus:bg-white focus:border-red-500 transition-all text-gray-700"
                placeholder="Masukkan nama Anda"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">
                Nomor WhatsApp
              </label>
              <input
                type="tel"
                required
                className="w-full bg-gray-50 border border-transparent rounded-2xl px-4 py-3 text-xs font-semibold outline-none focus:bg-white focus:border-red-500 transition-all text-gray-700"
                placeholder="Contoh: 08123456789"
                value={whatsappNumber}
                onChange={(e) =>
                  setWhatsappNumber(e.target.value.replace(/\D/g, ""))
                }
              />
            </div>
          </div>
        </div>

        {/* 2. RINGKASAN PESANAN */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 text-red-700">
              <svg
                className="w-5.5 h-5.5"
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
              <h2 className="text-sm font-black tracking-wide text-gray-900">
                Ringkasan Pesanan
              </h2>
            </div>

            <button
              type="button"
              onClick={() => router.push("/menu")}
              className="text-xs font-black text-red-600 hover:opacity-80 transition-opacity"
            >
              Edit
            </button>
          </div>

          <div className="space-y-3.5">
            {cart.length === 0 ? (
              <div className="text-center py-6 text-xs font-bold text-gray-400">
                Belum ada pesanan. Silakan pilih seblak lezat di menu!
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-none last:pb-0"
                >
                  <div className="flex items-center space-x-3.5 pr-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover border border-rose-50"
                    />
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-xs">
                        {item.name}
                      </h3>
                      {item.customization && (
                        <p className="text-[9px] text-gray-400 font-bold leading-relaxed mt-0.5 max-w-[200px]">
                          {[
                            item.customization.spiciness || null,
                            item.customization.soup || null,
                            ...(item.customization.flavors.length > 0
                              ? [item.customization.flavors.join(" + ")]
                              : []),
                            ...item.customization.toppings.map(
                              (t) =>
                                `${t.name}${t.quantity > 1 ? ` ×${t.quantity}` : ""}`,
                            ),
                          ]
                            .filter(Boolean)
                            .join(", ") || "Tanpa custom"}
                        </p>
                      )}
                      {item.selectedVariants &&
                        item.selectedVariants.length > 0 && (
                          <p className="text-[9px] text-gray-400 font-bold leading-relaxed mt-0.5 max-w-[200px]">
                            {item.selectedVariants
                              .map(
                                (v) =>
                                  `${v.name}${v.quantity > 1 ? ` ×${v.quantity}` : ""}`,
                              )
                              .join(", ")}
                          </p>
                        )}
                      <p className="text-[10px] text-gray-400 font-extrabold mt-0.5">
                        {item.quantity}x
                      </p>
                    </div>
                  </div>
                  <span className="font-black text-red-600 text-xs shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. CATATAN (OPSIONAL) */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center space-x-2.5 text-red-700">
            <svg
              className="w-5.5 h-5.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <h2 className="text-sm font-black tracking-wide text-gray-900">
              Catatan (Opsional)
            </h2>
          </div>

          <textarea
            className="w-full bg-gray-50 border border-transparent rounded-2xl p-4 text-xs font-semibold outline-none focus:bg-white focus:border-red-500 transition-all text-gray-700"
            rows={2.5}
            placeholder="Contoh: Jangan pakai daun bawang ya..."
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
          />
        </div>

        {/* 4. METODE PEMBAYARAN */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center space-x-2.5 text-red-700">
            <svg
              className="w-5.5 h-5.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            <h2 className="text-sm font-black tracking-wide text-gray-900">
              Metode Pembayaran
            </h2>
          </div>

          {/* QRIS Select menu */}
          <div className="flex items-center justify-between bg-gray-50 border border-transparent rounded-2xl px-4 py-3 cursor-pointer">
            <span className="text-xs font-bold text-gray-800">
              {paymentMethod}
            </span>
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          {/* QRIS Code Image */}
          <div className="flex flex-col items-center py-2 bg-slate-50 rounded-2xl border border-gray-100">
            <p className="text-[9px] font-black tracking-widest text-gray-400 uppercase mb-2">
              QRIS SEBLAK MAMAH ZAHWA
            </p>
            <img
              src={qris.src}
              alt="QRIS Seblak Mamah Zahwa"
              className="w-48 h-48 object-contain"
            />
          </div>

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Dash-bordered box for Upload */}
          <div
            onClick={handleUploadClick}
            className={`border-2 border-dashed rounded-2xl py-6 px-4 flex flex-col items-center justify-center cursor-pointer transition-all ${
              uploadedFileName && paymentProofDataUrl
                ? "border-emerald-500 bg-emerald-50/20"
                : "border-red-100 hover:border-red-300 bg-rose-50/5 hover:bg-rose-50/10"
            }`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center space-y-2">
                <div className="w-7 h-7 rounded-full border-2 border-red-700 border-t-transparent animate-spin" />
                <p className="text-xs font-bold text-gray-500">Mengunggah...</p>
              </div>
            ) : uploadedFileName && paymentProofDataUrl ? (
              <div className="flex flex-col items-center text-center space-y-2">
                <img
                  src={paymentProofDataUrl}
                  alt="Bukti Transfer"
                  className="w-24 h-32 object-cover rounded-xl border border-emerald-200 shadow-sm"
                />
                <p className="text-[10px] font-extrabold text-emerald-800">
                  {uploadedFileName}
                </p>
                <button
                  type="button"
                  onClick={handleRemoveProof}
                  className="text-[10px] font-extrabold text-red-600 hover:underline"
                >
                  Hapus File
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center space-y-2">
                {/* Red upload circle */}
                <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/15">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                </div>
                <p className="text-xs font-black text-red-700">
                  Upload Bukti Pembayaran
                </p>
                <p className="text-[10px] text-gray-400 font-bold">
                  Format: JPG, PNG (Max 5MB)
                </p>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Sticky Bottom Total & Pay Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100/80 shadow-2xl px-5 py-4 flex items-center justify-between z-40">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">
              Total Pembayaran
            </p>
            <p className="text-lg font-black text-red-600 mt-0.5">
              {formatPrice(calculateTotal())}
            </p>
          </div>

          <button
            onClick={handleOrderSubmit}
            disabled={!storeOpen}
            className={`font-black py-4 px-10 rounded-2xl flex items-center space-x-2 text-xs uppercase tracking-widest shadow-md transition-all ${
              !storeOpen
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 active:scale-98 text-white shadow-red-600/10"
            }`}
          >
            <span>{!storeOpen ? "Toko Tutup" : "Pesan Sekarang"}</span>
          </button>
        </div>
      )}
    </div>
  );
}

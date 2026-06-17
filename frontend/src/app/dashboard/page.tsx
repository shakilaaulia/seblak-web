"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import type { OrderStatus, Product } from "@/lib/types";

interface DashboardOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerWhatsapp?: string;
  totalPrice: number;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  paymentProofUrl?: string;
  paymentProofFileName?: string;
  items?: {
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
    customization?: {
      spiciness: string;
      soup: string;
      flavors: string[];
      toppings: { name: string; quantity: number }[];
      notes: string;
    };
    selectedVariants?: { name: string; price: number; quantity: number }[];
  }[];
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

type TabId = "orders" | "stock" | "revenue" | "settings" | "menu";

const STATUS_ACTIONS: Record<
  OrderStatus,
  { label: string; action: string; color: string }[]
> = {
  PENDING: [
    {
      label: "Tolak",
      action: "decline",
      color: "bg-gray-50 border-gray-100 text-gray-700",
    },
    { label: "Verifikasi", action: "approve", color: "bg-red-700 text-white" },
  ],
  PROCESSING: [
    {
      label: "Selesai Masak",
      action: "ready",
      color: "bg-amber-500 text-white",
    },
  ],
  READY: [
    {
      label: "Selesaikan",
      action: "complete",
      color: "bg-emerald-600 text-white",
    },
  ],
  COMPLETED: [],
  DECLINED: [],
};

export default function SellerDashboard() {
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 4000);
    },
    [],
  );

  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [summary, setSummary] = useState<DashboardSummary>({
    totalOrdersToday: 0,
    pendingOrders: 0,
    processingOrders: 0,
    completedToday: 0,
    totalRevenueToday: 0,
  });

  const [activeTab, setActiveTab] = useState<TabId>("orders");
  const [loading, setLoading] = useState(true);

  // Store status
  const [storeStatus, setStoreStatus] = useState<"open" | "closed">("open");
  const [storeStatusLoading, setStoreStatusLoading] = useState(false);

  const fetchStoreStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/restaurant");
      if (res.ok) {
        const data = await res.json();
        setStoreStatus(data.isOpen ? "open" : "closed");
        setStoreSettings(prev => ({
          ...prev,
          storeName: data.name || prev.storeName,
          whatsapp: data.phone || prev.whatsapp,
          address: data.address || prev.address,
        }));
      }
    } catch {}
  }, []);

  const handleToggleStatus = async () => {
    const newStatus = storeStatus === "open" ? "closed" : "open";
    setStoreStatusLoading(true);
    try {
      const res = await fetch("/api/restaurant", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOpen: newStatus === "open" }),
      });
      if (res.ok) {
        setStoreStatus(newStatus);
        showToast(
          `toko: ${newStatus === "open" ? "Buka" : "Tutup"}`,
          "success",
        );
      }
    } catch {
      showToast("Gagal mengubah status toko", "error");
    } finally {
      setStoreStatusLoading(false);
    }
  };

  // Sound effect for new orders
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    type WebkitAudioWindow = Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext };
    const AudioContextCtor = window.AudioContext || (window as WebkitAudioWindow).webkitAudioContext;
    if (!AudioContextCtor) return;
    const ctx = new AudioContextCtor();
    audioCtxRef.current = ctx;
    fetch("/sounds/order-notification.mp3")
      .then((r) => r.arrayBuffer())
      .then((buf) => ctx.decodeAudioData(buf))
      .then((d) => {
        audioBufferRef.current = d;
      })
      .catch(() => {});
  }, []);

  const resumeAudio = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
  }, []);

  const playNewOrderSound = useCallback(() => {
    const ctx = audioCtxRef.current;
    const buf = audioBufferRef.current;
    if (!ctx || !buf) return;
    if (ctx.state === "suspended") ctx.resume();
    const source = ctx.createBufferSource();
    source.buffer = buf;
    const gain = ctx.createGain();
    gain.gain.value = 0.5;
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(0);
  }, []);

  // Payment proof preview
  const [paymentProofPreview, setPaymentProofPreview] = useState<{
    url: string;
    name: string;
    orderId: string;
  } | null>(null);

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error("Error fetching orders:", e);
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/sum");
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (e) {
      console.error("Error fetching summary:", e);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchOrders(), fetchSummary(), fetchStoreStatus()]).finally(
      () => setLoading(false),
    );
  }, [fetchOrders, fetchSummary, fetchStoreStatus]);

  // SSE for real-time new order notification + sound
  useEffect(() => {
    const es = new EventSource("/api/orders/events");
    es.addEventListener("new-order", () => {
      fetchOrders();
      fetchSummary();
      playNewOrderSound();
    });
    es.addEventListener("connected", () => {
      console.log("SSE connected");
    });
    es.onerror = () => {
      console.warn("SSE disconnected, will retry");
    };
    return () => es.close();
  }, [fetchOrders, fetchSummary, playNewOrderSound]);

  // Fallback polling every 30s in case SSE drops
  useEffect(() => {
    const id = setInterval(() => {
      fetchOrders();
      fetchSummary();
    }, 30000);
    return () => clearInterval(id);
  }, [fetchOrders, fetchSummary]);

  const handleOrderAction = async (
    orderId: string,
    action: string,
    extra?: Record<string, string>,
  ) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });

      if (res.ok) {
        const actionLabels: Record<string, string> = {
          approve: "✅ Pesanan diverifikasi, sedang dimasak...",
          ready: "🍽️ Pesanan siap diambil!",
          complete: "✅ Pesanan selesai",
          decline: "✕ Pesanan ditolak",
        };
        showToast(actionLabels[action] || "Berhasil", "success");
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.message || data.error || "Gagal memperbarui pesanan", "error");
      }
    } catch {
      showToast("Gagal terhubung ke server", "error");
    } finally {
      await Promise.all([
        fetchOrders(),
        fetchSummary(),
        fetchIngredients(),
        fetchToppings(),
      ]);
    }
  };

  // --- STOCK STATE ---
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [ingredientList, setIngredientList] = useState<
    {
      id: string;
      name: string;
      remaining: number;
      unit: string;
      minWarning: number;
    }[]
  >([]);

  const fetchIngredients = useCallback(async () => {
    try {
      const res = await fetch("/api/ingredients");
      if (res.ok) setIngredientList(await res.json());
    } catch {}
  }, []);

  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editStockValue, setEditStockValue] = useState<number>(0);

  const handleStockEdit = (id: string) => {
    const item =
      stockItems.find((s) => s.id === id) ||
      toppingList.find((t) => t.id === id) ||
      ingredientList.find((i) => i.id === id);
    if (item) {
      setEditingStockId(id);
      setEditStockValue(item.remaining);
    }
  };

  const handleStockSave = async (id: string) => {
    const isTopping = id.startsWith("t");
    const isIngredient = id.startsWith("i");
    if (isTopping) {
      try {
        await fetch(`/api/toppings/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ remaining: Math.max(0, editStockValue) }),
        });
      } catch {}
    }
    if (isIngredient) {
      try {
        await fetch(`/api/ingredients/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ remaining: Math.max(0, editStockValue) }),
        });
      } catch {}
    }
    setStockItems((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, remaining: Math.max(0, editStockValue) } : s,
      ),
    );
    setToppingList((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, remaining: Math.max(0, editStockValue) } : t,
      ),
    );
    setIngredientList((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, remaining: Math.max(0, editStockValue) } : i,
      ),
    );
    setEditingStockId(null);
    showToast("Stok berhasil diperbarui", "success");
  };

  const handleStockAdjust = async (id: string, delta: number) => {
    const isTopping = id.startsWith("t");
    const isIngredient = id.startsWith("i");
    setStockItems((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, remaining: Math.max(0, s.remaining + delta) } : s,
      ),
    );
    setToppingList((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, remaining: Math.max(0, t.remaining + delta) } : t,
      ),
    );
    setIngredientList((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, remaining: Math.max(0, i.remaining + delta) } : i,
      ),
    );
    const endpoint = isTopping
      ? "toppings"
      : isIngredient
        ? "ingredients"
        : null;
    if (endpoint) {
      try {
        const list = isTopping ? toppingList : ingredientList;
        const updated = list.find((x) => x.id === id);
        if (updated) {
          await fetch(`/api/${endpoint}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              remaining: Math.max(0, updated.remaining + delta),
            }),
          });
        }
      } catch {}
    }
  };

  // --- REVENUE STATE ---
  const revenueRecords: RevenueRecord[] = orders
    .filter((o) => o.status === "COMPLETED")
    .map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      amount: o.totalPrice,
      time: new Date(o.createdAt).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      paymentMethod: "QRIS",
      items: (o.items || []).map((i) => ({
        name: i.productName,
        qty: i.quantity,
        price: i.price,
      })),
      orderNotes: o.notes,
    }));

  const totalRevenue = revenueRecords.reduce((sum, r) => sum + r.amount, 0);

  const [selectedRevenue, setSelectedRevenue] = useState<RevenueRecord | null>(
    null,
  );

  // --- SETTINGS STATE ---
  const [storeSettings, setStoreSettings] = useState({
    storeName: "Seblak Mamah Zahwa",
    whatsapp: "+6285943054626",
    address: "Jl. Pedas Manis No. 10, Bandung",
    openHour: "09:00",
    closeHour: "21:00",
    qrisName: "SEBLAK MAMAH ZAHWA",
  });

  // --- MENU STATE ---
  const [menuProducts, setMenuProducts] = useState<Product[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuModal, setMenuModal] = useState<{ open: boolean; edit?: Product }>(
    { open: false },
  );
  const [menuForm, setMenuForm] = useState<{
    name: string;
    price: string;
    description: string;
    imageUrl: string;
    categoryId: string;
    hasVariants: boolean;
    variants: string;
    recipe: { ingredientId: string; name: string; quantity: number }[];
  }>({
    name: "",
    price: "",
    description: "",
    imageUrl: "",
    categoryId: "makanan",
    hasVariants: false,
    variants: "",
    recipe: [],
  });
  const [newIngredientName, setNewIngredientName] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [confirmDecline, setConfirmDecline] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<DashboardOrder | null>(null);

  const fetchMenuProducts = useCallback(async () => {
    try {
      setMenuLoading(true);
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setMenuProducts(data);
      }
    } catch (e) {
      console.error("Error fetching products:", e);
    } finally {
      setMenuLoading(false);
    }
  }, []);

  const openMenuModal = (product?: Product) => {
    if (product) {
      setMenuForm({
        name: product.name,
        price: String(product.price),
        description: product.description || "",
        imageUrl: product.imageUrl || "",
        categoryId: product.categoryId || "makanan",
        hasVariants: !!(product.variants && product.variants.length > 0),
        variants: product.variants
          ? product.variants.map((v) => `${v.name}:${v.price}`).join("\n")
          : "",
        recipe: product.recipe ? product.recipe.map((r) => ({ ...r })) : [],
      });
      setMenuModal({ open: true, edit: product });
    } else {
      setMenuForm({
        name: "",
        price: "",
        description: "",
        imageUrl: "",
        categoryId: "makanan",
        hasVariants: false,
        variants: "",
        recipe: [],
      });
      setMenuModal({ open: true });
    }
  };

  const handleAddIngredient = async () => {
    const name = newIngredientName.trim();
    if (!name) return;
    try {
      const res = await fetch("/api/ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const ing = await res.json();
        setMenuForm((prev) => ({
          ...prev,
          recipe: [
            ...prev.recipe,
            { ingredientId: ing.id, name: ing.name, quantity: 1 },
          ],
        }));
        setNewIngredientName("");
        await fetchIngredients();
      }
    } catch {}
  };

  const handleMenuSave = async () => {
    if (!menuForm.name || !menuForm.price) return;
    const parsedVariants =
      menuForm.hasVariants && menuForm.variants.trim()
        ? menuForm.variants
            .split("\n")
            .filter(Boolean)
            .map((line) => {
              const [name, priceStr] = line.split(":");
              return {
                name: name.trim(),
                price: parseInt(priceStr.trim()) || 0,
              };
            })
        : undefined;

    const payload = {
      name: menuForm.name,
      price: parseInt(menuForm.price) || 0,
      description: menuForm.description,
      imageUrl: menuForm.imageUrl,
      categoryId: menuForm.categoryId,
      variants: parsedVariants,
      recipe: menuForm.recipe.length > 0 ? menuForm.recipe : undefined,
    };

    try {
      if (menuModal.edit) {
        const res = await fetch(`/api/products/${menuModal.edit.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          showToast("Menu berhasil diperbarui", "success");
          await fetchMenuProducts();
        }
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          showToast("Menu berhasil ditambahkan", "success");
          await fetchMenuProducts();
        }
      }
      setMenuModal({ open: false });
    } catch {
      showToast("Gagal menyimpan menu", "error");
    }
  };

  const handleMenuDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Menu berhasil dihapus", "success");
        await fetchMenuProducts();
      }
    } catch {
      showToast("Gagal menghapus menu", "error");
    }
    setDeleteConfirm(null);
  };

  // --- TOPPING STATE ---
  const [toppingList, setToppingList] = useState<
    {
      id: string;
      name: string;
      price: number;
      remaining: number;
      minWarning: number;
      unit: string;
    }[]
  >([]);
  const [toppingModal, setToppingModal] = useState<{
    open: boolean;
    edit?: { id: string; name: string; price: number };
  }>({ open: false });
  const [toppingForm, setToppingForm] = useState({ name: "", price: "" });
  const [toppingDelete, setToppingDelete] = useState<string | null>(null);

  const fetchToppings = useCallback(async () => {
    try {
      const res = await fetch("/api/toppings");
      if (res.ok) {
        const data = await res.json();
        setToppingList(data);
      }
    } catch (e) {
      console.error("Error fetching toppings:", e);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "menu" || activeTab === "stock") {
      Promise.resolve().then(() => fetchMenuProducts());
      Promise.resolve().then(() => fetchToppings());
      Promise.resolve().then(() => fetchIngredients());
    }
  }, [activeTab, fetchMenuProducts, fetchToppings, fetchIngredients]);

  const openToppingModal = (item?: {
    id: string;
    name: string;
    price: number;
  }) => {
    if (item) {
      setToppingForm({ name: item.name, price: String(item.price) });
      setToppingModal({ open: true, edit: item });
    } else {
      setToppingForm({ name: "", price: "" });
      setToppingModal({ open: true });
    }
  };

  const handleToppingSave = async () => {
    if (!toppingForm.name || !toppingForm.price) return;
    try {
      if (toppingModal.edit) {
        await fetch(`/api/toppings/${toppingModal.edit.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: toppingForm.name,
            price: parseInt(toppingForm.price),
          }),
        });
        showToast("Topping berhasil diperbarui", "success");
      } else {
        await fetch("/api/toppings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: toppingForm.name,
            price: parseInt(toppingForm.price),
          }),
        });
        showToast("Topping berhasil ditambahkan", "success");
      }
      await fetchToppings();
      setToppingModal({ open: false });
    } catch {
      showToast("Gagal menyimpan topping", "error");
    }
  };

  const handleToppingDelete = async (id: string) => {
    try {
      await fetch(`/api/toppings/${id}`, { method: "DELETE" });
      showToast("Topping berhasil dihapus", "success");
      await fetchToppings();
    } catch {
      showToast("Gagal menghapus topping", "error");
    }
    setToppingDelete(null);
  };

  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  const processingCount = orders.filter(
    (o) => o.status === "PROCESSING",
  ).length;

  return (
    <div
      className="flex-1 flex flex-col bg-slate-50 min-h-screen pb-24 relative select-none"
      onClick={resumeAudio}
    >
      {toast && (
        <div
          className={`fixed top-5 inset-x-4 z-50 text-xs text-center py-3.5 px-5 rounded-xl shadow-2xl font-bold transition-all animate-bounce ${
            toast.type === "success"
              ? "bg-emerald-700 text-white"
              : toast.type === "error"
                ? "bg-red-700 text-white"
                : "bg-gray-900 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 bg-red-800 text-white flex items-center justify-between px-4 py-3.5 shadow-md z-30">
        <span className="text-white font-bold text-lg tracking-wide">
          Warung Seblak Mamah Zahwa
        </span>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleToggleStatus}
            disabled={storeStatusLoading}
            className={`px-3 py-1.5 rounded-full text-xs font-black transition-all ${
              storeStatus === "open"
                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                : "bg-gray-600 text-white hover:bg-gray-700"
            }`}
          >
            {storeStatus === "open" ? "BUKA" : "TUTUP"}
          </button>
          <div className="relative">
            <div className="w-8 h-8 rounded-full border border-red-400 bg-red-600 flex items-center justify-center text-xs font-bold shadow-inner">
              P
            </div>
            {pendingCount + processingCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-red-800">
                {pendingCount + processingCount}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        <div className="flex items-baseline justify-between">
          <h1 className="text-xl font-bold text-red-700 tracking-tight">
            Ringkasan Dapur
          </h1>
          <span className="text-xs text-gray-400 font-semibold">Hari ini</span>
        </div>

        {/* Stats Cards */}
        <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-none">
          <div className="bg-white border border-rose-100/50 rounded-2xl p-4 shadow-sm min-w-[120px] flex-1 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
              Pesanan Hari Ini
            </span>
            <span className="text-2xl font-black text-gray-900">
              {summary.totalOrdersToday}
            </span>
          </div>
          <div className="bg-white border border-rose-100/50 rounded-2xl p-4 shadow-sm min-w-[120px] flex-1 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-2">
              Pending
            </span>
            <span className="text-2xl font-black text-red-600">
              {summary.pendingOrders}
            </span>
          </div>
          <div className="bg-amber-500 rounded-2xl p-4 shadow-sm min-w-[120px] flex-1 flex flex-col justify-between text-white">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-100 mb-2">
              Processing
            </span>
            <span className="text-2xl font-black text-white">
              {summary.processingOrders}
            </span>
          </div>
        </div>

        {/* Revenue Banner */}
        <div className="relative bg-gradient-to-r from-red-700 to-red-800 text-white rounded-2xl p-5 shadow-md overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none transform translate-x-8 -translate-y-8">
            <svg viewBox="0 0 100 100" fill="currentColor">
              <rect x="10" y="10" width="80" height="80" rx="15" />
            </svg>
          </div>
          <div className="space-y-1 relative z-10">
            <p className="text-[11px] font-bold text-red-200 uppercase tracking-widest">
              Pendapatan Hari Ini
            </p>
            <h2 className="text-2xl font-black tracking-tight">
              Rp {summary.totalRevenueToday.toLocaleString("id-ID")}
            </h2>
          </div>
        </div>

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-red-700 tracking-tight">Pesanan</h3>
              <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                {orders.length} pesanan
              </span>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm">
                  Memuat...
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white border border-rose-100 rounded-2xl p-8 text-center text-gray-400 text-sm">
                  Belum ada pesanan 📋
                </div>
              ) : (
                orders.map((order) => {
                  const statusLabel: Record<OrderStatus, string> = {
                    PENDING: "Menunggu Verifikasi",
                    PROCESSING: "Sedang Dimasak",
                    READY: "Siap Diambil",
                    COMPLETED: "Selesai",
                    DECLINED: "Ditolak",
                  };
                  const statusColor: Record<OrderStatus, string> = {
                    PENDING: "bg-rose-50 text-red-600",
                    PROCESSING: "bg-amber-50 text-amber-600",
                    READY: "bg-emerald-50 text-emerald-600",
                    COMPLETED: "bg-gray-50 text-gray-600",
                    DECLINED: "bg-gray-100 text-gray-500",
                  };
                  const borderColor: Record<OrderStatus, string> = {
                    PENDING: "border-l-red-600",
                    PROCESSING: "border-l-amber-500",
                    READY: "border-l-emerald-500",
                    COMPLETED: "border-l-gray-400",
                    DECLINED: "border-l-gray-300",
                  };

                  return (
                    <div
                      key={order.id}
                      className={`bg-white border-l-4 rounded-2xl p-4 shadow-sm border border-rose-50/50 flex flex-col space-y-3.5 transition-all ${borderColor[order.status]}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor[order.status]}`}
                          >
                            {order.orderNumber}
                          </span>
                          <span className="text-[9px] text-gray-400 font-bold">
                            — {order.customerName}
                          </span>
                        </div>
                        <span className="font-bold text-red-600 text-sm">
                          Rp {order.totalPrice.toLocaleString("id-ID")}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-full ${statusColor[order.status]}`}
                        >
                          {statusLabel[order.status]}
                        </span>
                        {order.notes && (
                          <span className="text-[9px] text-gray-400">
                            📝 {order.notes}
                          </span>
                        )}
                      </div>

                      {/* Items summary */}
                      {order.items && order.items.length > 0 && (
                        <div className="text-[10px] text-gray-500 font-semibold">
                          {order.items.map((item, i) => (
                            <span key={i}>
                              {item.productName} × {item.quantity}
                              {i < order.items!.length - 1 ? ", " : ""}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Detail button */}
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                      >
                        <span>📋</span>
                        <span>Lihat Detail Pesanan</span>
                      </button>

                      {/* Payment Proof for PENDING */}
                      {order.status === "PENDING" && order.paymentProofUrl && (
                        <div className="bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-2.5 flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-10 rounded-lg overflow-hidden border border-amber-200 bg-white flex-shrink-0">
                              <img
                                src={order.paymentProofUrl}
                                alt="Bukti TF"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-[10px] font-bold text-amber-800">
                              {order.paymentProofFileName || "Bukti Transfer"}
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              setPaymentProofPreview({
                                url: order.paymentProofUrl!,
                                name:
                                  order.paymentProofFileName ||
                                  "Bukti Transfer",
                                orderId: order.id,
                              })
                            }
                            className="text-[10px] font-black text-red-700 hover:underline"
                          >
                            Lihat
                          </button>
                        </div>
                      )}

                      {/* Action Buttons */}
                      {STATUS_ACTIONS[order.status]?.length > 0 && (
                        <div className="flex items-center space-x-2 pt-1 border-t border-gray-50">
                          {STATUS_ACTIONS[order.status].map((btn) => (
                            <button
                              key={btn.action}
                              onClick={() => {
                                if (btn.action === "decline") {
                                  setDeclineReason("");
                                  setConfirmDecline(order.id);
                                } else {
                                  handleOrderAction(order.id, btn.action);
                                }
                              }}
                              className={`flex-1 ${btn.color} font-bold py-2.5 px-4 rounded-xl text-xs active:scale-[0.98] transition-all flex items-center justify-center space-x-1 shadow-sm`}
                            >
                              {btn.action === "approve" && <span>✓</span>}
                              {btn.action === "decline" && <span>✕</span>}
                              {btn.action === "ready" && <span>🔥</span>}
                              {btn.action === "complete" && <span>✅</span>}
                              <span>{btn.label}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* WhatsApp CTA — only for active orders */}
                      {(order.status === "PENDING" ||
                        order.status === "PROCESSING" ||
                        order.status === "READY") &&
                        order.customerWhatsapp && (
                          <div className="pt-1 border-t border-gray-50">
                            <a
                              href={`https://wa.me/${order.customerWhatsapp.replace(/[^0-9]/g, "").replace(/^0/, "62")}?text=Halo%20${encodeURIComponent(order.customerName)}%2C%20terima%20kasih%20sudah%20memesan%20di%20Seblak%20Mamah%20Zahwa%20${order.orderNumber}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs active:scale-[0.98] transition-all shadow-sm"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                              </svg>
                              <span>Chat WhatsApp</span>
                            </a>
                          </div>
                        )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* STOCK TAB */}
        {activeTab === "stock" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-red-700 tracking-tight">
                Manajemen Stok
              </h3>
              <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                {
                  [...stockItems, ...toppingList, ...ingredientList].filter(
                    (s) => s.remaining <= s.minWarning,
                  ).length
                }{" "}
                hampir habis
              </span>
            </div>
            <div className="space-y-2.5">
              {[
                ...stockItems,
                ...toppingList.map((t) => ({
                  id: t.id,
                  name: t.name,
                  remaining: t.remaining,
                  unit: t.unit,
                  minWarning: t.minWarning,
                })),
                ...ingredientList,
              ].map((item) => {
                const isLow = item.remaining <= item.minWarning;
                const isEditing = editingStockId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl p-4 shadow-sm border transition-all ${isLow ? "border-red-200 border-l-4 border-l-red-500" : "border-rose-50/50"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                          Satuan: {item.unit}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        {isEditing ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              className="w-20 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-center outline-none focus:border-red-500"
                              value={editStockValue}
                              onChange={(e) =>
                                setEditStockValue(
                                  Math.max(0, parseInt(e.target.value) || 0),
                                )
                              }
                              min={0}
                            />
                            <button
                              onClick={() => handleStockSave(item.id)}
                              className="bg-red-700 text-white font-black text-[10px] px-3 py-2 rounded-xl hover:bg-red-800 active:scale-95"
                            >
                              Simpan
                            </button>
                            <button
                              onClick={() => setEditingStockId(null)}
                              className="bg-gray-100 text-gray-500 font-bold text-[10px] px-3 py-2 rounded-xl hover:bg-gray-200 active:scale-95"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center space-x-2.5">
                              <button
                                onClick={() => handleStockAdjust(item.id, -1)}
                                className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 font-extrabold text-xs active:scale-90"
                              >
                                -
                              </button>
                              <span
                                className={`text-sm font-black min-w-[40px] text-center ${isLow ? "text-red-600" : "text-gray-800"}`}
                              >
                                {item.remaining}
                              </span>
                              <button
                                onClick={() => handleStockAdjust(item.id, 1)}
                                className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white font-extrabold text-xs active:scale-90"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => handleStockEdit(item.id)}
                              className="text-[9px] font-bold text-red-600 hover:underline ml-1"
                            >
                              Edit
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    {isLow && !isEditing && (
                      <p className="text-[9px] font-bold text-red-600 mt-2 bg-red-50 px-3 py-1 rounded-lg inline-block">
                        ⚠️ Stok menipis! Segera restock.
                      </p>
                    )}
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
              <h3 className="font-bold text-red-700 tracking-tight">
                Pendapatan
              </h3>
              <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                {revenueRecords.length} transaksi
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-rose-100/50 rounded-2xl p-4 shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Total Pendapatan
                </p>
                <p className="text-xl font-black text-red-700 mt-1">
                  Rp {totalRevenue.toLocaleString("id-ID")}
                </p>
              </div>
              <div className="bg-white border border-rose-100/50 rounded-2xl p-4 shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Transaksi Selesai
                </p>
                <p className="text-xl font-black text-gray-900 mt-1">
                  {revenueRecords.length}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-rose-50/50 shadow-sm">
              <h4 className="text-xs font-black text-gray-800 mb-4">
                Riwayat Transaksi
              </h4>
              <div className="space-y-3">
                {revenueRecords.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">
                    Belum ada transaksi selesai
                  </p>
                ) : (
                  revenueRecords.map((record) => {
                    const maxAmount = Math.max(
                      ...revenueRecords.map((r) => r.amount),
                      1,
                    );
                    const barWidth = (record.amount / maxAmount) * 100;
                    return (
                      <button
                        key={record.id}
                        onClick={() => setSelectedRevenue(record)}
                        className="w-full text-left space-y-1 group"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-gray-700 group-hover:text-red-700 transition-colors">
                              {record.orderNumber}
                            </span>
                            <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                              {record.customerName}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] text-gray-400">
                              {record.time}
                            </span>
                            <span className="font-black text-red-600">
                              Rp {record.amount.toLocaleString("id-ID")}
                            </span>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-red-600 to-amber-500 transition-all group-hover:from-red-500 group-hover:to-amber-400"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* MENU TAB */}
        {activeTab === "menu" && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-red-700 tracking-tight">
                  Daftar Menu
                </h3>
                <button
                  onClick={() => openMenuModal()}
                  className="bg-red-700 hover:bg-red-800 text-white font-black text-[10px] px-3.5 py-2 rounded-xl flex items-center space-x-1.5 active:scale-95 transition-all"
                >
                  <span>+</span>
                  <span>Tambah Menu</span>
                </button>
              </div>
              <div className="space-y-2.5">
                {menuLoading ? (
                  <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm">
                    Memuat...
                  </div>
                ) : menuProducts.length === 0 ? (
                  <div className="bg-white border border-rose-100 rounded-2xl p-8 text-center text-gray-400 text-sm">
                    Belum ada menu. Tambahkan menu baru!
                  </div>
                ) : (
                  menuProducts.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white rounded-2xl p-3.5 border border-rose-50/50 shadow-sm flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3.5">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover border border-rose-50"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-150 flex items-center justify-center text-gray-400 text-xs font-bold">
                            No img
                          </div>
                        )}
                        <div>
                          <h4 className="font-extrabold text-gray-900 text-sm">
                            {p.name}
                          </h4>
                          <p className="text-[10px] text-gray-400 font-bold mt-0.5 capitalize">
                            {p.categoryId} • Rp{" "}
                            {p.price.toLocaleString("id-ID")}
                          </p>
                          {p.description && (
                            <p className="text-[9px] text-gray-300 font-medium mt-0.5 max-w-[200px] truncate">
                              {p.description}
                            </p>
                          )}
                          {p.variants && p.variants.length > 0 && (
                            <p className="text-[9px] text-amber-600 font-bold mt-0.5">
                              {p.variants.length} varian
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openMenuModal(p)}
                          className="text-[9px] font-bold text-red-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(p.id)}
                          className="text-[9px] font-bold text-gray-400 hover:text-red-600 hover:underline"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* TOPPING MANAGEMENT */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-red-700 tracking-tight">
                  Topping Seblak
                </h3>
                <button
                  onClick={() => openToppingModal()}
                  className="bg-red-700 hover:bg-red-800 text-white font-black text-[10px] px-3.5 py-2 rounded-xl flex items-center space-x-1.5 active:scale-95 transition-all"
                >
                  <span>+</span>
                  <span>Tambah Topping</span>
                </button>
              </div>
              <div className="space-y-2">
                {toppingList.map((t) => (
                  <div
                    key={t.id}
                    className="bg-white rounded-2xl p-3.5 border border-rose-50/50 shadow-sm flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-500 flex-shrink-0">
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
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-gray-900 text-sm">
                          {t.name}
                        </h4>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                          Rp {t.price.toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openToppingModal(t)}
                        className="text-[9px] font-bold text-red-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setToppingDelete(t.id)}
                        className="text-[9px] font-bold text-gray-400 hover:text-red-600 hover:underline"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div className="space-y-4">
            <h3 className="font-bold text-red-700 tracking-tight">
              Pengaturan Toko
            </h3>
            <div className="bg-white rounded-2xl p-5 border border-rose-50/50 shadow-sm space-y-5">
              {[
                {
                  label: "Nama Toko",
                  value: storeSettings.storeName,
                  key: "storeName",
                },
                {
                  label: "Nomor WhatsApp",
                  value: storeSettings.whatsapp,
                  key: "whatsapp",
                },
                {
                  label: "Alamat",
                  value: storeSettings.address,
                  key: "address",
                },
                {
                  label: "Nama QRIS",
                  value: storeSettings.qrisName,
                  key: "qrisName",
                },
              ].map((field: { label: string; value: string; key: string }) => (
                <div key={field.key}>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    className="w-full bg-gray-50 border border-transparent rounded-2xl px-4 py-3 text-xs font-semibold outline-none focus:bg-white focus:border-red-500 transition-all text-gray-700"
                    value={field.value}
                    onChange={(e) =>
                      setStoreSettings((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">
                    Buka
                  </label>
                  <input
                    type="time"
                    className="w-full bg-gray-50 border border-transparent rounded-2xl px-4 py-3 text-xs font-semibold outline-none focus:bg-white focus:border-red-500 transition-all text-gray-700"
                    value={storeSettings.openHour}
                    onChange={(e) =>
                      setStoreSettings((prev) => ({
                        ...prev,
                        openHour: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">
                    Tutup
                  </label>
                  <input
                    type="time"
                    className="w-full bg-gray-50 border border-transparent rounded-2xl px-4 py-3 text-xs font-semibold outline-none focus:bg-white focus:border-red-500 transition-all text-gray-700"
                    value={storeSettings.closeHour}
                    onChange={(e) =>
                      setStoreSettings((prev) => ({
                        ...prev,
                        closeHour: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <button
                onClick={async () => {
                  try {
                    await fetch("/api/restaurant", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        name: storeSettings.storeName,
                        phone: storeSettings.whatsapp,
                        address: storeSettings.address,
                      }),
                    });
                    showToast("Pengaturan berhasil disimpan", "success");
                  } catch {
                    showToast("Gagal menyimpan pengaturan", "error");
                  }
                }}
                className="w-full bg-red-700 hover:bg-red-800 text-white font-black py-3.5 px-6 rounded-2xl text-xs tracking-wider active:scale-[0.98] transition-all"
              >
                Simpan Pengaturan
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Revenue Detail Modal */}
      {selectedRevenue && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex flex-col justify-end"
          onClick={() => setSelectedRevenue(null)}
        >
          <div className="flex-1" />
          <div
            className="bg-white rounded-t-[32px] shadow-2xl flex flex-col max-h-[80vh] w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-black text-gray-900">
                Detail Transaksi
              </h2>
              <button
                onClick={() => setSelectedRevenue(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                      ID Pesanan
                    </p>
                    <h3 className="text-lg font-black text-red-700 mt-0.5">
                      {selectedRevenue.orderNumber}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                      Waktu
                    </p>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">
                      {selectedRevenue.time}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-black">
                  {selectedRevenue.customerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-black text-gray-900">
                    {selectedRevenue.customerName}
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                    Pembayaran: {selectedRevenue.paymentMethod}
                  </p>
                </div>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-2 shadow-sm">
                <div className="px-3 py-2 border-b border-gray-50">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    Pesanan ({selectedRevenue.items.length} item)
                  </p>
                </div>
                <div className="divide-y divide-gray-50">
                  {selectedRevenue.items.map((item, i) => (
                    <div key={i} className="px-3 py-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 pr-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-gray-900 text-sm">
                              {item.name}
                            </span>
                            <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                              {item.qty}x
                            </span>
                          </div>
                          {item.customization && (
                            <p className="text-[9px] text-gray-400 font-bold mt-1">
                              {item.customization}
                            </p>
                          )}
                        </div>
                        <span className="font-black text-red-600 text-xs shrink-0">
                          Rp {(item.price * item.qty).toLocaleString("id-ID")}
                        </span>
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
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                        Catatan
                      </p>
                      <p className="text-xs font-semibold text-gray-700 mt-1">
                        {selectedRevenue.orderNotes}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-red-700 rounded-2xl p-5 text-white flex items-center justify-between shadow-lg">
                <p className="text-sm font-black uppercase tracking-wider">
                  Total Pembayaran
                </p>
                <p className="text-xl font-black">
                  Rp {selectedRevenue.amount.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Proof Preview Modal */}
      {paymentProofPreview && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
          onClick={() => setPaymentProofPreview(null)}
        >
          <div
            className="relative max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPaymentProofPreview(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white text-xs font-bold bg-white/10 px-3 py-1.5 rounded-full"
            >
              Tutup ✕
            </button>
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
              <div className="bg-red-50 px-4 py-3 border-b border-red-100 flex items-center justify-between">
                <p className="text-xs font-black text-gray-700">
                  Bukti Transfer
                </p>
                <p className="text-[9px] font-bold text-gray-400 truncate max-w-[150px]">
                  {paymentProofPreview.name}
                </p>
              </div>
              <img
                src={paymentProofPreview.url}
                alt={paymentProofPreview.name}
                className="w-full h-auto object-contain max-h-[70vh]"
              />
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-center">
                <button
                  onClick={() => {
                    const id = paymentProofPreview.orderId;
                    setPaymentProofPreview(null);
                    handleOrderAction(id, "approve");
                  }}
                  className="bg-red-700 text-white font-black py-2 px-6 rounded-xl text-xs active:scale-95 transition-all"
                >
                  Verifikasi Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Menu Add/Edit Modal */}
      {menuModal.open && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex flex-col justify-end"
          onClick={() => setMenuModal({ open: false })}
        >
          <div className="flex-1" />
          <div
            className="bg-white rounded-t-[32px] shadow-2xl flex flex-col max-h-[85vh] w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-black text-gray-900">
                {menuModal.edit ? "Edit Menu" : "Tambah Menu"}
              </h2>
              <button
                onClick={() => setMenuModal({ open: false })}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">
                  Nama Menu
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border border-transparent rounded-2xl px-4 py-3 text-xs font-semibold outline-none focus:bg-white focus:border-red-500 transition-all text-gray-700"
                  placeholder="Nama menu"
                  value={menuForm.name}
                  onChange={(e) =>
                    setMenuForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">
                  Harga (Rp)
                </label>
                <input
                  type="number"
                  className="w-full bg-gray-50 border border-transparent rounded-2xl px-4 py-3 text-xs font-semibold outline-none focus:bg-white focus:border-red-500 transition-all text-gray-700"
                  placeholder="10000"
                  value={menuForm.price}
                  onChange={(e) =>
                    setMenuForm((prev) => ({ ...prev, price: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">
                  Deskripsi
                </label>
                <textarea
                  className="w-full bg-gray-50 border border-transparent rounded-2xl px-4 py-3 text-xs font-semibold outline-none focus:bg-white focus:border-red-500 transition-all text-gray-700"
                  rows={2}
                  placeholder="Deskripsi menu (opsional)"
                  value={menuForm.description}
                  onChange={(e) =>
                    setMenuForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">
                  URL Gambar
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border border-transparent rounded-2xl px-4 py-3 text-xs font-semibold outline-none focus:bg-white focus:border-red-500 transition-all text-gray-700"
                  placeholder="https://... (opsional)"
                  value={menuForm.imageUrl}
                  onChange={(e) =>
                    setMenuForm((prev) => ({
                      ...prev,
                      imageUrl: e.target.value,
                    }))
                  }
                />
                {menuForm.imageUrl && (
                  <div className="mt-2 w-16 h-16 rounded-xl overflow-hidden border border-gray-100">
                    <img
                      src={menuForm.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">
                  Kategori
                </label>
                <select
                  className="w-full bg-gray-50 border border-transparent rounded-2xl px-4 py-3 text-xs font-semibold outline-none focus:bg-white focus:border-red-500 transition-all text-gray-700"
                  value={menuForm.categoryId}
                  onChange={(e) =>
                    setMenuForm((prev) => ({
                      ...prev,
                      categoryId: e.target.value,
                    }))
                  }
                >
                  <option value="seblak">Seblak</option>
                  <option value="makanan">Makanan</option>
                  <option value="minuman">Minuman</option>
                </select>
              </div>
              <div className="flex items-center space-x-3 py-1">
                <label className="text-xs font-bold text-gray-700">
                  Punya Varian?
                </label>
                <button
                  onClick={() =>
                    setMenuForm((prev) => ({
                      ...prev,
                      hasVariants: !prev.hasVariants,
                    }))
                  }
                  className={`w-10 h-5 rounded-full transition-colors relative ${menuForm.hasVariants ? "bg-red-600" : "bg-gray-300"}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform shadow-sm ${menuForm.hasVariants ? "translate-x-5" : "translate-x-0.5"}`}
                  />
                </button>
              </div>
              {menuForm.hasVariants && (
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">
                    Varian (nama:harga per baris)
                  </label>
                  <textarea
                    className="w-full bg-gray-50 border border-transparent rounded-2xl px-4 py-3 text-xs font-semibold outline-none focus:bg-white focus:border-red-500 transition-all text-gray-700"
                    rows={4}
                    placeholder="Coklat:5000&#10;Vanilla:6000&#10;Stroberi:5000&#10;Mangga:5500"
                    value={menuForm.variants}
                    onChange={(e) =>
                      setMenuForm((prev) => ({
                        ...prev,
                        variants: e.target.value,
                      }))
                    }
                  />
                </div>
              )}

              {/* Bahan Baku (Ingredients) */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
                  Bahan Baku
                </label>
                {ingredientList.length === 0 ? (
                  <p className="text-[10px] text-gray-400">
                    Belum ada bahan baku. Tambah di Manajemen Stok.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {ingredientList.map((ing) => {
                      const selected = menuForm.recipe.find(
                        (r) => r.ingredientId === ing.id,
                      );
                      return (
                        <div
                          key={ing.id}
                          className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2"
                        >
                          <label className="flex items-center space-x-2.5 flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={!!selected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setMenuForm((prev) => ({
                                    ...prev,
                                    recipe: [
                                      ...prev.recipe,
                                      {
                                        ingredientId: ing.id,
                                        name: ing.name,
                                        quantity: 1,
                                      },
                                    ],
                                  }));
                                } else {
                                  setMenuForm((prev) => ({
                                    ...prev,
                                    recipe: prev.recipe.filter(
                                      (r) => r.ingredientId !== ing.id,
                                    ),
                                  }));
                                }
                              }}
                              className="accent-red-700"
                            />
                            <span className="text-xs font-semibold text-gray-700 truncate">
                              {ing.name}
                            </span>
                          </label>
                          {selected && (
                            <div className="flex items-center space-x-1.5 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  setMenuForm((prev) => ({
                                    ...prev,
                                    recipe: prev.recipe.map((r) =>
                                      r.ingredientId === ing.id
                                        ? {
                                            ...r,
                                            quantity: Math.max(
                                              1,
                                              r.quantity - 1,
                                            ),
                                          }
                                        : r,
                                    ),
                                  }))
                                }
                                className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold"
                              >
                                −
                              </button>
                              <span className="text-xs font-bold text-gray-800 min-w-[20px] text-center">
                                {selected.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setMenuForm((prev) => ({
                                    ...prev,
                                    recipe: prev.recipe.map((r) =>
                                      r.ingredientId === ing.id
                                        ? { ...r, quantity: r.quantity + 1 }
                                        : r,
                                    ),
                                  }))
                                }
                                className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="text"
                    placeholder="Bahan baru..."
                    value={newIngredientName}
                    onChange={(e) => setNewIngredientName(e.target.value)}
                    className="flex-1 bg-gray-50 border border-transparent rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:bg-white focus:border-red-500 transition-all text-gray-700"
                  />
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    disabled={!newIngredientName.trim()}
                    className="bg-red-700 hover:bg-red-800 disabled:opacity-40 text-white font-black text-[10px] px-3 py-2 rounded-xl active:scale-95 transition-all"
                  >
                    + Tambah
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-white">
              <button
                onClick={handleMenuSave}
                disabled={!menuForm.name || !menuForm.price}
                className="w-full bg-red-700 hover:bg-red-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black py-3.5 px-6 rounded-2xl text-xs tracking-wider active:scale-[0.98] transition-all"
              >
                {menuModal.edit ? "Simpan Perubahan" : "Tambah Menu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Topping Add/Edit Modal */}
      {toppingModal.open && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex flex-col justify-end"
          onClick={() => setToppingModal({ open: false })}
        >
          <div className="flex-1" />
          <div
            className="bg-white rounded-t-[32px] shadow-2xl flex flex-col w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-black text-gray-900">
                {toppingModal.edit ? "Edit Topping" : "Tambah Topping"}
              </h2>
              <button
                onClick={() => setToppingModal({ open: false })}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="px-5 py-5 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">
                  Nama Topping
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border border-transparent rounded-2xl px-4 py-3 text-xs font-semibold outline-none focus:bg-white focus:border-red-500 transition-all text-gray-700"
                  placeholder="Nama topping"
                  value={toppingForm.name}
                  onChange={(e) =>
                    setToppingForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">
                  Harga (Rp)
                </label>
                <input
                  type="number"
                  className="w-full bg-gray-50 border border-transparent rounded-2xl px-4 py-3 text-xs font-semibold outline-none focus:bg-white focus:border-red-500 transition-all text-gray-700"
                  placeholder="2000"
                  value={toppingForm.price}
                  onChange={(e) =>
                    setToppingForm((prev) => ({
                      ...prev,
                      price: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-white">
              <button
                onClick={handleToppingSave}
                disabled={!toppingForm.name || !toppingForm.price}
                className="w-full bg-red-700 hover:bg-red-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black py-3.5 px-6 rounded-2xl text-xs tracking-wider active:scale-[0.98] transition-all"
              >
                {toppingModal.edit ? "Simpan Perubahan" : "Tambah Topping"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menu Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="text-base font-black text-gray-900 text-center">
              Hapus Menu?
            </h3>
            <p className="text-xs font-semibold text-gray-500 text-center">
              Menu yang dihapus tidak dapat dikembalikan.
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl text-xs active:scale-95 transition-all"
              >
                Batal
              </button>
              <button
                onClick={() => handleMenuDelete(deleteConfirm)}
                className="flex-1 bg-red-700 text-white font-black py-3 rounded-xl text-xs active:scale-95 transition-all"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Topping Delete Confirmation */}
      {toppingDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="text-base font-black text-gray-900 text-center">
              Hapus Topping?
            </h3>
            <p className="text-xs font-semibold text-gray-500 text-center">
              Topping yang dihapus tidak dapat dikembalikan.
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setToppingDelete(null)}
                className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl text-xs active:scale-95 transition-all"
              >
                Batal
              </button>
              <button
                onClick={() => handleToppingDelete(toppingDelete)}
                className="flex-1 bg-red-700 text-white font-black py-3 rounded-xl text-xs active:scale-95 transition-all"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Confirmation Modal */}
      {confirmDecline && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-2xl">✕</span>
              </div>
            </div>
            <h3 className="text-base font-black text-gray-900 text-center">
              Tolak Pesanan?
            </h3>
            <p className="text-xs font-semibold text-gray-500 text-center">
              Apakah Anda yakin ingin menolak pesanan ini?
            </p>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Alasan penolakan (opsional)"
              rows={2}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs font-semibold outline-none focus:bg-white focus:border-red-500 transition-all text-gray-700 resize-none"
            />
            <div className="flex items-center space-x-3 pt-1">
              <button
                onClick={() => setConfirmDecline(null)}
                className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl text-xs active:scale-95 transition-all"
              >
                Tidak
              </button>
              <button
                onClick={() => {
                  const id = confirmDecline;
                  setConfirmDecline(null);
                  const extra = declineReason.trim()
                    ? { declineReason: declineReason.trim() }
                    : undefined;
                  handleOrderAction(id, "decline", extra);
                }}
                className="flex-1 bg-red-700 text-white font-black py-3 rounded-xl text-xs active:scale-95 transition-all"
              >
                Ya, Tolak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex flex-col justify-end"
          onClick={() => setSelectedOrder(null)}
        >
          <div className="flex-1" />
          <div
            className="bg-white rounded-t-[32px] shadow-2xl flex flex-col max-h-[80vh] w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-black text-gray-900">
                Detail Pesanan
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {/* Order header */}
              <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                      ID Pesanan
                    </p>
                    <h3 className="text-lg font-black text-red-700 mt-0.5">
                      {selectedOrder.orderNumber}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                      Waktu
                    </p>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">
                      {new Date(selectedOrder.createdAt).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer info */}
              <div className="flex items-center space-x-3 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-black">
                  {selectedOrder.customerName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black text-gray-900">
                    {selectedOrder.customerName}
                  </p>
                  {selectedOrder.customerWhatsapp && (
                    <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                      WA: {selectedOrder.customerWhatsapp}
                    </p>
                  )}
                </div>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${selectedOrder.status === "PENDING" ? "bg-rose-50 text-red-600" : selectedOrder.status === "PROCESSING" ? "bg-amber-50 text-amber-600" : selectedOrder.status === "READY" ? "bg-emerald-50 text-emerald-600" : selectedOrder.status === "COMPLETED" ? "bg-gray-50 text-gray-600" : "bg-gray-100 text-gray-500"}`}>
                  {selectedOrder.status === "PENDING" ? "Menunggu Verifikasi" : selectedOrder.status === "PROCESSING" ? "Sedang Dimasak" : selectedOrder.status === "READY" ? "Siap Diambil" : selectedOrder.status === "COMPLETED" ? "Selesai" : "Ditolak"}
                </span>
              </div>

              {/* Items */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-2xl p-2 shadow-sm">
                  <div className="px-3 py-2 border-b border-gray-50">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                      Pesanan ({selectedOrder.items.length} item)
                    </p>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="px-3 py-3.5">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 pr-4">
                            <div className="flex items-center space-x-2">
                              <span className="font-extrabold text-gray-900 text-sm">
                                {item.productName}
                              </span>
                              <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                                {item.quantity}x
                              </span>
                            </div>
                            {/* Customization */}
                            {item.customization && (
                              <div className="mt-1.5 space-y-0.5">
                                {item.customization.spiciness && (
                                  <p className="text-[9px] font-semibold text-gray-500">
                                    Pedas: {item.customization.spiciness}
                                  </p>
                                )}
                                {item.customization.soup && (
                                  <p className="text-[9px] font-semibold text-gray-500">
                                    Kuah: {item.customization.soup}
                                  </p>
                                )}
                                {item.customization.flavors && item.customization.flavors.length > 0 && (
                                  <p className="text-[9px] font-semibold text-gray-500">
                                    Rasa: {item.customization.flavors.join(", ")}
                                  </p>
                                )}
                                {item.customization.toppings && item.customization.toppings.length > 0 && (
                                  <p className="text-[9px] font-semibold text-gray-500">
                                    Topping: {item.customization.toppings.map(t => `${t.name}${t.quantity > 1 ? ` ×${t.quantity}` : ""}`).join(", ")}
                                  </p>
                                )}
                                {item.customization.notes && (
                                  <p className="text-[9px] font-semibold text-gray-500">
                                    Catatan: {item.customization.notes}
                                  </p>
                                )}
                              </div>
                            )}
                            {/* Variants */}
                            {item.selectedVariants && item.selectedVariants.length > 0 && (
                              <div className="mt-1 space-y-0.5">
                                {item.selectedVariants.map((v, vi) => (
                                  <p key={vi} className="text-[9px] font-semibold text-gray-500">
                                    Varian: {v.name} {v.quantity > 1 && `×${v.quantity}`} (+Rp{v.price.toLocaleString("id-ID")})
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                          <span className="font-black text-red-600 text-xs shrink-0">
                            Rp {item.subtotal.toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start space-x-2.5">
                    <span className="text-sm">📝</span>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                        Catatan Pesanan
                      </p>
                      <p className="text-xs font-semibold text-gray-700 mt-1">
                        {selectedOrder.notes}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Proof */}
              {selectedOrder.paymentProofUrl && (
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
                    Bukti Pembayaran
                  </p>
                  <div className="rounded-xl overflow-hidden border border-gray-200">
                    <img
                      src={selectedOrder.paymentProofUrl}
                      alt="Bukti Transfer"
                      className="w-full h-48 object-contain bg-gray-50"
                    />
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="bg-red-700 rounded-2xl p-5 text-white flex items-center justify-between shadow-lg">
                <p className="text-sm font-black uppercase tracking-wider">
                  Total Pembayaran
                </p>
                <p className="text-xl font-black">
                  Rp {selectedOrder.totalPrice.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 py-3 px-4 flex justify-between items-center z-10">
        {[
          {
            id: "orders" as TabId,
            label: "Orders",
            icon: (
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
            ),
          },
          {
            id: "stock" as TabId,
            label: "Stock",
            icon: (
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
            ),
          },
          {
            id: "revenue" as TabId,
            label: "Revenue",
            icon: (
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
            ),
          },
          {
            id: "menu" as TabId,
            label: "Menu",
            icon: (
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            ),
          },
          {
            id: "settings" as TabId,
            label: "Settings",
            icon: (
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
            ),
          },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center space-y-1 py-1 rounded-xl transition-all relative ${isActive ? "bg-red-700 text-white font-bold p-2" : "text-gray-400 font-medium"}`}
            >
              <div className="relative">
                {tab.icon}
                {tab.id === "orders" && pendingCount > 0 && !isActive && (
                  <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[7px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">
                    {pendingCount}
                  </span>
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

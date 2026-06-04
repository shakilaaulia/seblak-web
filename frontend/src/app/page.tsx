"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import logo from "../../assets/Logo 2.png";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    // Redirect to seller dashboard if phone ends with 99, otherwise to customer menu
    if (phone.endsWith("99")) {
      router.push("/dashboard");
    } else {
      router.push("/menu");
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between items-center px-8 py-12 bg-gradient-to-b from-rose-50 via-white to-amber-50/50 min-h-screen">
      {/* Top Spacer */}
      <div></div>

      {/* Main Content */}
      <div className="w-full flex flex-col items-center text-center space-y-8 my-auto">
        {/* Logo Brand */}
        <div className="flex flex-col items-center">
          {/* Flame Icon Container */}
          <div className="flex items-center justify-center mb-2">
            <img src={logo.src} alt="Logo Seblak Mamah Zahwa" className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 object-contain" />
          </div>
        </div>

        {/* Welcome Text */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-red-700 tracking-tight">
            Selamat Datang
          </h1>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            Masukkan nomor WhatsApp kamu untuk mulai memesan.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div className="flex items-center bg-white border border-rose-200 rounded-2xl px-4 py-3.5 shadow-sm focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500 transition-all">
            {/* Country code / Flag */}
            <div className="flex items-center space-x-2 pr-3 border-r border-gray-200">
              <span className="text-lg">🇮🇩</span>
              <span className="text-sm font-semibold text-gray-700">+62</span>
            </div>
            {/* Phone Input */}
            <input
              type="tel"
              className="flex-1 pl-3 bg-transparent border-none outline-none text-gray-800 font-medium placeholder-gray-400 text-sm"
              placeholder="812 3456 7890"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              required
            />
          </div>

          {/* Tips for Testing */}
          <p className="text-[10px] text-gray-400 text-left px-1">
            * Tips: Akhiri nomor dengan{" "}
            <strong className="text-red-500">99</strong> untuk masuk ke
            Dashboard Penjual, atau nomor lain untuk Menu Pembeli.
          </p>

          <button
            type="submit"
            className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-red-700/10 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
          >
            {/* Chat Icon */}
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                clipRule="evenodd"
              />
            </svg>
            <span>Masuk via WhatsApp</span>
          </button>
        </form>
      </div>

      {/* Footer / Terms */}
      <div className="w-full max-w-xs text-center">
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Dengan masuk, kamu menyetujui{" "}
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

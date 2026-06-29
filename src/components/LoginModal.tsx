/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Chrome, Loader2, X } from "lucide-react";
import { signInWithGoogle } from "../lib/supabaseClient";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setError("");
    setIsLoading(true);

    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || "No fue posible iniciar sesion con Google.");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full max-w-sm p-8 shadow-2xl border border-gray-100 rounded-none text-black animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-black transition-colors focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-light tracking-tight mb-1 text-center">Acceder</h2>
        <p className="text-xs text-gray-500 font-mono tracking-wider text-center uppercase mb-6">
          Ingresa con tu cuenta de Google
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 p-3 mb-5 text-xs text-center font-mono">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full bg-black hover:bg-neutral-900 text-white p-4 text-[10px] font-mono tracking-[0.2em] uppercase font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Chrome className="w-3.5 h-3.5" />}
          Continuar con Google
        </button>
      </div>
    </div>
  );
}

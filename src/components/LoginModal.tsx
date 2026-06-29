/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FormEvent, useState } from "react";
import { Chrome, Loader2, Lock, LogIn, User, X } from "lucide-react";
import { authenticateManualUser, signInWithGoogle } from "../lib/supabaseClient";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, email: string, isAdmin: boolean) => void;
}

export default function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loadingMode, setLoadingMode] = useState<"google" | "manual" | "">("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const isLoading = !!loadingMode;

  const handleGoogleLogin = async () => {
    setError("");
    setLoadingMode("google");

    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || "No fue posible iniciar sesion con Google.");
      setLoadingMode("");
    }
  };

  const handleManualLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!login.trim() || !password.trim()) {
      setError("Ingresa tu usuario o correo y contrasena.");
      return;
    }

    setLoadingMode("manual");
    const user = await authenticateManualUser(login, password);
    setLoadingMode("");

    if (!user) {
      setError("Usuario/correo o contrasena incorrectos.");
      return;
    }

    onLogin(user.username, user.email, user.isAdmin);
    setLogin("");
    setPassword("");
    onClose();
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
          Google o credenciales de administrador
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
          {loadingMode === "google" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Chrome className="w-3.5 h-3.5" />}
          Continuar con Google
        </button>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px bg-gray-150 flex-1" />
          <span className="text-[9px] font-mono uppercase tracking-widest text-gray-400">o</span>
          <div className="h-px bg-gray-150 flex-1" />
        </div>

        <form onSubmit={handleManualLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono tracking-[0.2em] font-bold uppercase text-black">
              Usuario o correo
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="fragmentoscity@gmail.com"
                disabled={isLoading}
                className="w-full bg-[#FAFAFA] border border-gray-200 p-3 pl-10 text-sm focus:border-black outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono tracking-[0.2em] font-bold uppercase text-black">
              Contrasena
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin123"
                disabled={isLoading}
                className="w-full bg-[#FAFAFA] border border-gray-200 p-3 pl-10 text-sm focus:border-black outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white hover:bg-[#FAFAFA] text-black border border-black p-4 text-[10px] font-mono tracking-[0.2em] uppercase font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loadingMode === "manual" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogIn className="w-3.5 h-3.5" />}
            Iniciar sesion
          </button>
        </form>
      </div>
    </div>
  );
}

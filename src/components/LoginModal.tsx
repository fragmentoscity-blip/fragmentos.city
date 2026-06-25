/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, Lock, X, LogIn, UserPlus, Loader2 } from "lucide-react";
import { authenticateUserWithSupabase, registerUserInSupabase } from "../lib/supabaseClient";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, isAdmin: boolean) => void;
}

export default function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [isAdminRegister, setIsAdminRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const normalizedUser = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!normalizedUser || !cleanPassword) {
      setError("Por favor, ingresa tus credenciales completas.");
      return;
    }

    setIsLoading(true);

    try {
      if (isRegister) {
        // Sign Up Flow
        const res = await registerUserInSupabase(normalizedUser, cleanPassword, isAdminRegister);
        if (res.success) {
          setSuccessMsg("¡Registro exitoso! Ya puedes iniciar sesión con tu cuenta.");
          setIsRegister(false);
          setPassword("");
        } else {
          setError(res.message);
        }
      } else {
        // Sign In Flow
        // Query database first
        const dbUser = await authenticateUserWithSupabase(normalizedUser, cleanPassword);
        
        if (dbUser) {
          onLogin(dbUser.username, dbUser.isAdmin);
          setUsername("");
          setPassword("");
          onClose();
        } else {
          // Graceful local fallbacks if DB table is missing or doesn't have the user
          if (normalizedUser === "admin" && cleanPassword === "admin123") {
            onLogin("admin", true);
            setUsername("");
            setPassword("");
            onClose();
          } else if (normalizedUser === "daniel" && cleanPassword === "daniel123") {
            onLogin("daniel", false);
            setUsername("");
            setPassword("");
            onClose();
          } else {
            setError("Credenciales incorrectas o no registradas en la base de datos.");
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setError("Ocurrió un error inesperado al conectar con Supabase.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      <div className="relative bg-white w-full max-w-sm p-8 shadow-2xl border border-gray-100 rounded-none text-black animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-black transition-colors focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-light tracking-tight mb-1 text-center">
          {isRegister ? "Crear Cuenta" : "Acceder"}
        </h2>
        <p className="text-xs text-gray-500 font-mono tracking-wider text-center uppercase mb-6">
          {isRegister ? "Registro Supabase S3" : "Portal de Autenticación Supabase"}
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 p-3 mb-5 text-xs text-center font-mono">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 p-3 mb-5 text-xs text-center font-mono">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono tracking-[0.2em] font-bold uppercase text-black">
              Usuario
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ej. daniel o admin"
                disabled={isLoading}
                className="w-full bg-[#FAFAFA] border border-gray-200 p-3 pl-10 text-sm focus:border-black outline-none transition-colors"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono tracking-[0.2em] font-bold uppercase text-black">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className="w-full bg-[#FAFAFA] border border-gray-200 p-3 pl-10 text-sm focus:border-black outline-none transition-colors"
              />
            </div>
          </div>

          {isRegister && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isAdminRegister"
                checked={isAdminRegister}
                onChange={(e) => setIsAdminRegister(e.target.checked)}
                className="w-4 h-4 border-gray-300 text-black focus:ring-black accent-black"
              />
              <label htmlFor="isAdminRegister" className="text-xs font-mono text-gray-600 cursor-pointer">
                Registrar como Administrador (Admin)
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black hover:bg-neutral-900 text-white p-4 text-[10px] font-mono tracking-[0.2em] uppercase font-bold flex items-center justify-center gap-2 transition-colors mt-2 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isRegister ? (
              <>
                Registrar <UserPlus className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                Iniciar Sesión <LogIn className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-gray-150 text-center">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
              setSuccessMsg("");
            }}
            className="text-[11px] font-mono uppercase tracking-wider text-gray-500 hover:text-black transition-colors"
          >
            {isRegister
              ? "¿Ya tienes cuenta? Inicia Sesión"
              : "¿No tienes cuenta? Regístrate en Supabase"}
          </button>
        </div>
      </div>
    </div>
  );
}

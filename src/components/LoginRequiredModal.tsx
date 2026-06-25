/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Lock, X, LogIn } from "lucide-react";

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

export default function LoginRequiredModal({ isOpen, onClose, onOpenLogin }: LoginRequiredModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      <div className="relative bg-white w-full max-w-sm p-8 shadow-2xl border border-gray-100 rounded-none text-black animate-in fade-in zoom-in-95 duration-200 text-center">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-black transition-colors focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center mb-4">
           <Lock className="w-10 h-10 text-gray-300" />
        </div>

        <h2 className="text-2xl font-light tracking-tight mb-2 text-black">Autenticación Requerida</h2>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
          Debes iniciar sesión con tu cuenta para poder guardar este relieve en tus favoritos.
        </p>

        <button
          onClick={() => {
            onClose();
            onOpenLogin();
          }}
          className="w-full bg-black hover:bg-neutral-900 text-white p-4 text-[10px] font-mono tracking-[0.2em] uppercase font-bold flex items-center justify-center gap-2 transition-colors focus:outline-none"
        >
           Iniciar Sesión <LogIn className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

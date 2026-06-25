/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { X, Heart, Eye } from "lucide-react";
import { Product } from "../types";

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  likedProducts: Record<string, boolean>;
  onToggleLike: (id: string, e: React.MouseEvent) => void;
  products: Product[];
  onScrollToSection: (id: string) => void;
}

export default function FavoritesDrawer({
  isOpen,
  onClose,
  likedProducts,
  onToggleLike,
  products,
  onScrollToSection
}: FavoritesDrawerProps) {
  if (!isOpen) return null;

  const favoriteProducts = products.filter(p => likedProducts[p.id]);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="relative w-full max-w-md bg-[#FAF8F5] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="px-6 py-6 border-b border-gray-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2 text-black">
            <Heart className="w-5 h-5 fill-black text-black" />
            <h2 className="text-xl font-light tracking-tight">Tus Favoritos</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-black transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {favoriteProducts.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center justify-center gap-4 text-gray-400">
              <Heart className="w-12 h-12 text-gray-200" />
              <div className="space-y-1">
                <p className="font-mono text-xs uppercase tracking-widest text-black">Sin Favoritos</p>
                <p className="text-xs font-sans px-4">
                  Aún no has guardado ningún relieve. Explora la colección y guárdalos aquí.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onScrollToSection("catalogo");
                }}
                className="mt-4 px-6 py-3 bg-black text-white font-mono text-[10px] uppercase tracking-[0.2em] font-bold"
              >
                Ver Colección
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {favoriteProducts.map((prod) => (
                <div key={prod.id} className="bg-white border border-gray-200 flex p-3 gap-4 group">
                  <div className="w-24 h-24 shrink-0 bg-gray-50 border border-gray-100 overflow-hidden">
                    <img 
                      src={prod.image} 
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex flex-col flex-1 justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-semibold text-black tracking-tight">{prod.name}</h4>
                        <button 
                          onClick={(e) => onToggleLike(prod.id, e)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        {prod.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                       <span className="text-[10px] font-mono tracking-widest text-black font-bold">
                         Desde COP {Math.min(89000).toLocaleString()}
                       </span>
                       <button
                         onClick={() => {
                           onClose();
                           onScrollToSection("catalogo");
                         }}
                         className="flex items-center gap-1.5 text-[9px] font-mono tracking-wider font-bold uppercase text-gray-400 hover:text-black transition-colors"
                       >
                         <Eye className="w-3.5 h-3.5" /> Ver en Tienda
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ShoppingBag, X, Trash2, ArrowRight } from "lucide-react";
import { CartItem } from "../types";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onProceedToCheckout: () => void;
}

export default function Cart({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}: CartProps) {
  if (!isOpen) return null;

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-[1000] overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      {/* Background veil */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex">
        {/* Cart drawer - Sliding panel */}
        <div className="w-[380px] md:w-[440px] max-w-md bg-white text-black shadow-2xl flex flex-col justify-between h-full border-l border-gray-100 rounded-none">
          
          {/* Header */}
          <div className="p-8 border-b border-gray-150 flex items-center justify-between">
            <h2 className="text-xl font-light tracking-tight flex items-center gap-2 text-black">
              <ShoppingBag className="w-5 h-5 text-black" /> Carrito de Compras
            </h2>
            <button
              onClick={onClose}
              className="p-1 px-3 border border-gray-200 hover:border-black text-[10px] uppercase font-mono tracking-widest transition-colors"
            >
              Cerrar
            </button>
          </div>

          {/* Cart items list */}
          <div className="flex-grow p-8 overflow-y-auto space-y-6">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-16 h-16 bg-[#FAFAFA] flex items-center justify-center border border-gray-100 rounded-none">
                  <ShoppingBag className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-base font-light tracking-tight text-black">Tu carrito está vacío</h3>
                  <p className="text-xs text-gray-550 mt-2 max-w-[240px] leading-relaxed">
                    Agrega uno de nuestros fragmentos catalogados o personaliza tu propio mapa 3D en el configurador.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="bg-black hover:bg-neutral-900 text-white text-xs font-mono tracking-[0.2em] uppercase py-4 px-6 rounded-none font-bold"
                >
                  Seguir Explorando
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 items-start border-b border-gray-100 pb-5 last:border-b-0 last:pb-0 font-sans"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 object-cover bg-[#FAFAFA] rounded-none border border-gray-100 shrink-0"
                  />
                  <div className="flex-grow space-y-2.5">
                    <div className="space-y-0.5">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-light text-sm text-black leading-tight">
                          {item.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          className="text-gray-300 hover:text-black transition-colors p-0.5 shrink-0"
                          title="Eliminar del carrito"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-[9px] text-gray-450 font-mono tracking-[0.15em] uppercase space-x-1.5 pt-1">
                        <span>{item.size} CM</span>
                        <span>•</span>
                        <span>{item.color}</span>
                      </div>
                    </div>

                    {/* Coordinates flag for custom map frames */}
                    {item.isCustom && item.customDetails && (
                      <div className="bg-[#FAFAFA] p-3 border border-gray-150 rounded-none text-[9px] font-mono text-gray-500 leading-normal space-y-1 max-w-[280px]">
                        <span className="text-black font-bold block text-[8px] uppercase tracking-wider">Coordenadas de Modelado</span>
                        <div className="truncate text-black">{item.customDetails.address.split(",")[0]}</div>
                        <div className="flex justify-between font-mono tracking-tight text-gray-455 text-[8.5px]">
                          <span>LAT: {item.customDetails.latitude.toFixed(4)}</span>
                          <span>LNG: {item.customDetails.longitude.toFixed(4)}</span>
                          <span>Z: {item.customDetails.zoom}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-1">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-200 rounded-none h-8">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="px-2 text-gray-550 hover:bg-gray-100 h-full flex items-center justify-center font-mono focus:outline-none"
                        >
                          -
                        </button>
                        <span className="px-3.5 text-xs font-mono font-bold text-black">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="px-2 text-gray-550 hover:bg-gray-100 h-full flex items-center justify-center font-mono focus:outline-none"
                        >
                          +
                        </button>
                      </div>

                      {/* Item Subtotal */}
                      <span className="text-xs font-mono font-bold text-black">
                        COP {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer controls & Subtotal */}
          {cartItems.length > 0 && (
            <div className="p-8 border-t border-gray-100 bg-[#FAFAFA] space-y-6">
              <div className="space-y-2 font-mono text-gray-400 text-[10px] uppercase tracking-widest">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-black">COP {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío Colombia</span>
                  <span className="text-emerald-600 font-bold uppercase tracking-widest">Gratis</span>
                </div>
                <div className="pt-3 border-t border-gray-250 flex justify-between text-xs">
                  <span className="text-black font-semibold">Valor Total</span>
                  <span className="font-bold text-black text-sm font-sans normal-case tracking-normal">
                    COP {total.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onProceedToCheckout}
                className="w-full bg-black hover:bg-neutral-900 text-white font-mono text-xs uppercase tracking-[0.2em] py-5 px-4 font-bold transition-colors flex items-center justify-center gap-2"
              >
                Continuar al Envío <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

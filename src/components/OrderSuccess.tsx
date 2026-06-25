/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { CheckCircle2, Home, Map, Sparkles, Mail } from "lucide-react";
import { Order } from "../types";

interface OrderSuccessProps {
  order: Order;
  onBackToHome: () => void;
}

export default function OrderSuccess({ order, onBackToHome }: OrderSuccessProps) {
  return (
    <section className="w-full bg-[#F5F5F5] text-black py-24 px-4 md:px-12 border-t border-gray-100 min-h-[90vh] flex flex-col justify-center items-center">
      <div className="max-w-2xl w-full bg-white border border-gray-100 rounded-none p-8 md:p-12 shadow-sm space-y-8 text-center select-none">
        
        {/* Celebration Anim icon */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-white border border-emerald-200 text-emerald-500 rounded-none flex items-center justify-center p-1.5 shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="text-[10px] font-mono tracking-[0.3em] text-emerald-600 uppercase font-bold block pt-2">
            ¡Pago Registrado Exitosamente!
          </span>
          <h2 className="text-3xl font-light tracking-tight text-black">Gracias por tu Fragmento</h2>
          <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
            Hemos guardado y enviado tu pedido a nuestro taller de impresión 3D biodegradable ubicado en Bogotá. ¡Ya estamos calibrando los cabezales para tu relieve!
          </p>
        </div>

        {/* Order Details Details info */}
        <div className="border border-gray-150 bg-[#FAFAFA] rounded-none p-6 md:p-8 text-left space-y-4">
          <div className="flex justify-between border-b border-gray-200/60 pb-3 font-mono text-[10px] uppercase tracking-widest text-gray-400">
            <span>REFERENCIA DE ORDEN</span>
            <span className="font-bold text-black">FRAG_COL_{Math.floor(Math.random() * 900000 + 100000)}</span>
          </div>

          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-black uppercase font-mono tracking-wider text-[10px] mb-3">Resumen de Despacho</h4>
            <div>
              <span className="text-gray-400 font-mono tracking-wider text-[9px] uppercase">Destinatario:</span>{" "}
              <span className="text-black font-semibold">{order.shipping.fullName}</span>
            </div>
            <div>
              <span className="text-gray-400 font-mono tracking-wider text-[9px] uppercase">Dirección:</span>{" "}
              <span className="text-black font-semibold">
                {order.shipping.address}, {order.shipping.city}, {order.shipping.department}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div>
                <span className="text-gray-400 font-mono tracking-wider text-[9px] uppercase">Celular:</span>{" "}
                <span className="text-black font-semibold">{order.shipping.phone}</span>
              </div>
              <div>
                <span className="text-gray-400 font-mono tracking-wider text-[9px] uppercase">Método:</span>{" "}
                <span className="text-black font-semibold uppercase font-mono text-[10px]">{order.paymentMethod}</span>
              </div>
            </div>
          </div>

          {/* Items map coord references inside success feedback */}
          <div className="border-t border-gray-200 pt-4 space-y-3">
            <h4 className="font-bold text-black uppercase font-mono tracking-wider text-[10px] mb-2">Áreas Modeladas 3D</h4>
            {order.items.map((it) => (
              <div key={it.id} className="flex justify-between items-center bg-white p-3.5 rounded-none border border-gray-150 text-xs">
                <div className="flex items-center gap-2">
                  <Map className="w-4 h-4 text-black" />
                  <div>
                    <span className="font-bold block text-black leading-tight">{it.name}</span>
                    <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">{it.size} CM • {it.color}</span>
                  </div>
                </div>
                {it.isCustom && it.customDetails && (
                  <span className="text-[9px] font-mono bg-black text-white px-2.5 py-1 uppercase tracking-widest rounded-none leading-none">
                    LAT: {it.customDetails.latitude.toFixed(3)}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4 flex justify-between font-mono text-[10px] uppercase tracking-widest text-black font-bold">
            <span>TOTAL RECIBIDO</span>
            <span className="text-sm font-sans normal-case">COP {order.total.toLocaleString()}</span>
          </div>
        </div>

        {/* Steps of Production HUD inside success box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-left">
          <div className="p-5 border border-gray-150 bg-white rounded-none space-y-2">
            <h5 className="font-bold text-black flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest">
              <Mail className="w-4 h-4 text-black" /> Confirmación por Correo
            </h5>
            <p className="text-gray-550 leading-relaxed text-[11px]">
              Enviamos el recibo formal de pago y las especificaciones de impresión a tu correo <strong className="text-black font-bold">{order.shipping.email}</strong>.
            </p>
          </div>

          <div className="p-5 border border-gray-150 bg-white rounded-none space-y-2">
            <h5 className="font-bold text-black flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-black" /> Despacho de Relieve
            </h5>
            <p className="text-gray-550 leading-relaxed text-[11px]">
              El modelado topográfico toma 1-2 días útiles. La transportadora local te entregará la pieza premium de forma segura en 3-5 días.
            </p>
          </div>
        </div>

        {/* Home Action */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={onBackToHome}
            className="w-full sm:w-auto bg-black hover:bg-neutral-900 text-white font-mono text-xs uppercase tracking-[0.2em] py-5 px-8 font-bold transition-all rounded-none"
          >
            <Home className="w-4 h-4 inline mr-2" /> Volver a Fragmentos
          </button>
        </div>

      </div>
    </section>
  );
}

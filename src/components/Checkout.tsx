/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ArrowLeft, ShieldCheck, Mail, Phone, Truck, CreditCard, Loader2, AlertCircle } from "lucide-react";
import { CartItem, ShippingInfo, Order } from "../types";
import { openWompiCheckout, WompiCheckoutResult } from "../lib/wompi";

// Departments & Cities options for simple, fast, direct Colombian checkout
const COLOMBIAN_REGIONS = [
  { dept: "Bogotá D.C.", cities: ["Bogotá D.C.", "Usaquén", "Suba", "Fontibón", "Chapinero"] },
  { dept: "Antioquia", cities: ["Medellín", "Envigado", "Sabaneta", "Rionegro", "Itagüí"] },
  { dept: "Cundinamarca", cities: ["Chía", "Cajicá", "Sopó", "La Calera", "Zipaquirá_Fusagasugá"] },
  { dept: "Valle del Cauca", cities: ["Cali", "Palmira", "Yumbo", "Jamundí", "Tuluá"] },
  { dept: "Atlántico", cities: ["Barranquilla", "Soledad", "Puerto Colombia", "Sabanalarga"] },
];

interface CheckoutProps {
  cartItems: CartItem[];
  onBackToCart: () => void;
  onCreateOrder: (order: Order) => Order | Promise<Order>;
  onPaymentApproved: (order: Order, result: WompiCheckoutResult) => void;
}

export default function Checkout({ cartItems, onBackToCart, onCreateOrder, onPaymentApproved }: CheckoutProps) {
  const [shipping, setShipping] = useState<ShippingInfo>({
    fullName: "",
    email: "",
    phone: "",
    department: "Bogotá D.C.",
    city: "Bogotá D.C.",
    address: "",
    notes: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [paymentError, setPaymentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingCost = 0; // Free shipping across Colombia
  const total = subtotal + shippingCost;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShipping((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!shipping.fullName.trim()) errors.fullName = "Ingresa tu nombre completo";
    if (!shipping.email.trim()) {
      errors.email = "Ingresa tu correo electrónico";
    } else if (!/\S+@\S+\.\S+/.test(shipping.email)) {
      errors.email = "Correo electrónico inválido";
    }
    if (!shipping.phone.trim()) {
      errors.phone = "Ingresa tu celular de contacto";
    } else if (shipping.phone.replace(/\D/g, "").length < 10) {
      errors.phone = "Indica un número válido de 10 dígitos (ej. 3001234567)";
    }
    if (!shipping.address.trim()) errors.address = "Ingresa la dirección detallada de entrega";
    return errors;
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dept = e.target.value;
    const region = COLOMBIAN_REGIONS.find((r) => r.dept === dept);
    const initialCity = region ? region.cities[0] : "";
    setShipping((prev) => ({ ...prev, department: dept, city: initialCity }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError("");

    if (cartItems.length === 0) {
      setPaymentError("Tu carrito está vacío.");
      return;
    }

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const pendingOrder = await onCreateOrder({
        items: cartItems,
        shipping,
        subtotal,
        shippingCost,
        total,
        paymentMethod: "wompi",
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      await openWompiCheckout(pendingOrder, (result) => {
        if (result.transaction?.status === "APPROVED") {
          onPaymentApproved(pendingOrder, result);
          return;
        }

        setPaymentError("El pago no fue aprobado por Wompi. Puedes intentarlo nuevamente.");
        setIsSubmitting(false);
      });
    } catch (error: any) {
      setPaymentError(error.message || "No fue posible iniciar el pago con Wompi.");
      setIsSubmitting(false);
    }
  };

  const activeRegion = COLOMBIAN_REGIONS.find((r) => r.dept === shipping.department);

  return (
    <section className="w-full bg-[#F5F5F5] text-black py-24 px-4 md:px-12 border-t border-gray-100">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation back */}
        <button
          onClick={onBackToCart}
          className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] uppercase text-gray-400 hover:text-black mb-12 transition-colors focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4" /> Modificar Carrito
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Checkout Form - 7 Columns */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white border border-gray-100 rounded-none p-8 md:p-10 space-y-10 shadow-sm">
            
            {/* Title */}
            <div>
              <span className="text-[10px] font-mono tracking-[0.3em] text-gray-450 uppercase font-bold flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-black" /> Confirmación de Datos
              </span>
              <h2 className="text-3xl font-light tracking-tight text-black mt-2">Detalles del Envío</h2>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Ingresa una dirección colombiana precisa para garantizar una entrega oportuna por transportadora local.
              </p>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Full Name */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-black font-semibold">1. Nombre Completo</label>
                <input
                  type="text"
                  name="fullName"
                  value={shipping.fullName}
                  onChange={handleInputChange}
                  placeholder="ej. Daniel Jaramillo"
                  className="w-full bg-white text-black text-xs uppercase tracking-wider p-4 border border-gray-200 focus:border-black outline-none transition-all rounded-none font-sans"
                />
                {formErrors.fullName && <p className="text-red-550 font-sans text-[11px] mt-1">{formErrors.fullName}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-black font-semibold flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> 2. Correo Electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  value={shipping.email}
                  onChange={handleInputChange}
                  placeholder="ej. daniel@correo.co"
                  className="w-full bg-white text-black text-xs p-4 border border-gray-200 focus:border-black outline-none transition-all rounded-none font-sans"
                />
                {formErrors.email && <p className="text-red-550 font-sans text-[11px] mt-1">{formErrors.email}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-black font-semibold flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> 3. Celular / Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={shipping.phone}
                  onChange={handleInputChange}
                  placeholder="ej. 3001234567"
                  className="w-full bg-white text-black text-xs uppercase tracking-wider p-4 border border-gray-200 focus:border-black outline-none transition-all rounded-none font-sans"
                />
                {formErrors.phone && <p className="text-red-550 font-sans text-[11px] mt-1">{formErrors.phone}</p>}
              </div>

              {/* Department Selector */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-black font-semibold">4. Departamento</label>
                <select
                  name="department"
                  value={shipping.department}
                  onChange={handleDepartmentChange}
                  className="w-full bg-white text-black text-xs uppercase tracking-wider p-4 border border-gray-200 focus:border-black outline-none transition-all rounded-none font-sans appearance-none cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='black' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>")`, backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat', paddingRight: '40px' }}
                >
                  {COLOMBIAN_REGIONS.map((region) => (
                    <option key={region.dept} value={region.dept}>
                      {region.dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* City Selector */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-black font-semibold">5. Municipio / Ciudad</label>
                <select
                  name="city"
                  value={shipping.city}
                  onChange={handleInputChange}
                  className="w-full bg-white text-black text-xs uppercase tracking-wider p-4 border border-gray-200 focus:border-black outline-none transition-all rounded-none font-sans appearance-none cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='black' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>")`, backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat', paddingRight: '40px' }}
                >
                  {activeRegion?.cities.map((ct) => (
                    <option key={ct} value={ct}>
                      {ct}
                    </option>
                  ))}
                </select>
              </div>

              {/* Delivery Address */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-black font-semibold">6. Dirección de Entrega</label>
                <input
                  type="text"
                  name="address"
                  value={shipping.address}
                  onChange={handleInputChange}
                  placeholder="ej. Calle 100 # 15 - 32, Apto 501"
                  className="w-full bg-white text-black text-xs p-4 border border-gray-200 focus:border-black outline-none transition-all rounded-none font-sans"
                />
                {formErrors.address && <p className="text-red-550 font-sans text-[11px] mt-1">{formErrors.address}</p>}
              </div>

              {/* Notes */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-black font-semibold">Instrucciones Adicionales (Opcional)</label>
                <textarea
                  name="notes"
                  value={shipping.notes}
                  onChange={handleInputChange}
                  placeholder="ej. Portería, dejar con vigilante o color de fachada..."
                  className="w-full bg-white text-black text-xs p-4 border border-gray-200 focus:border-black outline-none transition-all rounded-none font-sans h-20 resize-none"
                />
              </div>

            </div>

            {/* Payment Method */}
            <div className="border-t border-gray-100 pt-8 space-y-4">
              <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-black mb-4 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-black" /> Método de Pago
              </label>

              <div className="space-y-3">
                <div className="border border-black bg-white p-5 rounded-none">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-sm font-bold text-black block">Wompi (Grupo Bancolombia)</span>
                        <span className="text-xs text-gray-500 mt-0.5 block">Paga con PSE, tarjeta, Nequi o Boton Bancolombia.</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono tracking-widest bg-black text-white px-2.5 py-1 uppercase font-bold">Activo</span>
                  </div>
                </div>
              </div>            </div>

            {paymentError && (
              <div className="border border-red-200 bg-red-50 text-red-700 p-4 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{paymentError}</span>
              </div>
            )}

            {/* Submit checkout buttons */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black hover:bg-neutral-900 disabled:bg-neutral-400 disabled:cursor-not-allowed text-white font-bold py-5 text-xs tracking-[0.2em] uppercase transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <ShieldCheck className="w-4.5 h-4.5" />}
              {isSubmitting ? "Abriendo Wompi" : "Pagar con Wompi"}
            </button>

          </form>

          {/* Cart Summary - 5 Columns */}
          <div className="lg:col-span-5 bg-white border border-gray-100 rounded-none p-8 md:p-10 space-y-6 shadow-sm">
            <h3 className="text-lg font-light tracking-tight text-black pb-4 border-b border-gray-100">Resumen del Pedido</h3>
            
            {/* Items inside Checkout */}
            <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto pr-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 pt-4 first:pt-0 pb-1 font-sans text-xs">
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 object-cover bg-neutral-50 border border-gray-100 rounded-none"
                  />
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-black leading-tight truncate">{item.name}</h4>
                      <span className="font-mono text-black text-right ml-2">COP {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono tracking-widest uppercase space-x-1 mt-1">
                      <span>{item.size} CM</span>
                      <span>•</span>
                      <span>{item.color}</span>
                      <span>•</span>
                      <span>Cant: {item.quantity}</span>
                    </div>
                    {item.isCustom && item.customDetails && (
                      <span className="inline-block text-[8px] font-mono tracking-widest text-gray-500 mt-2 uppercase border border-gray-205 px-2 py-0.5">
                        COORDENADAS CAPTURADAS
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations block */}
            <div className="border-t border-gray-100 pt-6 space-y-3 font-mono text-[10px] uppercase tracking-widest text-gray-400">
              <div className="flex justify-between">
                <span>SUBTOTAL</span>
                <span className="text-black font-bold">COP {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>DESPACHO COLOMBIA</span>
                <span className="text-emerald-600 font-bold uppercase tracking-widest">Gratis</span>
              </div>
              <div className="flex justify-between">
                <span>BIOPLASTIC TAX (PLA)</span>
                <span>Exento</span>
              </div>
              <div className="pt-4 border-t border-gray-200 flex justify-between text-xs">
                <span className="text-black font-bold">TOTAL A PAGAR</span>
                <span className="font-bold text-black text-base font-sans">COP {total.toLocaleString()}</span>
              </div>
            </div>

            {/* Security Seals */}
            <div className="bg-[#FAFAFA] p-5 border border-gray-100 rounded-none text-xs text-gray-500 space-y-2 select-none leading-relaxed">
              <div className="flex items-center gap-2 text-black font-semibold uppercase tracking-wider text-[10px]">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Garantía de Satisfacción</span>
              </div>
              <p>
                Si tu cuadro de relieve urbano sufre algún daño en el trayecto de la transportadora nacional, te lo reemplazamos sin costo adicional en menos de 48 horas.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

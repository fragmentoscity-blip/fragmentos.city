/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Landmark, ShieldCheck, Terminal, Copy, Check } from "lucide-react";

export default function PaymentsPlan() {
  const [activeTab, setActiveTab] = useState<"wompi" | "epayco">("wompi");
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wompiCode = `// 1. Integración del Checkout Widget de Wompi Colombia (Bancolombia)
// Instala o añade el script oficial en el index.html
// <script type="text/javascript" src="https://checkout.wompi.co/widget.js"></script>

import { Order } from "../types";

export function pagarConWompi(order: Order, onResult: (response: any) => void) {
  // Inicializa el checkout con la llave pública de pruebas o producción
  const checkout = new (window as any).WidgetCheckout({
    currency: "COP",
    amountInCents: order.total * 100, // Wompi requiere centavos (ej: COP 159.000 = 15900000)
    reference: \`FRAG_\${order.id || Date.now()}\`,
    publicKey: "pub_test_Q5Y7t9Z8U6rI2aM3pB8O9w3r7t1y2u3i", // Llave pública de Fragmentos
    redirectUrl: "https://fragmentos.co/order-confirmation", // Redirección tras pago exitoso
    
    // Información del comprador colombiano
    customerData: {
      email: order.shipping.email,
      fullName: order.shipping.fullName,
      phoneNumber: order.shipping.phone,
    },
    
    shippingAddress: {
      addressLine1: order.shipping.address,
      city: order.shipping.city,
      phoneNumber: order.shipping.phone,
      region: order.shipping.department,
      country: "CO"
    }
  });

  checkout.open((result: any) => {
    const transaction = result.transaction;
    if (transaction.status === "APPROVED") {
      onResult({ status: "success", transactionId: transaction.id });
    } else {
      onResult({ status: "failed", error: transaction.statusDetail });
    }
  });
}`;

  const epaycoCode = `// 2. Integración de la pasarela ePayco Colombia (Davivienda)
// Añade el script oficial en el index.html:
// <script type="text/javascript" src="https://checkout.epayco.co/checkout.js"></script>

import { Order } from "../types";

export function pagarConEpayco(order: Order, onResult: (response: any) => void) {
  const handler = (window as any).ePayco.checkout.configure({
    key: "4ed4cdb6a033f7ccfa692c89280058b7", // Llave pública de pruebas/producción
    test: true // Cambiar a false en entorno real
  });

  const paymentData = {
    // Parámetros obligatorios de ePayco
    name: "Fragmentos: Cuadros 3D Personalizados",
    description: "Cuadro de relieves urbanos impreso en 3D ecológico",
    class_extra_client: "fragmentos-premium",
    currency: "cop",
    amount: order.total.toString(),
    tax_base: "0",
    tax: "0",
    country: "co",
    lang: "es",
    
    // Referencia exclusiva
    invoice: \`FRAG_\${order.id || Date.now()}\`,
    
    // Datos de redirección y webhook de confirmación
    external: "true",
    response: "https://fragmentos.co/response",
    confirmation: "https://api.fragmentos.co/v1/webhooks/epayco", // Tu Endpoint de escucha
    
    // Datos del cliente colombiano
    name_billing: order.shipping.fullName,
    address_billing: order.shipping.address,
    email_billing: order.shipping.email,
    mobilephone_billing: order.shipping.phone,
    dept_billing: order.shipping.department,
    city_billing: order.shipping.city,
  };

  handler.open(paymentData, (err: any, response: any) => {
    if (err) {
      onResult({ status: "error", error: err });
    } else {
      onResult({ status: "success", transactionId: response.x_ref_payco });
    }
  });
}`;

  const webhookCode = `// 3. Webhook de Escucha Seguro (Node.js/Express) para Wompi o ePayco
// Permite guardar el estado "Pagado/Paid" de forma confiable en el servidor

import express from "express";
import crypto from "crypto";

const app = express();
app.use(express.json());

// Secreto firmado proveído por la pasarela para asegurar que nadie suplante las llamadas
const WOMPI_WEBHOOK_SECRET = process.env.WOMPI_SIGN_SECRET;

app.post("/api/webhooks/wompi", (req, res) => {
  const { event, data, timestamp, signature } = req.body;
  
  // Validar firma criptográfica SHA2556
  const rawString = timestamp + data.transaction.id + data.transaction.amount_in_cents + data.transaction.hash;
  const hash = crypto.createHmac("sha256", WOMPI_WEBHOOK_SECRET!).update(rawString).digest("hex");
  
  if (hash !== signature.properties) {
    return res.status(401).send("Firma inválida - No autorizado.");
  }
  
  const originalReference = data.transaction.reference; // ej. FRAG_17409210
  const transactionStatus = data.transaction.status; // ej. APPROVED
  
  if (transactionStatus === "APPROVED") {
    // Almacenar en la colección de Firestore el estado pagado:
    // await updateDoc(doc(db, "orders", orderId), { status: "paid" });
    console.log(\`Pedido \${originalReference} pagado exitosamente.\`);
  }
  
  res.status(200).send("OK Received");
});`;

  return (
    <section className="bg-brand-sand/35 text-brand-navy py-24 px-4 md:px-12 border-t border-brand-gray/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-6 select-none">
          <div className="max-w-2xl">
            <span className="text-[10px] font-mono tracking-[0.3em] text-brand-terracotta uppercase font-bold flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-brand-terracotta animate-pulse" /> Documentación Técnica
            </span>
            <h2 className="text-3xl md:text-5xl font-light tracking-tight mt-2 mb-4 text-brand-navy">Integración de Pasarelas de Pago</h2>
            <p className="text-gray-650 text-xs md:text-sm leading-relaxed font-sans">
              Plan técnico completo para desplegar de forma segura el recaudo de e-commerce de Fragmentos integrando Wompi o ePayco. Permite autorizaciones mediante PSE, Nequi, Daviplata o tarjetas de crédito.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("wompi")}
              className={`px-4 py-2 text-[10px] font-mono tracking-[0.2em] uppercase border transition-all rounded-none ${
                activeTab === "wompi"
                  ? "bg-brand-navy text-white border-brand-navy font-bold"
                  : "bg-white text-brand-navy border-brand-gray/40 hover:border-brand-navy font-semibold"
              }`}
            >
              Wompi (Bancolombia)
            </button>
            <button
              onClick={() => setActiveTab("epayco")}
              className={`px-4 py-2 text-[10px] font-mono tracking-[0.2em] uppercase border transition-all rounded-none ${
                activeTab === "epayco"
                  ? "bg-brand-navy text-white border-brand-navy font-bold"
                  : "bg-white text-brand-navy border-brand-gray/40 hover:border-brand-navy font-semibold"
              }`}
            >
              ePayco (Davivienda)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Detailed Instructions - 5 Columns */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Steps panel */}
            <div className="bg-white border border-brand-gray/30 p-8 rounded-none space-y-6 shadow-sm">
              <h3 className="text-lg font-light tracking-tight text-brand-navy flex items-center gap-2">
                <Landmark className="w-5 h-5 text-brand-navy animate-none" />
                Flujo del Checkout de Recaudo
              </h3>
              
              <ol className="space-y-4 text-xs text-gray-600 font-sans list-decimal list-inside leading-relaxed">
                <li className="leading-relaxed">
                  <span className="text-brand-navy font-bold">Captura del área en 3D:</span> El catálogo/carrito almacena la Latitud, Longitud y Zoom del relieve antes de iniciar el checkout.
                </li>
                <li className="leading-relaxed">
                  <span className="text-brand-navy font-bold">Asignación de Referencia Única:</span> Se crea un identificador exclusivo en Firestore para evitar dobles cobros (ej. <code className="text-brand-navy bg-brand-sand/20 px-1.5 py-0.5 font-mono">FRAG_283921</code>).
                </li>
                <li className="leading-relaxed">
                  <span className="text-brand-navy font-bold">Carga del Widget de Pago:</span> Dependiendo del método seleccionado (Wompi o ePayco), se inicializa la pasarela con el monto total de la orden en pesos colombianos (COP).
                </li>
                <li className="leading-relaxed">
                  <span className="text-brand-navy font-bold">Verificación Webhook Server-to-Server:</span> Tras la transacción, la pasarela dispara un webhook firmado criptográficamente que actualiza la base de datos a <code className="text-brand-navy font-mono font-bold">"paid"</code>.
                </li>
                <li className="leading-relaxed">
                  <span className="text-brand-navy font-bold">Notificación al Taller:</span> Al aprobarse el pago, se emite una alerta detallada de fabricación de 3D, incluyendo las especificaciones geográficas del área del cliente.
                </li>
              </ol>

              {/* Status Indicator */}
              <div className="bg-brand-sand/10 p-4 border border-brand-gray/30 rounded-none flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed text-gray-600">
                  <span className="text-brand-navy font-bold block uppercase tracking-wider text-[9px] mb-1">Cumplimiento del PCI-DSS</span>
                  Fragmentos no almacena números de tarjeta ni claves de Nequi. Las transacciones son procesadas directamente en los servidores de la pasarela colombiana.
                </div>
              </div>
            </div>

            {/* Quick tips */}
            <div className="bg-white border border-brand-gray/30 p-8 rounded-none space-y-4 shadow-sm">
              <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-brand-navy font-medium">Configuración de Redirecciones</h4>
              <p className="text-gray-650 text-xs leading-relaxed">
                Asegúrate de registrar tu URL de redirección en tu consola administrativa de la pasarela:
              </p>
              <div className="bg-brand-sand/10 p-3 border border-brand-gray/30 rounded-none font-mono text-[9px] text-brand-navy break-all select-all flex justify-between items-center">
                <span>https://ais-pre-ezrrla7ivvmtzpqhowjkl4-327003435762.us-east5.run.app</span>
              </div>
            </div>

          </div>

          {/* Code playground / Readme - 7 Columns */}
          <div className="lg:col-span-7 flex flex-col bg-white border border-brand-gray/30 rounded-none overflow-hidden shadow-sm">
            <div className="bg-brand-sand/10 px-6 py-4 flex justify-between items-center border-b border-brand-gray/30 text-xs font-mono text-gray-550 select-none">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-gray/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-brand-gray/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-brand-navy/30" />
                <span className="font-bold text-brand-navy pl-2">
                  {activeTab === "wompi" ? "checkout_wompi.ts" : "checkout_epayco.ts"}
                </span>
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(activeTab === "wompi" ? wompiCode : epaycoCode)}
                className="hover:text-brand-terracotta font-bold font-mono text-[10px] uppercase tracking-widest transition-colors flex items-center gap-1.5 focus:outline-none"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copiar Código
                  </>
                )}
              </button>
            </div>

            {/* Code Block */}
            <div className="p-6 overflow-auto max-h-[480px] font-mono text-[11px] leading-relaxed text-gray-700 bg-white">
              <pre>{activeTab === "wompi" ? wompiCode : epaycoCode}</pre>
            </div>

            {/* Server Webhook Helper Block */}
            <div className="border-t border-brand-gray/30 bg-white">
              <div className="bg-brand-sand/10 px-6 py-3 flex justify-between items-center text-[10px] font-mono text-gray-550 border-b border-brand-gray/30 select-none">
                <span className="font-bold text-brand-navy">security_webhook_listener.ts</span>
                <span className="text-[9px] uppercase tracking-widest font-bold text-emerald-600 font-bold">Verificación Criptográfica</span>
              </div>
              <div className="p-6 overflow-auto max-h-[180px] font-mono text-[10.5px] leading-relaxed text-gray-650 bg-white">
                <pre>{webhookCode}</pre>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

import React, { useState } from "react";
import {
  ShieldCheck, Globe, LayoutGrid, Image as ImageIcon,
  ShoppingBag, Activity, Database, Truck, Calendar,
  MapPin, Eye, HelpCircle,
} from "lucide-react";
import { Order, Product, SiteSettings } from "../types";
import SitePanel from "./admin/SitePanel";
import ContentManager from "./admin/ContentManager";
import MediaLibrary from "./admin/MediaLibrary";

interface AdminDashboardProps {
  orders: Order[];
  onUpdateOrderStatus: (index: number, newStatus: "pending" | "paid" | "processing" | "shipped") => void;
  onSelectProductInMap: (lat: number, lng: number, zoom: number, name: string) => void;
  onClearOrders: () => void;
  products: Product[];
  onAddProduct: (newProduct: Product) => void;
  onEditProduct: (updatedProduct: Product) => void;
  onDeleteProduct: (id: string) => void;
  constructionMode?: boolean;
  onSiteSettingsSaved?: (settings: SiteSettings) => void;
  onNavigateToStore?: () => void;
}

type AdminTab = "sitio" | "contenido" | "multimedia" | "ordenes";

const TABS: { id: AdminTab; label: string; icon: React.ElementType }[] = [
  { id: "sitio",      label: "Sitio",       icon: Globe },
  { id: "contenido",  label: "Contenido",   icon: LayoutGrid },
  { id: "multimedia", label: "Multimedia",  icon: ImageIcon },
  { id: "ordenes",    label: "Órdenes",     icon: ShoppingBag },
];

export default function AdminDashboard({
  orders,
  onUpdateOrderStatus,
  onSelectProductInMap,
  onClearOrders,
  products,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  constructionMode = false,
  onSiteSettingsSaved = () => {},
  onNavigateToStore = () => {},
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("sitio");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  return (
    <section className="min-h-screen w-full bg-[#0d1b2a] text-white py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-white/10">
          <div>
            <span className="text-[10px] font-mono tracking-[0.3em] text-brand-terracotta uppercase font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Panel de Administración
            </span>
            <h1 className="text-3xl md:text-4xl font-light tracking-tight mt-2 text-white">
              Fragmentos City CMS
            </h1>
            <p className="text-white/40 text-xs mt-2 font-mono">
              {products.length} productos · {orders.length} órdenes · {constructionMode ? "Modo construcción activo" : "Sitio público"}
            </p>
          </div>

          {/* Status indicators */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-mono ${
              constructionMode
                ? "bg-brand-terracotta/15 border-brand-terracotta/30 text-brand-terracotta"
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            }`}>
              <span className={`w-2 h-2 rounded-full ${constructionMode ? "bg-brand-terracotta" : "bg-emerald-500 animate-pulse"}`} />
              {constructionMode ? "En Construcción" : "Sitio Activo"}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-white/5 rounded-2xl p-1 w-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider font-bold transition-all ${
                activeTab === id
                  ? "bg-brand-terracotta text-white shadow-lg"
                  : "text-white/40 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Tab: Sitio */}
        {activeTab === "sitio" && (
          <SitePanel
            constructionMode={constructionMode}
            onSiteSettingsSaved={onSiteSettingsSaved}
            onNavigateToStore={onNavigateToStore}
          />
        )}

        {/* Tab: Contenido */}
        {activeTab === "contenido" && (
          <ContentManager
            products={products}
            onAddProduct={onAddProduct}
            onEditProduct={onEditProduct}
            onDeleteProduct={onDeleteProduct}
          />
        )}

        {/* Tab: Multimedia */}
        {activeTab === "multimedia" && (
          <div className="bg-[#162231] rounded-2xl border border-white/10 p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <ImageIcon className="w-5 h-5 text-brand-terracotta" />
              <h2 className="text-base font-semibold text-white">Biblioteca Multimedia</h2>
            </div>
            <MediaLibrary />
          </div>
        )}

        {/* Tab: Órdenes */}
        {activeTab === "ordenes" && (
          <OrdersPanel
            orders={orders}
            onUpdateOrderStatus={onUpdateOrderStatus}
            onSelectProductInMap={onSelectProductInMap}
            onClearOrders={onClearOrders}
            selectedOrder={selectedOrder}
            setSelectedOrder={setSelectedOrder}
          />
        )}

      </div>
    </section>
  );
}

/* ── Orders Panel ─────────────────────────────────────────── */
function OrdersPanel({
  orders, onUpdateOrderStatus, onSelectProductInMap,
  onClearOrders, selectedOrder, setSelectedOrder,
}: {
  orders: Order[];
  onUpdateOrderStatus: (i: number, s: "pending" | "paid" | "processing" | "shipped") => void;
  onSelectProductInMap: (lat: number, lng: number, zoom: number, name: string) => void;
  onClearOrders: () => void;
  selectedOrder: Order | null;
  setSelectedOrder: (o: Order | null) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total recaudado", value: `COP ${orders.reduce((a, o) => a + o.total, 0).toLocaleString()}`, icon: Activity, color: "text-white" },
          { label: "Órdenes totales", value: String(orders.length), icon: Database, color: "text-white" },
          { label: "Pagados", value: String(orders.filter((o) => o.status === "paid").length), icon: Truck, color: "text-amber-400" },
          { label: "Despachados", value: String(orders.filter((o) => o.status === "shipped").length), icon: Calendar, color: "text-emerald-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-[#162231] rounded-2xl border border-white/10 p-5 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-mono uppercase tracking-widest text-white/40 block mb-1">{label}</span>
              <span className={`text-xl font-mono font-bold ${color}`}>{value}</span>
            </div>
            <Icon className="w-5 h-5 text-white/10" />
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onClearOrders}
          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-mono text-[10px] uppercase tracking-widest rounded-xl transition-colors border border-red-500/20"
        >
          Vaciar Historial
        </button>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Orders table */}
        <div className="lg:col-span-8 bg-[#162231] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Pedidos Registrados</h3>
            <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Sync On</span>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-16 text-white/30 space-y-3">
              <ShoppingBag className="w-8 h-8 mx-auto" />
              <p className="text-sm">No hay pedidos registrados</p>
              <p className="text-xs max-w-xs mx-auto">Los pedidos apareceran aqui cuando un cliente inicie el pago con Wompi.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-white/5">
                <thead className="bg-white/5 text-white/40 font-mono text-[9px] uppercase tracking-widest">
                  <tr>
                    <th className="px-5 py-3">Cliente / Fecha</th>
                    <th className="px-5 py-3">Ítems</th>
                    <th className="px-5 py-3">Total</th>
                    <th className="px-5 py-3">Estado</th>
                    <th className="px-5 py-3 text-right">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.map((order, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-semibold text-white block">{order.shipping.fullName}</span>
                        <span className="text-[10px] text-white/40 font-mono">
                          {new Date(order.createdAt).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono text-white/70 bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg text-[10px]">
                          {order.items.reduce((t, it) => t + it.quantity, 0)} piezas
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono font-bold text-white">COP {order.total.toLocaleString()}</span>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => onUpdateOrderStatus(idx, e.target.value as any)}
                          className={`px-2 py-1.5 text-[9px] font-mono tracking-widest font-bold rounded-lg uppercase border focus:outline-none cursor-pointer ${
                            order.status === "pending"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                               : order.status === "paid"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : order.status === "processing"
                              ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          }`}
                        >
                          <option value="pending">No Pago</option>
                          <option value="paid">Pagado</option>
                          <option value="processing">En Relieve</option>
                          <option value="shipped">Despachado</option>
                        </select>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white font-mono text-[9px] uppercase tracking-widest rounded-lg transition-colors"
                        >
                          VER
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order detail */}
        <div className="lg:col-span-4 bg-[#162231] rounded-2xl border border-white/10 p-5 space-y-5 shadow-xl">
          <h3 className="text-sm font-semibold text-white pb-4 border-b border-white/10 flex items-center gap-2">
            <Eye className="w-4 h-4 text-brand-terracotta" /> Detalle Geográfico
          </h3>

          {selectedOrder ? (
            <div className="space-y-5">
              <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-2">
                <span className="text-[9px] font-mono uppercase tracking-widest text-white/30">Cliente</span>
                <p className="text-sm font-semibold text-white">{selectedOrder.shipping.fullName}</p>
                <p className="text-xs text-white/50">{selectedOrder.shipping.email}</p>
                <p className="text-xs text-white/50">{selectedOrder.shipping.address}, {selectedOrder.shipping.city}</p>
              </div>

              {selectedOrder.items.map((it, i) => (
                <div key={i} className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-white">{it.name}</span>
                    <span className="text-[9px] font-mono text-white/30">{it.size} cm</span>
                  </div>
                  {it.isCustom && it.customDetails ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
                        <span className="text-white/40">Lat:</span>
                        <span className="text-right text-white font-bold">{it.customDetails.latitude.toFixed(6)}</span>
                        <span className="text-white/40">Lng:</span>
                        <span className="text-right text-white font-bold">{it.customDetails.longitude.toFixed(6)}</span>
                        <span className="text-white/40">Zoom:</span>
                        <span className="text-right text-white font-bold">{it.customDetails.zoom}</span>
                      </div>
                      <button
                        onClick={() => onSelectProductInMap(it.customDetails!.latitude, it.customDetails!.longitude, it.customDetails!.zoom, it.name)}
                        className="w-full py-2.5 bg-brand-terracotta hover:bg-[#8a5c3f] text-white font-mono text-[10px] uppercase tracking-widest rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <MapPin className="w-3.5 h-3.5" /> Ubicar en Mapa
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-white/30">Modelo predefinido del catálogo.</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-white/20 gap-3 bg-white/5 rounded-xl border border-white/10">
              <HelpCircle className="w-8 h-8" />
              <p className="text-xs text-center leading-relaxed">Haz clic en "VER" para inspeccionar los archivos GIS de una orden</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

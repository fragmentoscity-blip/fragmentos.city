/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Catalog, { INITIAL_PRODUCTS } from "./components/Catalog";
import MapConfigurator from "./components/MapConfigurator";
import Sustainability from "./components/Sustainability";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import OrderSuccess from "./components/OrderSuccess";
import AdminDashboard from "./components/AdminDashboard";
import LoginModal from "./components/LoginModal";
import LoadingScreen from "./components/LoadingScreen";
import Logo from "./components/Logo";
import { CartItem, DEFAULT_SITE_SETTINGS, Order, Product, SiteSettings } from "./types";
import {
  getProductsFromSupabase,
  saveProductToSupabase,
  deleteProductFromSupabase,
  getOrdersFromSupabase,
  createOrderInSupabase,
  updateOrderStatusInSupabase,
  getSiteSettings,
  getCurrentAdminUser,
  signOutAdminUser,
  supabase,
  AdminUser,
} from "./lib/supabaseClient";
import { WompiCheckoutResult } from "./lib/wompi";

import { Instagram } from "lucide-react";

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("fragmentos_cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem("fragmentos_orders");
    return saved ? JSON.parse(saved) : [];
  });

  const [currentView, setCurrentView] = useState<"store" | "checkout" | "success" | "admin">("store");
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  const [constructionMode, setConstructionMode] = useState<boolean>(() => {
    return localStorage.getItem("fragmentos_construction_mode") === "true";
  });
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem("fragmentos_site_settings");
    if (saved) {
      try {
        return { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        return DEFAULT_SITE_SETTINGS;
      }
    }
    return DEFAULT_SITE_SETTINGS;
  });

  // Leer modo construcción desde Supabase al cargar (para todos los visitantes)
  useEffect(() => {
    getSiteSettings().then((data) => {
      if (data) {
        const nextSettings: SiteSettings = {
          site_active: data.site_active ?? DEFAULT_SITE_SETTINGS.site_active,
          construction_mode: data.construction_mode ?? DEFAULT_SITE_SETTINGS.construction_mode,
          construction_title: data.construction_title ?? DEFAULT_SITE_SETTINGS.construction_title,
          construction_subtitle: data.construction_subtitle ?? DEFAULT_SITE_SETTINGS.construction_subtitle,
          construction_message: data.construction_message ?? DEFAULT_SITE_SETTINGS.construction_message,
          construction_open_date: data.construction_open_date ?? DEFAULT_SITE_SETTINGS.construction_open_date,
          construction_logo: data.construction_logo ?? DEFAULT_SITE_SETTINGS.construction_logo,
          construction_bg_image: data.construction_bg_image ?? DEFAULT_SITE_SETTINGS.construction_bg_image,
          construction_email: data.construction_email ?? DEFAULT_SITE_SETTINGS.construction_email,
          construction_socials: data.construction_socials ?? DEFAULT_SITE_SETTINGS.construction_socials,
        };
        setSiteSettings(nextSettings);
        setConstructionMode(nextSettings.construction_mode);
        localStorage.setItem("fragmentos_site_settings", JSON.stringify(nextSettings));
        localStorage.setItem("fragmentos_construction_mode", String(nextSettings.construction_mode));
      }
    });
  }, []);

  const handleSiteSettingsSaved = (settings: SiteSettings) => {
    setSiteSettings(settings);
    setConstructionMode(settings.construction_mode);
    localStorage.setItem("fragmentos_site_settings", JSON.stringify(settings));
    localStorage.setItem("fragmentos_construction_mode", String(settings.construction_mode));
  };

  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  const playLoadingScreen = () => {
    setShowLoadingScreen(true);
  };

  // Cross-component coordinates focus state
  const [focusedLocation, setFocusedLocation] = useState<{ lat: number; lng: number; zoom: number; name: string } | null>(null);

  // Save changes to localstorage
  useEffect(() => {
    localStorage.setItem("fragmentos_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Save orders to localstorage
  useEffect(() => {
    localStorage.setItem("fragmentos_orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    let mounted = true;

    const syncAdminSession = async () => {
      const adminUser = await getCurrentAdminUser();
      if (mounted) setCurrentUser(adminUser);
    };

    syncAdminSession();
    const { data: subscription } = supabase.auth.onAuthStateChange(() => {
      syncAdminSession();
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  // Fetch real-time products and orders from Supabase on load
  useEffect(() => {
    async function loadSupabaseData() {
      const dbProducts = await getProductsFromSupabase();
      if (dbProducts) {
        setProducts(dbProducts);
      }
      const dbOrders = await getOrdersFromSupabase();
      if (dbOrders && dbOrders.length > 0) {
        setOrders(dbOrders);
      }
    }
    loadSupabaseData();
  }, []);


  // Security check: If a normal user is on an admin view, kick to store
  useEffect(() => {
    if (!currentUser?.isAdmin && currentView === "admin") {
      setCurrentView("store");
    }
  }, [currentUser, currentView]);

  const handleAddToCart = (newItem: CartItem) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex((item) => item.id === newItem.id);
      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += newItem.quantity;
        return copy;
      }
      return [...prev, newItem];
    });
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return { ...item, quantity: Math.max(1, nextQty) };
          }
          return item;
        });
    });
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleScrollToSection = (id: string) => {
    setCurrentView("store");
    // Ensure Leaflet triggers resize if coming back
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handleSelectProductInMap = (lat: number, lng: number, zoom: number, name: string) => {
    setFocusedLocation({ lat, lng, zoom, name });
    console.log(`Ubicación seleccionada: ${name} (Lat: ${lat}, Lng: ${lng})`);
  };

  const handleProceedToCheckout = () => {
    setCartOpen(false);
    setCurrentView("checkout");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCreateOrder = (order: Order) => {
    const enrichedOrder: Order = {
      ...order,
      id: order.id || "ped_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now(),
      paymentReference: order.paymentReference || `FRAG_${Date.now()}`
    };
    setOrders((prev) => [enrichedOrder, ...prev]);
    createOrderInSupabase(enrichedOrder);
    return enrichedOrder;
  };

  const handlePaymentApproved = (order: Order, result: WompiCheckoutResult) => {
    const paidOrder: Order = {
      ...order,
      status: "paid",
      wompiTransactionId: result.transaction?.id,
    };
    setOrders((prev) => prev.map((existing) => existing.id === paidOrder.id ? paidOrder : existing));
    if (paidOrder.id) {
      updateOrderStatusInSupabase(paidOrder.id, "paid");
    }
    setPlacedOrder(paidOrder);
    setCartItems([]);
    setCurrentView("success");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdateOrderStatus = (index: number, newStatus: "pending" | "paid" | "processing" | "shipped") => {
    setOrders((prev) => {
      const copy = [...prev];
      const targetOrder = copy[index];
      if (targetOrder) {
        targetOrder.status = newStatus;
        if (targetOrder.id) {
          updateOrderStatusInSupabase(targetOrder.id, newStatus);
        }
      }
      return copy;
    });
  };

  const handleClearOrders = () => {
    setOrders([]);
  };

  const handleAddProduct = async (newProduct: Product) => {
    const savedProduct = await saveProductToSupabase(newProduct);
    setProducts((prev) => [...prev.filter((p) => p.id !== savedProduct.id), savedProduct]);
  };

  const handleEditProduct = async (updatedProduct: Product) => {
    const savedProduct = await saveProductToSupabase(updatedProduct);
    setProducts((prev) => prev.map(p => p.id === savedProduct.id ? savedProduct : p));
  };

  const handleDeleteProduct = async (id: string) => {
    await deleteProductFromSupabase(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const totalCartCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);

  const handleLogin = (username: string, email: string, isAdmin: boolean) => {
    playLoadingScreen();
    setCurrentUser({ username, email, isAdmin: true });
    setLoginOpen(false);
  };

  const handleLogout = async () => {
    await signOutAdminUser();
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-white text-brand-navy font-sans antialiased selection:bg-brand-navy selection:text-white">
      {showLoadingScreen && (
        <LoadingScreen
          onComplete={() => setShowLoadingScreen(false)}
        />
      )}
      
      {/* Construction Mode Fullscreen Blurred Glass Overlay */}
      {constructionMode && !currentUser?.isAdmin && (
        <div
          className="fixed inset-0 z-[9999] backdrop-blur-xl bg-white/70 flex flex-col justify-between items-center py-16 px-6 text-center select-none overflow-y-auto"
          style={{
            backgroundImage: siteSettings.construction_bg_image
              ? `linear-gradient(rgba(255,255,255,0.78),rgba(255,255,255,0.9)), url(${siteSettings.construction_bg_image})`
              : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Top branding */}
          <div className="flex flex-col items-center gap-2">
            {siteSettings.construction_logo ? (
              <img src={siteSettings.construction_logo} alt="Fragmentos" className="h-16 max-w-[220px] object-contain" />
            ) : (
              <Logo />
            )}
            <span className="text-[9px] font-mono tracking-[0.4em] text-brand-gray uppercase font-bold mt-2">
              Edición Relieves de la Sabana
            </span>
          </div>

          {/* Central polished message */}
          <div className="max-w-xl mx-auto my-auto py-12 space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-sand/35 border border-brand-gray/30 text-[10px] font-mono tracking-widest text-brand-terracotta uppercase font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-terracotta animate-pulse" /> Sitio en Construcción
            </div>

            <div className="space-y-4">
              <h1 className="text-[0px] font-serif text-brand-navy tracking-tight leading-tight">
                <span className="text-4xl md:text-6xl">
                  {siteSettings.construction_title || DEFAULT_SITE_SETTINGS.construction_title}
                </span>
                El relieve de tu historia está por llegar.
              </h1>
              <p className="text-[0px] text-gray-600 font-sans leading-relaxed max-w-lg mx-auto">
                <span className="text-sm md:text-base">
                  {siteSettings.construction_subtitle || DEFAULT_SITE_SETTINGS.construction_subtitle}
                </span>
                Estamos tallando digitalmente las curvas topográficas de cada ciudad. La experiencia completa de personalización 3D estará lista muy pronto.
              </p>
              {siteSettings.construction_message && (
                <p className="text-gray-500 font-sans text-xs md:text-sm leading-relaxed max-w-lg mx-auto">
                  {siteSettings.construction_message}
                </p>
              )}
            </div>

            {/* Launch Box Display */}
            {(siteSettings.construction_open_date || siteSettings.construction_email) && (
              <div className="border border-brand-gray/30 bg-white p-8 space-y-3 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 left-0 w-full h-[3px] bg-brand-terracotta" />
                {siteSettings.construction_open_date && (
                  <>
                    <span className="text-[10px] font-mono tracking-widest text-brand-gray uppercase font-bold block">
                      LANZAMIENTO OFICIAL
                    </span>
                    <div className="text-3xl md:text-4xl font-serif font-bold text-brand-navy">
                      {new Date(siteSettings.construction_open_date).toLocaleDateString("es-CO", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  </>
                )}
                {siteSettings.construction_email && (
                  <a
                    href={`mailto:${siteSettings.construction_email}`}
                    className="inline-flex text-[10px] font-mono text-brand-terracotta tracking-wider uppercase font-semibold hover:text-brand-navy"
                  >
                    {siteSettings.construction_email}
                  </a>
                )}
              </div>
            )}
            <div className="hidden border border-brand-gray/30 bg-white p-8 space-y-3 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-brand-terracotta" />
              <span className="text-[10px] font-mono tracking-widest text-brand-gray uppercase font-bold block">
                LANZAMIENTO OFICIAL
              </span>
              <div className="text-3xl md:text-4xl font-serif font-bold text-brand-navy">
                6 de julio de 2026
              </div>
              <p className="text-[10px] font-mono text-brand-terracotta tracking-wider uppercase font-semibold">
                Bogotá, Colombia • Colección Limitada
              </p>
            </div>
          </div>

          {/* Bottom login trigger link */}
          <div className="space-y-4">
            <div className="text-[10px] font-mono text-brand-gray tracking-widest uppercase">
              © 2026 FRAGMENTOS. TODOS LOS DERECHOS RESERVADOS.
            </div>
            
            <button
              onClick={() => setLoginOpen(true)}
              className="text-xs font-mono tracking-widest uppercase text-brand-navy/60 hover:text-brand-terracotta transition-colors underline font-semibold"
            >
              Colaboradores
            </button>
          </div>
        </div>
      )}
      
      {/* Header navigation bar */}
      <Navbar
        currentView={currentView}
        cartCount={totalCartCount}
        onOpenCart={() => setCartOpen(true)}
        onScrollToSection={handleScrollToSection}
        onOpenAdmin={() => {
          setCurrentView("admin");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main views router */}
      {currentView === "store" && (
        <main className="w-full">
          {/* Parallax display gallery introduction */}
          <Hero
            onScrollToCatalog={() => handleScrollToSection("catalogo")}
          />

          {/* Sizing of ready catalog models */}
          <Catalog
            onAddToCart={handleAddToCart}
            onOpenCart={() => setCartOpen(true)}
            onSelectProductInMap={handleSelectProductInMap}
            products={products}
          />

          {/* Bio sustainability overview */}
          <Sustainability />

          {/* Bottom brand footer */}
          <footer className="bg-neutral-950 text-neutral-400 py-16 px-4 md:px-8 border-t border-neutral-900 font-mono text-xs text-center md:text-left select-none">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="space-y-1.5 text-center md:text-left">
                <span className="font-serif font-semibold tracking-widest text-white text-base uppercase">Fragmentos</span>
                <p className="text-[10px] text-neutral-500">Mapeados en relieve físico biodegradable, ensamblados a mano en Bogotá.</p>
              </div>
              <div className="flex gap-6 uppercase tracking-wider text-[10px]">
                <button onClick={() => handleScrollToSection("catalogo")} className="hover:text-white transition-colors">Colección</button>
                <button onClick={() => handleScrollToSection("sostenibilidad")} className="hover:text-white transition-colors">Sostenibilidad</button>
                <button onClick={() => setLoginOpen(true)} className="hover:text-white transition-colors">Colaboradores</button>
                {currentUser?.isAdmin && (
                  <button onClick={() => setCurrentView("admin")} className="hover:text-white text-zinc-500 transition-colors">Administrador</button>
                )}
              </div>
              <span className="text-[10px] text-neutral-600 block md:inline">© 2026 Fragmentos Co. Hecho con bioplástico PLA de maíz.</span>
            </div>
          </footer>
        </main>
      )}

      {currentView === "checkout" && (
        <Checkout
          cartItems={cartItems}
          onBackToCart={() => {
            setCurrentView("store");
            setCartOpen(true);
          }}
          onCreateOrder={handleCreateOrder}
          onPaymentApproved={handlePaymentApproved}
        />
      )}

      {currentView === "success" && placedOrder && (
        <OrderSuccess
          order={placedOrder}
          onBackToHome={() => {
            setPlacedOrder(null);
            setCurrentView("store");
          }}
        />
      )}
      {currentView === "admin" && (
        <main>
          <div className="pt-16">
            <AdminDashboard
              orders={orders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onSelectProductInMap={handleSelectProductInMap}
              onClearOrders={handleClearOrders}
              products={products}
              onAddProduct={handleAddProduct}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
              constructionMode={constructionMode}
              onSiteSettingsSaved={handleSiteSettingsSaved}
              onNavigateToStore={() => setCurrentView("store")}
            />
          </div>
          <div className="bg-white text-center pb-20">
            <button
              onClick={() => setCurrentView("store")}
              className="text-xs font-mono tracking-widest uppercase text-brand-navy hover:text-brand-terracotta border border-brand-gray/40 py-2.5 px-6 rounded-none hover:bg-brand-sand/10 transition-all font-semibold"
            >
              ← Regresar al E-commerce Público
            </button>
          </div>
        </main>
      )}

      {/* Cart Sliding Overlay */}
      <Cart
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* Login Authentication Modal */}
      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLogin={handleLogin}
      />

      {/* Global Footer */}
      <footer className="bg-white border-t border-brand-gray/30 py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center flex flex-col items-center">
          <div className="mb-4 scale-90">
            <Logo />
          </div>
          <p className="text-gray-550 font-sans text-xs max-w-md mx-auto mb-6">
            Obras de arte topográficas tridimensionales de ciudades y paisajes reales, elaboradas con bioplásticos sustentables.
          </p>
          <a
            href="https://www.instagram.com/fragmentos.city/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 p-3 bg-brand-sand/15 hover:bg-brand-navy hover:text-white border border-brand-gray/40 transition-all font-mono text-[10px] uppercase tracking-widest text-brand-navy mb-10 font-bold"
          >
            <Instagram className="w-4 h-4 text-brand-terracotta" />
            Síguenos en Instagram
          </a>
          
          <div className="text-[9px] font-mono tracking-widest text-brand-gray uppercase">
            © {new Date().getFullYear()} Fragmentos. Todos los derechos reservados.
          </div>
        </div>
      </footer>

    </div>
  );
}

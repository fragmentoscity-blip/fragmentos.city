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
import FavoritesDrawer from "./components/FavoritesDrawer";
import Checkout from "./components/Checkout";
import OrderSuccess from "./components/OrderSuccess";
import PaymentsPlan from "./components/PaymentsPlan";
import AdminDashboard from "./components/AdminDashboard";
import LoginModal from "./components/LoginModal";
import LoginRequiredModal from "./components/LoginRequiredModal";
import Logo from "./components/Logo";
import { CartItem, Order, Product } from "./types";
import {
  getProductsFromSupabase,
  saveProductToSupabase,
  deleteProductFromSupabase,
  getOrdersFromSupabase,
  createOrderInSupabase,
  updateOrderStatusInSupabase,
  getSiteSettings,
  saveSiteSettings,
} from "./lib/supabaseClient";

import { Sliders, RefreshCw, Smartphone, Star, Map, ShieldAlert, CheckCircle, Instagram } from "lucide-react";

// Initial simulated history of orders
const DEMO_ORDERS_INITIAL: Order[] = [
  {
    items: [
      {
        id: "frag_bog_1818_maderanatural",
        productId: "frag_bog",
        name: "Fragmento Bogotá (Cerros Orientales)",
        size: "18x18",
        color: "Madera natural",
        price: 159000,
        quantity: 1,
        image: "/src/assets/images/bogota_3d_frame_1781095869593.png",
      },
    ],
    shipping: {
      fullName: "Camilo Torres",
      email: "camilo.torres@gmail.com",
      phone: "3204567890",
      department: "Bogotá D.C.",
      city: "Chapinero",
      address: "Calle 72 # 5 - 12",
      notes: "Esquina junto al café, edificio de fachas de ladrillo.",
    },
    subtotal: 159000,
    shippingCost: 0,
    total: 159000,
    paymentMethod: "wompi",
    status: "processing",
    createdAt: "2026-06-08T15:20:00Z",
  },
  {
    items: [
      {
        id: "custom_4.6534_-74.0532_1818_Negro",
        productId: "custom_3d_frame",
        name: "Cuadro 3D Personalizado: Usaquén",
        size: "18x18",
        color: "Negro",
        price: 159000,
        quantity: 1,
        image: "/src/assets/images/bogota_3d_frame_1781095869593.png",
        isCustom: true,
        customDetails: {
          latitude: 4.6973,
          longitude: -74.0298,
          zoom: 14,
          address: "Usaquén, Bogotá, Colombia",
          style: "dark",
        },
      },
    ],
    shipping: {
      fullName: "Isabella Restrepo",
      email: "isa.restrepo@outlook.com",
      phone: "3159876543",
      department: "Bogotá D.C.",
      city: "Usaquén",
      address: "Carrera 7d # 120 - 45",
      notes: "Dejar con vigilante.",
    },
    subtotal: 159000,
    shippingCost: 0,
    total: 159000,
    paymentMethod: "epayco",
    status: "shipped",
    createdAt: "2026-06-09T09:45:00Z",
  },
];

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("fragmentos_cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem("fragmentos_orders");
    return saved ? JSON.parse(saved) : DEMO_ORDERS_INITIAL;
  });

  const [currentView, setCurrentView] = useState<"store" | "checkout" | "success" | "payments_plan" | "admin">("store");
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginRequiredOpen, setLoginRequiredOpen] = useState(false);
  
  const [likedProducts, setLikedProducts] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("fragmentos_liked");
    return saved ? JSON.parse(saved) : {};
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem("fragmentos_products");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure Fragmento Medellín is injected if not already present
        if (!parsed.some((p: any) => p.id === "frag_med")) {
          const med = INITIAL_PRODUCTS.find((p) => p.id === "frag_med");
          if (med) parsed.push(med);
        }
        return parsed;
      } catch (e) {
        return INITIAL_PRODUCTS;
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [constructionMode, setConstructionMode] = useState<boolean>(() => {
    return localStorage.getItem("fragmentos_construction_mode") === "true";
  });

  // Leer modo construcción desde Supabase al cargar (para todos los visitantes)
  useEffect(() => {
    getSiteSettings().then((data) => {
      if (data && typeof data.construction_mode === "boolean") {
        setConstructionMode(data.construction_mode);
        localStorage.setItem("fragmentos_construction_mode", String(data.construction_mode));
      }
    });
  }, []);

  const handleToggleConstructionMode = () => {
    setConstructionMode((prev) => {
      const newVal = !prev;
      localStorage.setItem("fragmentos_construction_mode", String(newVal));
      saveSiteSettings({ construction_mode: newVal });
      return newVal;
    });
  };

  const [currentUser, setCurrentUser] = useState<{ username: string; isAdmin: boolean } | null>(() => {
    const saved = localStorage.getItem("fragmentos_user");
    return saved ? JSON.parse(saved) : null;
  });

  // Cross-component coordinates focus state
  const [focusedLocation, setFocusedLocation] = useState<{ lat: number; lng: number; zoom: number; name: string } | null>(null);

  // Save changes to localstorage
  useEffect(() => {
    localStorage.setItem("fragmentos_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem("fragmentos_liked", JSON.stringify(likedProducts));
  }, [likedProducts]);

  useEffect(() => {
    localStorage.setItem("fragmentos_products", JSON.stringify(products));
  }, [products]);

  // Save orders to localstorage
  useEffect(() => {
    localStorage.setItem("fragmentos_orders", JSON.stringify(orders));
  }, [orders]);

  // Save user to localstorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("fragmentos_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("fragmentos_user");
    }
  }, [currentUser]);

  // Fetch real-time products and orders from Supabase on load
  useEffect(() => {
    async function loadSupabaseData() {
      const dbProducts = await getProductsFromSupabase();
      if (dbProducts && dbProducts.length > 0) {
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
    if (!currentUser?.isAdmin && (currentView === "admin" || currentView === "payments_plan")) {
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

  const handleSubmitOrder = (order: Order) => {
    const enrichedOrder = {
      ...order,
      id: order.id || "ped_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now()
    };
    setOrders((prev) => [enrichedOrder, ...prev]);
    setPlacedOrder(enrichedOrder);
    setCartItems([]); // Clear cart
    setCurrentView("success");
    window.scrollTo({ top: 0, behavior: "smooth" });
    createOrderInSupabase(enrichedOrder);
  };

  const handleUpdateOrderStatus = (index: number, newStatus: "pending" | "processing" | "shipped") => {
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

  const handleSeedDemoOrders = () => {
    setOrders(DEMO_ORDERS_INITIAL);
    DEMO_ORDERS_INITIAL.forEach(order => {
      createOrderInSupabase({
        ...order,
        id: order.id || "ped_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now()
      });
    });
  };

  const handleClearOrders = () => {
    setOrders([]);
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [...prev, newProduct]);
    saveProductToSupabase(newProduct);
  };

  const handleEditProduct = (updatedProduct: Product) => {
    setProducts((prev) => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    saveProductToSupabase(updatedProduct);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    deleteProductFromSupabase(id);
  };

  const handleToggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      setLoginRequiredOpen(true);
      return;
    }
    setLikedProducts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalCartCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);

  const handleLogin = (username: string, isAdmin: boolean) => {
    setCurrentUser({ username, isAdmin });
    setLoginOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-white text-brand-navy font-sans antialiased selection:bg-brand-navy selection:text-white">
      
      {/* Construction Mode Fullscreen Blurred Glass Overlay */}
      {constructionMode && !currentUser?.isAdmin && (
        <div className="fixed inset-0 z-[9999] backdrop-blur-xl bg-white/70 flex flex-col justify-between items-center py-16 px-6 text-center select-none overflow-y-auto">
          {/* Top branding */}
          <div className="flex flex-col items-center gap-2">
            <Logo />
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
              <h1 className="text-4xl md:text-6xl font-serif text-brand-navy tracking-tight leading-tight">
                El relieve de tu historia está por llegar.
              </h1>
              <p className="text-gray-600 font-sans text-sm md:text-base leading-relaxed max-w-lg mx-auto">
                Estamos tallando digitalmente las curvas topográficas de cada ciudad. La experiencia completa de personalización 3D estará lista muy pronto.
              </p>
            </div>

            {/* Launch Box Display */}
            <div className="border border-brand-gray/30 bg-white p-8 space-y-3 relative overflow-hidden shadow-sm">
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
              Administrador
            </button>
          </div>
        </div>
      )}
      
      {/* Header navigation bar */}
      <Navbar
        currentView={currentView}
        cartCount={totalCartCount}
        onOpenCart={() => setCartOpen(true)}
        onOpenFavorites={() => {
          if (!currentUser) {
            setLoginRequiredOpen(true);
          } else {
            setFavoritesOpen(true);
          }
        }}
        onScrollToSection={handleScrollToSection}
        onOpenAdmin={() => {
          setCurrentView("admin");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        currentUser={currentUser}
        onLoginClick={() => setLoginOpen(true)}
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
            likedProducts={likedProducts}
            onToggleLike={handleToggleLike}
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
          onSubmitOrder={handleSubmitOrder}
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

      {currentView === "payments_plan" && (
        <main>
          <div className="pt-20 bg-neutral-900">
            <PaymentsPlan />
          </div>
          <div className="bg-neutral-950 text-center py-10">
            <button
              onClick={() => setCurrentView("store")}
              className="text-xs font-mono tracking-widest uppercase text-neutral-400 hover:text-white underline"
            >
              ← Volver a la Tienda
            </button>
          </div>
        </main>
      )}

      {currentView === "admin" && (
        <main>
          <div className="pt-16">
            <AdminDashboard
              orders={orders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onSelectProductInMap={handleSelectProductInMap}
              onSeedDemoOrders={handleSeedDemoOrders}
              onClearOrders={handleClearOrders}
              products={products}
              onAddProduct={handleAddProduct}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
              constructionMode={constructionMode}
              onToggleConstructionMode={handleToggleConstructionMode}
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

      {/* Call to Action Drawers & Modals */}
      <FavoritesDrawer
        isOpen={favoritesOpen}
        onClose={() => setFavoritesOpen(false)}
        likedProducts={likedProducts}
        onToggleLike={handleToggleLike}
        products={products}
        onScrollToSection={handleScrollToSection}
      />

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

      <LoginRequiredModal
        isOpen={loginRequiredOpen}
        onClose={() => setLoginRequiredOpen(false)}
        onOpenLogin={() => setLoginOpen(true)}
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

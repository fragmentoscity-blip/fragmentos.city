/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShoppingBag, ShieldCheck, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import Logo from "./Logo";

interface NavbarProps {
  currentView: "store" | "checkout" | "success" | "admin";
  cartCount: number;
  onOpenCart: () => void;
  onScrollToSection: (id: string) => void;
  onOpenAdmin: () => void;
  currentUser: { username: string; email: string; isAdmin: boolean } | null;
  onLogout: () => void;
}

export default function Navbar({
  currentView,
  cartCount,
  onOpenCart,
  onScrollToSection,
  onOpenAdmin,
  currentUser,
  onLogout,
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const needsDarkText = isScrolled || currentView !== "store";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        needsDarkText
          ? "bg-white/90 backdrop-blur-md border-b border-neutral-200/60 shadow-sm text-neutral-900 py-3"
          : "bg-transparent text-white py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Brand logo */}
        <button
          onClick={() => onScrollToSection("hero")}
          className="flex items-center text-left focus:outline-none hover:opacity-90 transition-opacity"
        >
          <Logo needsDarkText={needsDarkText} />
        </button>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-mono tracking-widest uppercase">
          <button
            onClick={() => onScrollToSection("catalogo")}
            className="hover:opacity-75 transition-opacity"
          >
            Colección
          </button>
          <button
            onClick={() => onScrollToSection("sostenibilidad")}
            className="hover:opacity-75 transition-opacity"
          >
            Sostenibilidad
          </button>
          
          {currentUser && currentUser.isAdmin && (
            <>
              <button
                onClick={onOpenAdmin}
                className="hover:opacity-75 transition-opacity text-neutral-500 flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Admin Panel
              </button>
            </>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3 md:gap-4">
          {currentUser?.isAdmin && (
            <div className="hidden md:flex items-center">
              <div className="flex items-center gap-4 text-xs font-mono tracking-widest uppercase">
                <span className="opacity-70">{currentUser.email || currentUser.username}</span>
                <button 
                  onClick={onLogout}
                  className="hover:opacity-75 transition-opacity focus:outline-none flex items-center gap-1.5"
                >
                   Salir
                </button>
              </div>
            </div>
          )}

          <button
            onClick={onOpenCart}
            type="button"
            className="relative font-mono flex items-center gap-2 p-2 focus:outline-none hover:opacity-80 transition-opacity"
            title="Carrito"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-neutral-900 border border-white text-white dark:bg-white dark:text-neutral-950 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 focus:outline-none hover:opacity-80 z-[60] relative"
            style={{ color: mobileMenuOpen ? '#171717' : 'inherit' }}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel with smooth transition */}
      <div 
        className={`md:hidden absolute top-0 left-0 w-full bg-white border-b border-neutral-200 text-neutral-900 shadow-2xl overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="pt-20 px-6 pb-6 space-y-4 flex flex-col text-sm font-mono tracking-wider uppercase">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onScrollToSection("catalogo");
            }}
            className="text-left py-2 hover:pl-2 transition-all border-b border-neutral-100"
          >
            Colección
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onScrollToSection("sostenibilidad");
            }}
            className="text-left py-2 hover:pl-2 transition-all border-b border-neutral-100"
          >
            Sostenibilidad
          </button>

          {currentUser && currentUser.isAdmin && (
            <>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="text-left py-2 hover:pl-2 transition-all border-b border-neutral-100 text-neutral-500 flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" /> Panel de Administración
              </button>
            </>
          )}

          {currentUser?.isAdmin && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLogout();
              }}
              className="text-left py-2 hover:pl-2 transition-all border-b border-neutral-100 flex items-center gap-1.5 opacity-70 pt-4"
            >
              Salir ({currentUser.email || currentUser.username})
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

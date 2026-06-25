/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Check, ShoppingBag, Eye, Heart, MapPin, Sparkles } from "lucide-react";
import { Product, FrameSize, FrameColor, CartItem } from "../types";

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "frag_bog",
    name: "Fragmento Bogotá",
    description: "La joya de la sabana. Un relieve sofisticado que expone el contraste único entre el denso trazado urbano de la capital colombiana y la majestuosa cordillera de los Cerros Orientales, escalando desde Monserrate hasta Guadalupe.",
    basePrice: 159000,
    image: "/src/assets/images/bogota_3d_frame_1781095869593.png",
    stock: 5,
    details: { lat: 4.6097, lng: -74.0817, zoom: 13.5 }
  },
  {
    id: "frag_par",
    name: "Fragmento París",
    description: "L'Étoile et la Seine. Captura los doce deslumbrantes bulevares radiando de la Place de l'Étoile y las elegantes curvas del Río Sena cruzando el corazón histórico de la Ciudad Luz en un relieve tridimensional impecable.",
    basePrice: 159000,
    image: "/src/assets/images/paris_3d_frame_1781095885040.png",
    stock: 3,
    details: { lat: 48.8566, lng: 2.3522, zoom: 13.8 }
  },
  {
    id: "frag_bar",
    name: "Fragmento Barcelona",
    description: "La utopía geométrica de Ildefons Cerdà. Un cuadro hipnotizante que retrata la cuadrícula octogonal perfecta del barrio Eixample, cruzada diagonalmente por la gran Avenida Diagonal hacia el mar Mediterráneo.",
    basePrice: 159000,
    image: "/src/assets/images/barcelona_3d_frame_1781095898025.png",
    stock: 0,
    details: { lat: 41.3851, lng: 2.1734, zoom: 14.1 }
  },
  {
    id: "frag_med",
    name: "Fragmento Medellín",
    description: "La Tacita de Plata. Un magnífico relieve tridimensional que captura las escarpadas laderas del Valle de Aburrá, el cauce del Río Medellín serpenteando la metrópolis, y los impresionantes desniveles topográficos de sus cerros.",
    basePrice: 159000,
    originalPrice: 182750,
    discountPercent: 13,
    image: "/src/assets/images/bogota_3d_frame_1781095869593.png",
    stock: 4,
    details: { lat: 6.2442, lng: -75.5812, zoom: 13.5 }
  }
];

interface CatalogProps {
  onAddToCart: (item: CartItem) => void;
  onOpenCart: () => void;
  onSelectProductInMap: (lat: number, lng: number, zoom: number, name: string) => void;
  likedProducts: Record<string, boolean>;
  onToggleLike: (id: string, e: React.MouseEvent) => void;
  products: Product[];
}

export default function Catalog({ onAddToCart, onOpenCart, onSelectProductInMap, likedProducts, onToggleLike, products }: CatalogProps) {
  // Variant states for active product customization modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeSize, setActiveSize] = useState<FrameSize>("18x18");
  const [activeColor, setActiveColor] = useState<FrameColor>("Madera natural");

  const getPrice = (size: FrameSize, product?: Product) => {
    const current = product || selectedProduct;
    if (!current) return size === "10x10" ? 89000 : 159000;
    
    if (size === "10x10") {
      // Scale 10x10 down proportionally from basePrice
      return Math.round(current.basePrice * (89000 / 159000));
    }
    return current.basePrice;
  };

  const getOriginalPrice = (size: FrameSize, product?: Product) => {
    const current = product || selectedProduct;
    if (!current || !current.originalPrice) return null;
    
    if (size === "10x10") {
      // Scale 10x10 original price down proportionally
      return Math.round(current.originalPrice * (89000 / 159000));
    }
    return current.originalPrice;
  };

  const openCustomizerModal = (product: Product) => {
    setSelectedProduct(product);
    setActiveSize("18x18");
    
    // Set matching default frame color to represent initial beautiful generated imagery
    if (product.id === "frag_par") {
      setActiveColor("Negro");
    } else if (product.id === "frag_bar") {
      setActiveColor("Blanco");
    } else {
      setActiveColor("Madera natural");
    }
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    const price = getPrice(activeSize, selectedProduct);
    const cartId = `${selectedProduct.id}_${activeSize}_${activeColor.replace(/\s+/g, "")}`;

    const cartItem: CartItem = {
      id: cartId,
      productId: selectedProduct.id,
      name: selectedProduct.name,
      size: activeSize,
      color: activeColor,
      price: price,
      quantity: 1,
      image: selectedProduct.image,
    };

    onAddToCart(cartItem);
    setSelectedProduct(null);
    onOpenCart();
  };

  return (
    <section id="catalogo" className="w-full bg-brand-sand/35 text-brand-navy py-24 px-4 md:px-12 border-t border-brand-gray/30">
      <div className="max-w-7xl mx-auto">
        
        {/* Title Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4 border-b border-brand-gray/40 pb-8 select-none">
          <div className="max-w-xl">
            <span className="text-[10px] uppercase tracking-[0.2em] text-brand-terracotta font-bold">La Colección Archivo</span>
            <h2 className="text-3xl md:text-5xl font-light tracking-tight mt-2 text-brand-navy">Relieves Catalogados</h2>
            <p className="text-gray-600 font-sans text-xs md:text-sm mt-3 leading-relaxed italic">
              "Obras de arte tridimensionales listas para colgar, basadas en las topografías urbanas más emblemáticas del planeta."
            </p>
          </div>
          <div className="shrink-0">
            <span className="text-[10px] uppercase tracking-[0.2em] text-brand-terracotta font-bold">EDICIONES LIMITADAS</span>
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {products.map((prod) => (
            <article
              key={prod.id}
              className="bg-white border border-brand-gray/30 group flex flex-col justify-between hover:border-brand-navy transition-all duration-300 rounded-none overflow-hidden hover:shadow-md"
            >
              {/* Image box */}
              <div className="relative aspect-square w-full bg-[#FAFAFA] overflow-hidden border-b border-brand-gray/30">
                <img
                  src={prod.image}
                  alt={prod.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
                {prod.discountPercent && prod.discountPercent > 0 && (
                  <span className="absolute top-4 left-4 bg-brand-terracotta text-white font-mono text-[9px] uppercase tracking-widest px-2.5 py-1 font-bold z-10 animate-pulse">
                    -{prod.discountPercent}% OFF
                  </span>
                )}
                
                {/* Floating controls */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                  <button
                    onClick={(e) => onToggleLike(prod.id, e)}
                    className="p-2.5 bg-white text-brand-navy border border-brand-gray/40 hover:border-brand-navy transition-colors"
                    title="Añadir a deseos"
                  >
                    <Heart
                      className={`w-4 h-4 ${likedProducts[prod.id] ? "fill-brand-terracotta text-brand-terracotta" : "text-gray-400"}`}
                    />
                  </button>
                  <button
                    onClick={() => onSelectProductInMap(prod.details.lat, prod.details.lng, prod.details.zoom, prod.name)}
                    className="p-2.5 bg-white text-brand-navy border border-brand-gray/40 hover:border-brand-navy transition-colors"
                    title="Ubicar en taller interactivo"
                  >
                    <MapPin className="w-4 h-4 text-brand-terracotta" />
                  </button>
                </div>

                {/* Quick specs overlay */}
                <div className="absolute bottom-4 left-4 bg-white px-3 py-1.5 text-[9px] uppercase font-mono tracking-[0.15em] text-brand-navy border border-brand-gray/30 flex items-center gap-1.5 pointer-events-none">
                  <span className={`w-1.5 h-1.5 rounded-full ${prod.stock > 0 ? "bg-emerald-500" : "bg-red-500"}`} />
                  {prod.stock > 0 ? `Listo para Enviar (${prod.stock})` : "Agotado"}
                </div>
              </div>

              {/* Text content */}
              <div className="p-8 flex-grow flex flex-col justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline gap-2">
                    <h3 className="text-xl font-light tracking-tight text-brand-navy">
                      {prod.name}
                    </h3>
                    <div className="text-right">
                      {prod.discountPercent && prod.discountPercent > 0 ? (
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] line-through text-gray-400 font-mono">Desde COP {getOriginalPrice("10x10", prod)?.toLocaleString()}</span>
                          <span className="text-[10px] font-mono tracking-wider text-brand-terracotta font-bold">Desde COP {getPrice("10x10", prod).toLocaleString()}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono tracking-wider text-brand-terracotta shrink-0 font-semibold">Desde COP {getPrice("10x10", prod).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 text-xs leading-relaxed font-sans">
                    {prod.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-brand-gray/30">
                  <button
                    disabled={prod.stock <= 0}
                    onClick={() => openCustomizerModal(prod)}
                    className={`w-full font-mono text-xs uppercase tracking-[0.2em] py-4 flex items-center justify-center gap-2 font-bold transition-all duration-300 ${
                      prod.stock > 0 
                      ? "bg-brand-navy hover:bg-brand-terracotta text-white" 
                      : "bg-gray-150 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <Eye className="w-4 h-4" /> Configurar Variantes
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* QUICK CUSTOMIZATION DRAWER/MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full rounded-none border border-gray-100 shadow-2xl overflow-hidden flex flex-col justify-between max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-10 pb-6 border-b border-gray-100 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono tracking-[0.3em] text-gray-400 uppercase font-bold">Personalización</span>
                <h3 className="text-3xl font-light tracking-tight text-black mt-1">{selectedProduct.name}</h3>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1 px-3 border border-gray-200 hover:border-black text-[10px] font-mono tracking-[0.2em] uppercase transition-colors"
              >
                Cerrar
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-10 py-6 space-y-8 overflow-y-auto max-h-[55vh]">
              
              {/* Product preview & cost summary */}
              <div className="flex gap-6 items-center bg-[#FAFAFA] p-6 border border-gray-100 rounded-none">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 object-cover bg-neutral-200 border border-gray-100"
                />
                <div className="space-y-1.5 flex-1">
                  <span className="text-[9px] font-mono tracking-[0.2em] text-gray-400 uppercase font-bold">Resumen de Pieza</span>
                  <div className="text-xs font-sans text-gray-500 line-clamp-2 leading-relaxed italic">"{selectedProduct.description}"</div>
                  <div className="text-2xl font-light text-black flex items-baseline gap-2">
                    {getOriginalPrice(activeSize, selectedProduct) ? (
                      <>
                        <span className="text-sm line-through text-gray-400 font-mono">COP {getOriginalPrice(activeSize, selectedProduct)?.toLocaleString()}</span>
                        <span className="text-2xl font-light text-brand-terracotta">COP {getPrice(activeSize, selectedProduct).toLocaleString()}</span>
                      </>
                    ) : (
                      <span>COP {getPrice(activeSize, selectedProduct).toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Sizes Selection */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-black mb-4">
                  1. Dimensiones del Cuadro
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setActiveSize("10x10")}
                    className={`py-4 text-center transition-all text-xs uppercase tracking-widest border ${
                      activeSize === "10x10"
                        ? "border-black bg-white text-black font-bold"
                        : "border-gray-200 bg-white text-gray-400 hover:border-gray-400"
                    }`}
                  >
                    <div>10 x 10 cm</div>
                    <div className="text-[9px] font-mono tracking-widest mt-1 opacity-80">
                      {getOriginalPrice("10x10", selectedProduct) && (
                        <span className="line-through text-gray-400 mr-1">COP {getOriginalPrice("10x10", selectedProduct)?.toLocaleString()}</span>
                      )}
                      <span className={getOriginalPrice("10x10", selectedProduct) ? "text-brand-terracotta font-bold" : ""}>
                        COP {getPrice("10x10", selectedProduct).toLocaleString()}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveSize("18x18")}
                    className={`py-4 text-center transition-all text-xs uppercase tracking-widest border ${
                      activeSize === "18x18"
                        ? "border-black bg-white text-black font-bold"
                        : "border-gray-200 bg-white text-gray-400 hover:border-gray-400"
                    }`}
                  >
                    <div>18 x 18 cm</div>
                    <div className="text-[9px] font-mono tracking-widest mt-1 opacity-80">
                      {getOriginalPrice("18x18", selectedProduct) && (
                        <span className="line-through text-gray-400 mr-1">COP {getOriginalPrice("18x18", selectedProduct)?.toLocaleString()}</span>
                      )}
                      <span className={getOriginalPrice("18x18", selectedProduct) ? "text-brand-terracotta font-bold" : ""}>
                        COP {getPrice("18x18", selectedProduct).toLocaleString()}
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Colors Selection */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-black mb-4">
                  2. Color de Acabado del Marco
                </label>
                <div className="flex space-x-6 items-center">
                  {(["Madera natural", "Negro", "Blanco"] as FrameColor[]).map((framecol) => (
                    <button
                      key={framecol}
                      onClick={() => setActiveColor(framecol)}
                      className="flex flex-col items-center gap-2 group focus:outline-none"
                    >
                      <div className={`w-10 h-10 rounded-full border flex items-center justify-center p-1 transition-all ${
                        activeColor === framecol ? "border-black scale-105 shadow-sm" : "border-transparent opacity-60 hover:opacity-100"
                      }`}>
                        <div
                          className={`w-full h-full rounded-full border border-gray-200 ${
                            framecol === "Madera natural"
                              ? "bg-[#F4EBE2]"
                              : framecol === "Negro"
                              ? "bg-[#1A1A1A]"
                              : "bg-[#FFFFFF]"
                          }`}
                        />
                      </div>
                      <span className={`text-[10px] font-mono uppercase tracking-widest ${
                        activeColor === framecol ? "text-black font-bold" : "text-gray-400"
                      }`}>{framecol.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Detail Specifications */}
              <div className="pt-6 border-t border-gray-100 flex justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-gray-400">
                <span>Material: PLA Biodegradable</span>
                <span>Fabricación: Taller Bogotá</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-10 py-6 border-t border-gray-100 bg-[#FAFAFA] flex items-center justify-between gap-4">
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  onSelectProductInMap(selectedProduct.details.lat, selectedProduct.details.lng, selectedProduct.details.zoom, selectedProduct.name);
                }}
                className="text-[10px] font-mono tracking-[0.2em] font-bold uppercase text-gray-500 hover:text-black transition-colors"
              >
                Ver Coordenadas
              </button>
              <button
                onClick={handleAddToCart}
                className="bg-black hover:bg-neutral-900 text-white font-mono text-xs uppercase tracking-[0.2em] py-5 px-8 font-bold transition-colors flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" /> Añadir al Carrito
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Search, Map as MapIcon, Sliders, Check, HelpCircle } from "lucide-react";
import { FrameColor, FrameSize, CartItem } from "../types";

interface MapConfiguratorProps {
  onAddToCart: (item: CartItem) => void;
  onOpenCart: () => void;
  focusedLocation: { lat: number; lng: number; zoom: number; name: string } | null;
}

export default function MapConfigurator({ onAddToCart, onOpenCart, focusedLocation }: MapConfiguratorProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [mapStyle, setMapStyle] = useState<"light" | "dark">("dark");
  const [center, setCenter] = useState<{ lat: number; lng: number }>({ lat: 4.6097, lng: -74.0817 }); // Default: Bogotá
  const [zoom, setZoom] = useState(14);
  const [selectedAddress, setSelectedAddress] = useState("Bogotá, Colombia");

  const [frameSize, setFrameSize] = useState<FrameSize>("18x18");
  const [frameColor, setFrameColor] = useState<FrameColor>("Madera natural");

  const getPrice = (size: FrameSize) => {
    return size === "10x10" ? 89000 : 159000;
  };

  // Sync focusedLocation changes from outside (Catalog / Admin Panel order inspector)
  useEffect(() => {
    if (!focusedLocation || !mapRef.current) return;
    mapRef.current.setView([focusedLocation.lat, focusedLocation.lng], focusedLocation.zoom);
    setCenter({ lat: focusedLocation.lat, lng: focusedLocation.lng });
    setZoom(focusedLocation.zoom);
    setSelectedAddress(focusedLocation.name);
  }, [focusedLocation]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current, {
      center: [center.lat, center.lng],
      zoom: zoom,
      zoomControl: false, // We'll render custom clean buttons or let mouse wheel work
      attributionControl: true,
    });

    mapRef.current = map;

    // Custom zoom control in bottom right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Initial tile layer
    const tileUrl =
      mapStyle === "light"
        ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

    const attribution =
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

    const tileLayer = L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Listen to map changes to update coordinates
    const handleMoveEnd = () => {
      const currentCenter = map.getCenter();
      const currentZoom = map.getZoom();
      setCenter({ lat: currentCenter.lat, lng: currentCenter.lng });
      setZoom(currentZoom);
    };

    map.on("moveend", handleMoveEnd);

    // Dynamic marker-less crop: map center represents design center
    handleMoveEnd();

    return () => {
      map.off("moveend", handleMoveEnd);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync Map Style
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;

    const tileUrl =
      mapStyle === "light"
        ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

    tileLayerRef.current.setUrl(tileUrl);
  }, [mapStyle]);

  // Handle address search via Nominatim
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError("");
    setSearchResults([]);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=5&addressdetails=1`
      );
      if (!response.ok) throw new Error("Error en la solicitud.");
      const data = await response.json();
      setSearchResults(data);
      if (data.length === 0) {
        setSearchError("No se encontraron resultados. Intenta detallando más.");
      }
    } catch (err) {
      setSearchError("Hubo un error al buscar la dirección.");
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLocation = (result: any) => {
    if (!mapRef.current) return;

    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    
    mapRef.current.setView([lat, lon], 14);
    setCenter({ lat, lng: lon });
    setZoom(14);
    setSelectedAddress(result.display_name);
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleConfirmCustomFrame = () => {
    const itemPrice = getPrice(frameSize);
    
    // Format custom ID incorporating coordinates for uniqueness
    const latStr = center.lat.toFixed(4);
    const lngStr = center.lng.toFixed(4);
    const customId = `custom_${latStr}_${lngStr}_${frameSize}_${frameColor.replace(/\s+/g, "")}`;
    
    const customItem: CartItem = {
      id: customId,
      productId: "custom_3d_frame",
      name: `Cuadro 3D Personalizado: ${selectedAddress.split(",")[0]}`,
      size: frameSize,
      color: frameColor,
      price: itemPrice,
      quantity: 1,
      image: mapStyle === "light" 
        ? "https://picsum.photos/seed/maplight/400/400?blur=1" 
        : "https://picsum.photos/seed/mapdark/400/400?blur=1",
      isCustom: true,
      customDetails: {
        latitude: center.lat,
        longitude: center.lng,
        zoom: zoom,
        address: selectedAddress,
        style: mapStyle,
      }
    };

    onAddToCart(customItem);
    onOpenCart();
  };

  return (
    <section id="configurador" className="w-full bg-[#F5F5F5] text-black py-24 px-4 md:px-12 border-t border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-6">
          <div className="max-w-2xl">
            <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold">Taller Digital</span>
            <h2 className="text-3xl md:text-5xl font-light tracking-tight mt-2 mb-4 text-black">Configura tu Ciudad Personalizada</h2>
            <p className="text-gray-500 text-xs md:text-sm mt-3 leading-relaxed italic">
              "Busca cualquier lugar del mundo (tu barrio, la ciudad de tu último viaje, o donde diste tu primer beso) e imprime su relieve topográfico y trazado urbano en 3D."
            </p>
          </div>
          <div className="flex gap-2 shrink-0 self-start md:self-end">
            <button
              onClick={() => setMapStyle("light")}
              className={`px-4 py-2.5 text-xs font-mono tracking-widest uppercase border transition-all ${
                mapStyle === "light"
                  ? "bg-black text-white border-black font-bold"
                  : "bg-white text-gray-400 border-gray-200 hover:border-black"
              }`}
            >
              Minimal Light
            </button>
            <button
              onClick={() => setMapStyle("dark")}
              className={`px-4 py-2.5 text-xs font-mono tracking-widest uppercase border transition-all ${
                mapStyle === "dark"
                  ? "bg-black text-white border-black font-bold"
                  : "bg-white text-gray-400 border-gray-200 hover:border-black"
              }`}
            >
              Minimal Dark
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          {/* MAP CONTAINER - 8 Columns */}
          <div className="lg:col-span-8 flex flex-col relative bg-white border border-gray-200 overflow-hidden min-h-[500px] md:min-h-[600px]">
            {/* Search Overlay */}
            <div className="absolute top-4 left-4 right-4 z-[1000] max-w-sm">
              <form onSubmit={handleSearchSubmit} className="relative flex shadow-sm">
                <input
                  type="text"
                  placeholder="BUSCA UNA CALLE, CIUDAD..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white text-black placeholder-gray-400 text-[11px] uppercase tracking-widest px-4 py-3 outline-none border border-gray-200 focus:border-black transition-all"
                />
                <button
                  type="submit"
                  className="bg-black hover:bg-neutral-900 text-white px-4 transition-all flex items-center justify-center"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>

              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-none shadow-xl max-h-60 overflow-y-auto z-[1001] divide-y divide-gray-100">
                  {searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectLocation(result)}
                      className="w-full text-left px-4 py-3 text-xs text-gray-600 hover:bg-gray-150 hover:text-black transition-all block truncate"
                    >
                      {result.display_name}
                    </button>
                  ))}
                </div>
              )}

              {isSearching && (
                <div className="absolute left-0 right-0 mt-1 bg-white text-gray-400 text-xs px-4 py-3 border border-gray-200">
                  Buscando dirección...
                </div>
              )}

              {searchError && (
                <div className="absolute left-0 right-0 mt-1 bg-white text-red-500 text-xs px-4 py-3 border border-gray-200">
                  {searchError}
                </div>
              )}
            </div>

            {/* LEAFLET CONTAINER */}
            <div ref={mapContainerRef} className="w-full flex-grow h-[500px] md:h-full z-10" />

            {/* Centered Precision Cropping Guide */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div
                className={`relative border-2 border-dashed transition-all duration-300 ease-out flex items-center justify-center ${
                  frameSize === "10x10"
                    ? "w-44 h-44 md:w-56 md:h-56"
                    : "w-64 h-64 md:w-80 md:h-80"
                } ${mapStyle === "light" ? "border-neutral-900/40 bg-neutral-900/5 text-black" : "border-white/50 bg-white/5 text-white"}`}
              >
                {/* Crop corners */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-solid border-current transform -translate-x-0.5 -translate-y-0.5" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-solid border-current transform translate-x-0.5 -translate-y-0.5" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-solid border-current transform -translate-x-0.5 translate-y-0.5" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-solid border-current transform translate-x-0.5 translate-y-0.5" />

                {/* Central Crosshair */}
                <span className="bg-black text-white text-[9px] font-mono tracking-widest uppercase select-none px-2.5 py-1">
                  {frameSize === "10x10" ? "ÁREA 10x10cm" : "ÁREA 18x18cm"}
                </span>
              </div>
            </div>

            {/* Coordinates HUD */}
            <div className="absolute bottom-4 left-4 z-20 bg-white text-[10px] font-mono p-4 border border-gray-200 text-gray-400 select-none flex flex-col gap-1 shadow-sm">
              <span className="text-black uppercase tracking-[0.2em] font-bold border-b border-gray-100 pb-1.5 mb-1.5 text-[9px]">Ubicación Actual</span>
              <div className="truncate max-w-[200px] text-black font-sans font-medium mb-1.5" title={selectedAddress}>
                {selectedAddress.split(",")[0]}
              </div>
              <div className="text-black/80 font-mono tracking-wider">LAT: <span className="font-sans font-bold">{center.lat.toFixed(5)}</span></div>
              <div className="text-black/80 font-mono tracking-wider">LNG: <span className="font-sans font-bold">{center.lng.toFixed(5)}</span></div>
              <div className="text-black/80 font-mono tracking-wider">ZOOM: <span className="font-sans font-bold">{zoom}</span></div>
            </div>
          </div>

          {/* CONFIGURATION SIDEBAR - 4 Columns */}
          <div className="lg:col-span-4 flex flex-col justify-between bg-white border border-gray-200 p-8 md:p-10">
            <div className="space-y-8">
              <div>
                <span className="text-[10px] font-mono tracking-[0.3em] text-gray-400 uppercase font-bold flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-black" /> Opciones de Cuadro
                </span>
                <h3 className="text-2xl font-light tracking-tight mt-2 text-black">Personaliza tu Fragmento</h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Las coordenadas que fijes en el encuadre serán modeladas fielmente sobre la rejilla.
                </p>
              </div>

              {/* Size Selector */}
              <div id="tailor-size">
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-black mb-4">1. Tamaño del Cuadro</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFrameSize("10x10")}
                    className={`py-4 px-2 border text-center transition-all relative ${
                      frameSize === "10x10"
                        ? "border-black bg-white text-black font-bold"
                        : "border-gray-200 bg-white text-gray-400 hover:border-gray-400"
                    }`}
                  >
                    <div className="text-xs uppercase tracking-widest">10 x 10 cm</div>
                    <div className="text-[10px] font-mono tracking-widest mt-1 opacity-80">COP 89.000</div>
                    {frameSize === "10x10" && (
                      <Check className="absolute top-2.5 right-2.5 w-3 h-3 text-black" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setFrameSize("18x18")}
                    className={`py-4 px-2 border text-center transition-all relative ${
                      frameSize === "18x18"
                        ? "border-black bg-white text-black font-bold"
                        : "border-gray-200 bg-white text-gray-400 hover:border-gray-400"
                    }`}
                  >
                    <div className="text-xs uppercase tracking-widest">18 x 18 cm</div>
                    <div className="text-[10px] font-mono tracking-widest mt-1 opacity-80">COP 159.000</div>
                    {frameSize === "18x18" && (
                      <Check className="absolute top-2.5 right-2.5 w-3 h-3 text-black" />
                    )}
                  </button>
                </div>
              </div>

              {/* Wood Frame Color Selector */}
              <div id="tailor-color">
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-black mb-4">2. Color del Marco</label>
                <div className="flex space-x-6 items-center">
                  {(["Madera natural", "Negro", "Blanco"] as FrameColor[]).map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setFrameColor(col)}
                      className="flex flex-col items-center gap-2 group focus:outline-none"
                    >
                      <div className={`w-10 h-10 rounded-full border flex items-center justify-center p-1 transition-all ${
                        frameColor === col ? "border-black scale-105 shadow-sm" : "border-transparent opacity-60 hover:opacity-100"
                      }`}>
                        <div
                          className={`w-full h-full rounded-full border border-gray-200 ${
                            col === "Madera natural"
                              ? "bg-[#F4EBE2]"
                              : col === "Negro"
                              ? "bg-[#1A1A1A]"
                              : "bg-[#FFFFFF]"
                          }`}
                        />
                      </div>
                      <span className={`text-[10px] font-mono uppercase tracking-widest ${
                        frameColor === col ? "text-black font-bold" : "text-gray-400"
                      }`}>{col.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Informative Note */}
              <div className="bg-[#FAFAFA] p-4 border border-gray-100 rounded-none text-xs text-gray-500 leading-relaxed flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-black shrink-0 mt-0.5" />
                <div>
                  <span className="text-black font-semibold block mb-0.5">Modelado Fiel 3D</span>
                  Fabricado con bioplástico biodegradable PLA. Tras tu compra, nuestro equipo arquitectónico procesará las curvas de nivel e hidrografía exactas del área seleccionada.
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-100 pt-6 space-y-4">
              <div className="flex justify-between items-baseline text-black">
                <span className="text-[10px] font-mono tracking-widest text-[#9CA3AF] uppercase">Precio Total</span>
                <span className="text-2xl font-light text-black">COP {getPrice(frameSize).toLocaleString()}</span>
              </div>

              <button
                type="button"
                onClick={handleConfirmCustomFrame}
                className="w-full bg-black hover:bg-neutral-900 text-white font-bold py-5 text-xs tracking-[0.2em] uppercase transition-colors"
              >
                Añadir al Carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import React, { useState, useRef } from "react";
import { X, Upload, Loader2, Check, MapPin } from "lucide-react";
import { FrameColor, FrameSize, Product } from "../../types";
import { uploadToSupabaseStorage } from "../../lib/supabaseClient";
import { AdminButton } from "./AdminButtons";
import MediaLibrary from "./MediaLibrary";

interface ContentEditorProps {
  product: Product | null;
  onSave: (product: Product) => Promise<void>;
  onClose: () => void;
}

type Tab = "general" | "contenido" | "seo" | "configuracion" | "variantes" | "publicacion";

const TABS: { id: Tab; label: string }[] = [
  { id: "general",       label: "Info General" },
  { id: "contenido",     label: "Contenido" },
  { id: "seo",           label: "SEO" },
  { id: "configuracion", label: "Configuración" },
  { id: "variantes",     label: "Variantes" },
  { id: "publicacion",   label: "Publicación" },
];

const PRESET_CITIES = [
  { name: "Medellín",    lat: 6.2442,   lng: -75.5812, zoom: 13.5 },
  { name: "Bogotá",      lat: 4.6097,   lng: -74.0817, zoom: 13.5 },
  { name: "Cali",        lat: 3.4516,   lng: -76.5320, zoom: 13.5 },
  { name: "Cartagena",   lat: 10.3910,  lng: -75.4794, zoom: 13.5 },
  { name: "Bucaramanga", lat: 7.1193,   lng: -73.1227, zoom: 13.5 },
  { name: "Barcelona",   lat: 41.3851,  lng: 2.1734,   zoom: 14.1 },
  { name: "París",       lat: 48.8566,  lng: 2.3522,   zoom: 13.8 },
];

const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-terracotta transition-colors";
const labelClass = "text-[10px] font-mono uppercase tracking-widest text-white/50 block mb-1.5";
const FRAME_SIZES: FrameSize[] = ["10x10", "18x18"];
const FRAME_COLORS: FrameColor[] = ["Madera natural", "Negro", "Blanco"];

export default function ContentEditor({ product, onSave, onClose }: ContentEditorProps) {
  const isNew = !product?.id;
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [longDescription, setLongDescription] = useState("");
  const [image, setImage] = useState(product?.image ?? "");
  const [basePrice, setBasePrice] = useState(product?.basePrice ?? 159000);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(product?.originalPrice);
  const [discountPercent, setDiscountPercent] = useState<number | undefined>(product?.discountPercent);
  const [stock, setStock] = useState(product?.stock ?? 5);
  const [lat, setLat] = useState(product?.details?.lat ?? 6.2442);
  const [lng, setLng] = useState(product?.details?.lng ?? -75.5812);
  const [zoom, setZoom] = useState(product?.details?.zoom ?? 13.5);
  const [metaTitle, setMetaTitle] = useState(product?.name ?? "");
  const [metaDesc, setMetaDesc] = useState(product?.description ?? "");
  const [slug, setSlug] = useState(product?.id?.replace("frag_", "") ?? "");
  const [keywords, setKeywords] = useState("");
  const [category, setCategory] = useState("Ciudades");
  const [availableSizes, setAvailableSizes] = useState<FrameSize[]>(
    product?.details?.variants?.sizes?.length ? product.details.variants.sizes : FRAME_SIZES
  );
  const [availableColors, setAvailableColors] = useState<FrameColor[]>(
    product?.details?.variants?.colors?.length ? product.details.variants.colors : FRAME_COLORS
  );

  const handlePriceChange = (price: number) => {
    setBasePrice(price);
    if (originalPrice) setDiscountPercent(Math.round((1 - price / originalPrice) * 100));
  };
  const handleOriginalChange = (orig: number | undefined) => {
    setOriginalPrice(orig);
    if (orig && basePrice) setDiscountPercent(Math.round((1 - basePrice / orig) * 100));
    else setDiscountPercent(undefined);
  };
  const handleDiscountChange = (pct: number | undefined) => {
    setDiscountPercent(pct);
    if (pct && originalPrice) setBasePrice(Math.round(originalPrice * (1 - pct / 100)));
  };
  const toggleSize = (size: FrameSize) => {
    setAvailableSizes((current) =>
      current.includes(size) ? current.filter((item) => item !== size) : [...current, size]
    );
  };
  const toggleColor = (color: FrameColor) => {
    setAvailableColors((current) =>
      current.includes(color) ? current.filter((item) => item !== color) : [...current, color]
    );
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadToSupabaseStorage(file, "media");
      setImage(url);
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => { if (typeof reader.result === "string") setImage(reader.result); };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) { setActiveTab("general"); return; }
    if (availableSizes.length === 0 || availableColors.length === 0) {
      setActiveTab("variantes");
      setSaveError("Activa al menos un tamano y un color de marco.");
      return;
    }
    setSaving(true);
    setSaveError("");
    const saved: Product = {
      id: product?.id || ("frag_" + name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "_")),
      name,
      description: description || "Escultura tridimensional de alta resolución procesada con PLA bioplástico.",
      basePrice,
      originalPrice,
      discountPercent,
      image,
      stock,
      details: {
        lat: Number(lat),
        lng: Number(lng),
        zoom: Number(zoom),
        variants: {
          sizes: availableSizes,
          colors: availableColors,
        },
      },
    };
    try {
      await onSave(saved);
    } catch (error: any) {
      setSaveError(error?.message || "No se pudo guardar en Supabase.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-[#0f1923] rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="text-base font-semibold text-white">
              {isNew ? "Nuevo Contenido" : `Editando: ${product?.name}`}
            </h2>
            <p className="text-xs text-white/40 mt-0.5">Cuadro 3D · {category}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 pt-4 overflow-x-auto scrollbar-none border-b border-white/10 pb-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-xs font-mono uppercase tracking-wider rounded-t-xl whitespace-nowrap transition-all border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "text-brand-terracotta border-brand-terracotta bg-brand-terracotta/10"
                  : "text-white/40 border-transparent hover:text-white/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {saveError && (
            <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-200">
              {saveError}
            </div>
          )}

          {/* Info General */}
          {activeTab === "general" && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Nombre del Contenido *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Fragmento Medellín" className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Descripción Corta *</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción breve del producto..." rows={3} className={inputClass + " resize-none"} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Categoría</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                    <option>Ciudades</option>
                    <option>Colombia</option>
                    <option>Internacional</option>
                    <option>Personalizado</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Tipo</label>
                  <input type="text" value="Cuadro 3D" readOnly className={inputClass + " opacity-50 cursor-not-allowed"} />
                </div>
              </div>
            </div>
          )}

          {/* Contenido */}
          {activeTab === "contenido" && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Descripción Larga</label>
                <textarea
                  value={longDescription}
                  onChange={(e) => setLongDescription(e.target.value)}
                  placeholder="Descripción detallada del producto, proceso de fabricación, materiales..."
                  rows={10}
                  className={inputClass + " resize-none"}
                />
                <p className="text-[10px] text-white/30 mt-1">{longDescription.length} caracteres</p>
              </div>
            </div>
          )}

          {activeTab === "contenido" && (
            <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
              <label className={labelClass}>Imagen Principal</label>
              {image && (
                <img src={image} alt="preview" className="h-40 rounded-xl object-contain bg-white/5 border border-white/10 p-2" />
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  className="border-2 border-dashed border-white/15 hover:border-brand-terracotta rounded-2xl p-6 text-center cursor-pointer transition-colors flex flex-col items-center gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="w-6 h-6 text-brand-terracotta animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6 text-white/30" />
                  )}
                  <span className="text-xs text-white/40">{uploading ? "Subiendo..." : "Subir desde equipo"}</span>
                  <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
                </div>
                <button
                  type="button"
                  onClick={() => setShowMediaPicker(true)}
                  className="border-2 border-dashed border-white/15 hover:border-brand-terracotta rounded-2xl p-6 text-center cursor-pointer transition-colors flex flex-col items-center gap-2"
                >
                  <Upload className="w-6 h-6 text-white/30" />
                  <span className="text-xs text-white/40">Seleccionar de la biblioteca</span>
                </button>
              </div>
              <div>
                <label className={labelClass}>URL directa (opcional)</label>
                <input type="text" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." className={inputClass} />
              </div>

              {showMediaPicker && (
                <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="w-full max-w-4xl bg-[#0f1923] rounded-2xl border border-white/10 p-6 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-semibold text-white">Seleccionar imagen</h3>
                      <button onClick={() => setShowMediaPicker(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
                    </div>
                    <MediaLibrary
                      selectionMode
                      onSelect={(url) => { setImage(url); setShowMediaPicker(false); }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Legacy image picker */}
          {false && (
            <div className="space-y-4">
              <label className={labelClass}>Imagen Principal</label>
              {image && (
                <img src={image} alt="preview" className="h-40 rounded-xl object-contain bg-white/5 border border-white/10 p-2" />
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  className="border-2 border-dashed border-white/15 hover:border-brand-terracotta rounded-2xl p-6 text-center cursor-pointer transition-colors flex flex-col items-center gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="w-6 h-6 text-brand-terracotta animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6 text-white/30" />
                  )}
                  <span className="text-xs text-white/40">{uploading ? "Subiendo..." : "Subir desde equipo"}</span>
                  <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
                </div>
                <button
                  type="button"
                  onClick={() => setShowMediaPicker(true)}
                  className="border-2 border-dashed border-white/15 hover:border-brand-terracotta rounded-2xl p-6 text-center cursor-pointer transition-colors flex flex-col items-center gap-2"
                >
                  <span className="text-2xl">🖼️</span>
                  <span className="text-xs text-white/40">Seleccionar de la biblioteca</span>
                </button>
              </div>
              <div>
                <label className={labelClass}>URL directa (opcional)</label>
                <input type="text" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." className={inputClass} />
              </div>

              {showMediaPicker && (
                <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="w-full max-w-4xl bg-[#0f1923] rounded-2xl border border-white/10 p-6 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-semibold text-white">Seleccionar imagen</h3>
                      <button onClick={() => setShowMediaPicker(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
                    </div>
                    <MediaLibrary
                      selectionMode
                      onSelect={(url) => { setImage(url); setShowMediaPicker(false); }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SEO */}
          {activeTab === "seo" && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Meta Título</label>
                <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="Título para buscadores" className={inputClass} />
                <p className="text-[10px] text-white/30 mt-1">{metaTitle.length}/60 caracteres recomendados</p>
              </div>
              <div>
                <label className={labelClass}>Meta Descripción</label>
                <textarea value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} placeholder="Descripción para buscadores..." rows={3} className={inputClass + " resize-none"} />
                <p className="text-[10px] text-white/30 mt-1">{metaDesc.length}/160 caracteres recomendados</p>
              </div>
              <div>
                <label className={labelClass}>Slug (URL)</label>
                <input type="text" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))} placeholder="fragmento-medellin" className={inputClass + " font-mono"} />
              </div>
              <div>
                <label className={labelClass}>Keywords (separadas por coma)</label>
                <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="mapa 3d, ciudad, relieve, arte urbano" className={inputClass} />
              </div>
            </div>
          )}

          {/* Configuración */}
          {activeTab === "configuracion" && (
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Ciudad Preestablecida</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_CITIES.map((city) => (
                    <button
                      key={city.name}
                      type="button"
                      onClick={() => { setLat(city.lat); setLng(city.lng); setZoom(city.zoom); }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-brand-terracotta/20 border border-white/10 hover:border-brand-terracotta rounded-xl text-xs text-white/70 hover:text-white font-mono transition-all"
                    >
                      <MapPin className="w-3 h-3" /> {city.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Latitud</label>
                  <input type="number" step="0.000001" value={lat} onChange={(e) => setLat(Number(e.target.value))} className={inputClass + " font-mono"} />
                </div>
                <div>
                  <label className={labelClass}>Longitud</label>
                  <input type="number" step="0.000001" value={lng} onChange={(e) => setLng(Number(e.target.value))} className={inputClass + " font-mono"} />
                </div>
                <div>
                  <label className={labelClass}>Zoom</label>
                  <input type="number" step="0.1" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className={inputClass + " font-mono"} />
                </div>
              </div>
            </div>
          )}

          {/* Variantes */}
          {activeTab === "variantes" && (
            <div className="space-y-4">
              <div className="bg-white/5 rounded-2xl border border-white/10 p-4 space-y-3">
                <p className="text-xs text-white/50 font-mono uppercase tracking-widest">Tamaños disponibles</p>
                <div className="flex gap-3">
                  {FRAME_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${
                        availableSizes.includes(size)
                          ? "bg-emerald-500/10 border-emerald-500/20"
                          : "bg-white/5 border-white/10 opacity-50"
                      }`}
                    >
                      <Check className={`w-3.5 h-3.5 ${availableSizes.includes(size) ? "text-emerald-400" : "text-white/20"}`} />
                      <span className="text-sm text-white font-mono">{size} cm</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-white/5 rounded-2xl border border-white/10 p-4 space-y-3">
                <p className="text-xs text-white/50 font-mono uppercase tracking-widest">Colores de marco</p>
                <div className="flex flex-wrap gap-3">
                  {FRAME_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => toggleColor(color)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${
                        availableColors.includes(color)
                          ? "bg-emerald-500/10 border-emerald-500/20"
                          : "bg-white/5 border-white/10 opacity-50"
                      }`}
                    >
                      <Check className={`w-3.5 h-3.5 ${availableColors.includes(color) ? "text-emerald-400" : "text-white/20"}`} />
                      <span className="text-sm text-white">{color}</span>
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-white/30">Las variantes de tamaño y color son globales del sistema. Para precios por variante contacta al equipo técnico.</p>
            </div>
          )}

          {/* Publicación */}
          {activeTab === "publicacion" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Precio Final (COP) *</label>
                  <input type="number" value={basePrice} onChange={(e) => handlePriceChange(Number(e.target.value))} className={inputClass + " font-mono"} />
                </div>
                <div>
                  <label className={labelClass}>Precio Original (COP)</label>
                  <input type="number" value={originalPrice ?? ""} onChange={(e) => handleOriginalChange(e.target.value ? Number(e.target.value) : undefined)} placeholder="Sin descuento" className={inputClass + " font-mono"} />
                </div>
                <div>
                  <label className={labelClass}>Descuento (%)</label>
                  <input type="number" min="0" max="100" value={discountPercent ?? ""} onChange={(e) => handleDiscountChange(e.target.value ? Number(e.target.value) : undefined)} placeholder="Ej. 15" className={inputClass + " font-mono"} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Stock</label>
                <input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} className={inputClass + " font-mono max-w-xs"} />
                <p className="text-[10px] text-white/30 mt-1">Stock = 0 oculta el producto del catálogo</p>
              </div>
              <div className="pt-4 flex gap-3 border-t border-white/10">
                <AdminButton variant="cancel" onClick={onClose}>Cancelar</AdminButton>
                <AdminButton variant="save" onClick={handleSave} loading={saving} type="button">
                  {isNew ? "Crear Contenido" : "Guardar Cambios"}
                </AdminButton>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex justify-between items-center p-5 border-t border-white/10">
          <AdminButton variant="cancel" onClick={onClose}>Cancelar</AdminButton>
          <div className="flex gap-2">
            {activeTab !== "publicacion" && (
              <AdminButton variant="save" onClick={handleSave} loading={saving}>
                {isNew ? "Crear" : "Guardar"}
              </AdminButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

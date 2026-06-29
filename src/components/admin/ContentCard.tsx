import React, { useState } from "react";
import { ChevronDown, ChevronUp, Edit, Copy, Eye, EyeOff, Trash2, Globe, Package } from "lucide-react";
import { Product } from "../../types";

interface ContentCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDuplicate: (product: Product) => void;
  onPublish: (product: Product) => void;
  onHide: (product: Product) => void;
  onDelete: (id: string) => void;
}

export default function ContentCard({
  product, onEdit, onDuplicate, onPublish, onHide, onDelete,
}: ContentCardProps) {
  const [expanded, setExpanded] = useState(false);

  const isPublished = product.stock > 0;
  const variantCount = (product.details?.variants?.sizes?.length || 2) * (product.details?.variants?.colors?.length || 3);

  return (
    <div className={`bg-[#162231] rounded-2xl border transition-all shadow-lg overflow-hidden ${
      expanded ? "border-brand-terracotta/40" : "border-white/10 hover:border-white/20"
    }`}>
      {/* Header Row */}
      <div className="flex items-center gap-3 p-4">
        {/* Thumbnail */}
        <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 bg-white/5">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20">
              <Package className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-semibold text-white truncate">{product.name}</h4>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/50 uppercase">
              Cuadro 3D
            </span>
            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
              isPublished
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-amber-500/15 text-amber-400"
            }`}>
              {isPublished ? "Publicado" : "Oculto"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono text-white/40">
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3" />
              {product.details?.lat?.toFixed(3)}, {product.details?.lng?.toFixed(3)}
            </span>
            <span>·</span>
            <span>COP {product.basePrice?.toLocaleString()}</span>
            <span>·</span>
            <span>{variantCount} variantes</span>
            <span>·</span>
            <span>Stock: {product.stock}</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <ActionIcon icon={Edit} title="Editar" onClick={() => onEdit(product)} color="text-white/60 hover:text-white" />
          <ActionIcon icon={Copy} title="Duplicar" onClick={() => onDuplicate(product)} color="text-white/60 hover:text-white" />
          <ActionIcon
            icon={isPublished ? EyeOff : Eye}
            title={isPublished ? "Ocultar" : "Publicar"}
            onClick={() => isPublished ? onHide(product) : onPublish(product)}
            color={isPublished ? "text-amber-400 hover:text-amber-300" : "text-emerald-400 hover:text-emerald-300"}
          />
          <ActionIcon
            icon={Trash2}
            title="Eliminar"
            onClick={() => { if (confirm(`¿Eliminar "${product.name}"?`)) onDelete(product.id); }}
            color="text-red-400 hover:text-red-300"
          />
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors ml-1"
            title={expanded ? "Contraer" : "Expandir"}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t border-white/10 p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <img
              src={product.image}
              alt={product.name}
              className="w-full rounded-xl object-cover aspect-video bg-white/5 border border-white/10"
            />
          </div>
          <div className="md:col-span-2 space-y-3 text-sm">
            <p className="text-white/60 text-xs leading-relaxed">{product.description}</p>
            <div className="grid grid-cols-2 gap-3">
              <InfoRow label="Precio final" value={`COP ${product.basePrice?.toLocaleString()}`} />
              {product.originalPrice && (
                <InfoRow label="Precio original" value={`COP ${product.originalPrice.toLocaleString()}`} />
              )}
              {product.discountPercent && (
                <InfoRow label="Descuento" value={`${product.discountPercent}%`} />
              )}
              <InfoRow label="Stock" value={String(product.stock)} />
              <InfoRow label="Latitud" value={String(product.details?.lat)} />
              <InfoRow label="Longitud" value={String(product.details?.lng)} />
              <InfoRow label="Zoom" value={String(product.details?.zoom)} />
              <InfoRow label="ID" value={product.id} mono />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionIcon({
  icon: Icon, title, onClick, color,
}: {
  icon: React.ElementType;
  title: string;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${color}`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="space-y-0.5">
      <span className="text-[9px] font-mono uppercase tracking-widest text-white/30">{label}</span>
      <p className={`text-xs text-white/80 ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

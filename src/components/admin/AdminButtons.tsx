import React from "react";
import {
  Save, CheckCircle, X, Eye, Globe, Plus, Trash2, Copy,
  Upload, Download, EyeOff, Loader2,
} from "lucide-react";

type ButtonVariant =
  | "save" | "saveAll" | "publish" | "unpublish" | "delete"
  | "preview" | "viewSite" | "new" | "cancel" | "duplicate"
  | "import" | "export";

interface AdminButtonProps {
  variant: ButtonVariant;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  size?: "sm" | "md";
}

const CONFIG: Record<ButtonVariant, { icon: React.ElementType; label: string; base: string }> = {
  save:      { icon: Save,        label: "Guardar",       base: "bg-brand-terracotta hover:bg-[#8a5c3f] text-white" },
  saveAll:   { icon: Save,        label: "Guardar Todo",  base: "bg-brand-terracotta hover:bg-[#8a5c3f] text-white" },
  publish:   { icon: CheckCircle, label: "Publicar",      base: "bg-emerald-600 hover:bg-emerald-700 text-white" },
  unpublish: { icon: EyeOff,      label: "Despublicar",   base: "bg-amber-600 hover:bg-amber-700 text-white" },
  delete:    { icon: Trash2,      label: "Eliminar",      base: "bg-red-600 hover:bg-red-700 text-white" },
  preview:   { icon: Eye,         label: "Vista Previa",  base: "bg-white/10 hover:bg-white/20 text-white border border-white/20" },
  viewSite:  { icon: Globe,       label: "Ver Sitio",     base: "bg-white/10 hover:bg-white/20 text-white border border-white/20" },
  new:       { icon: Plus,        label: "Nuevo",         base: "bg-white/10 hover:bg-white/20 text-white border border-white/20" },
  cancel:    { icon: X,           label: "Cancelar",      base: "bg-white/5 hover:bg-white/10 text-white/70 border border-white/10" },
  duplicate: { icon: Copy,        label: "Duplicar",      base: "bg-white/10 hover:bg-white/20 text-white border border-white/20" },
  import:    { icon: Upload,      label: "Importar",      base: "bg-white/10 hover:bg-white/20 text-white border border-white/20" },
  export:    { icon: Download,    label: "Exportar",      base: "bg-white/10 hover:bg-white/20 text-white border border-white/20" },
};

export function AdminButton({
  variant, onClick, disabled, loading, children, className = "", type = "button", size = "md",
}: AdminButtonProps) {
  const { icon: Icon, label, base } = CONFIG[variant];
  const padding = size === "sm" ? "px-3 py-1.5 text-[10px]" : "px-4 py-2.5 text-[11px]";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-2 rounded-xl font-mono uppercase tracking-widest font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${padding} ${base} ${className}`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Icon className="w-3.5 h-3.5" />
      )}
      {children ?? label}
    </button>
  );
}

export function AdminToggle({
  active, onToggle, labelOn, labelOff,
}: {
  active: boolean;
  onToggle: () => void;
  labelOn?: string;
  labelOff?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className={`text-xs font-mono uppercase tracking-wider ${active ? "text-brand-terracotta" : "text-white/40"}`}>
        {active ? (labelOn ?? "Activo") : (labelOff ?? "Inactivo")}
      </span>
      <button
        type="button"
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
          active ? "bg-brand-terracotta" : "bg-white/20"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
            active ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

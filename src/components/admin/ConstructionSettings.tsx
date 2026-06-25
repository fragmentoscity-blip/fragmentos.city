import React, { useState } from "react";
import { X, Instagram, Facebook, MessageCircle, Calendar, Mail, Image as ImageIcon } from "lucide-react";
import { SiteSettings } from "../../types";
import { AdminButton, AdminToggle } from "./AdminButtons";
import { uploadToSupabaseStorage } from "../../lib/supabaseClient";

interface ConstructionSettingsProps {
  settings: SiteSettings;
  onChange: (settings: SiteSettings) => void;
  onSave: () => void;
  saving: boolean;
}

export default function ConstructionSettings({ settings, onChange, onSave, saving }: ConstructionSettingsProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [uploadingField, setUploadingField] = useState<"logo" | "bg" | null>(null);

  const update = (key: keyof SiteSettings, value: any) => onChange({ ...settings, [key]: value });
  const updateSocial = (key: string, value: string) =>
    onChange({ ...settings, construction_socials: { ...settings.construction_socials, [key]: value } });

  const handleImageUpload = async (field: "logo" | "bg", file: File) => {
    setUploadingField(field);
    try {
      const url = await uploadToSupabaseStorage(file, "media");
      if (field === "logo") update("construction_logo", url);
      else update("construction_bg_image", url);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploadingField(null);
    }
  };

  const fieldClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-terracotta transition-colors";
  const labelClass = "text-[10px] font-mono uppercase tracking-widest text-white/50 block mb-1.5";

  return (
    <div className="space-y-6">
      {/* Enable toggle */}
      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
        <div>
          <p className="text-sm text-white font-medium">Modo Construcción</p>
          <p className="text-xs text-white/50 mt-0.5">Los visitantes verán la página de mantenimiento</p>
        </div>
        <AdminToggle
          active={settings.construction_mode}
          onToggle={() => update("construction_mode", !settings.construction_mode)}
          labelOn="ACTIVO"
          labelOff="INACTIVO"
        />
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Título de la página</label>
          <input
            type="text"
            value={settings.construction_title}
            onChange={(e) => update("construction_title", e.target.value)}
            placeholder="Próximamente"
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Subtítulo</label>
          <input
            type="text"
            value={settings.construction_subtitle}
            onChange={(e) => update("construction_subtitle", e.target.value)}
            placeholder="Algo extraordinario está en camino"
            className={fieldClass}
          />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Mensaje principal</label>
          <textarea
            value={settings.construction_message}
            onChange={(e) => update("construction_message", e.target.value)}
            placeholder="Estamos trabajando para ofrecerte la mejor experiencia..."
            rows={3}
            className={fieldClass + " resize-none"}
          />
        </div>
        <div>
          <label className={labelClass}><Calendar className="inline w-3 h-3 mr-1" />Fecha estimada de apertura</label>
          <input
            type="date"
            value={settings.construction_open_date}
            onChange={(e) => update("construction_open_date", e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}><Mail className="inline w-3 h-3 mr-1" />Correo de contacto</label>
          <input
            type="email"
            value={settings.construction_email}
            onChange={(e) => update("construction_email", e.target.value)}
            placeholder="hola@fragmentoscity.com"
            className={fieldClass}
          />
        </div>
      </div>

      {/* Image uploads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ImageUploadField
          label="Logo de la empresa"
          value={settings.construction_logo}
          uploading={uploadingField === "logo"}
          onUpload={(f) => handleImageUpload("logo", f)}
          onUrlChange={(url) => update("construction_logo", url)}
        />
        <ImageUploadField
          label="Imagen de fondo (opcional)"
          value={settings.construction_bg_image}
          uploading={uploadingField === "bg"}
          onUpload={(f) => handleImageUpload("bg", f)}
          onUrlChange={(url) => update("construction_bg_image", url)}
        />
      </div>

      {/* Social networks */}
      <div className="space-y-3">
        <label className={labelClass}>Redes Sociales</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={settings.construction_socials.instagram || ""}
              onChange={(e) => updateSocial("instagram", e.target.value)}
              placeholder="@usuario"
              className={fieldClass + " pl-9"}
            />
          </div>
          <div className="relative">
            <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={settings.construction_socials.facebook || ""}
              onChange={(e) => updateSocial("facebook", e.target.value)}
              placeholder="URL de página"
              className={fieldClass + " pl-9"}
            />
          </div>
          <div className="relative">
            <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={settings.construction_socials.whatsapp || ""}
              onChange={(e) => updateSocial("whatsapp", e.target.value)}
              placeholder="+57 300 000 0000"
              className={fieldClass + " pl-9"}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <AdminButton variant="preview" onClick={() => setPreviewOpen(true)}>Vista Previa</AdminButton>
        <AdminButton variant="save" onClick={onSave} loading={saving}>Guardar Cambios</AdminButton>
      </div>

      {/* Preview Modal */}
      {previewOpen && (
        <ConstructionPreview settings={settings} onClose={() => setPreviewOpen(false)} />
      )}
    </div>
  );
}

function ImageUploadField({
  label, value, uploading, onUpload, onUrlChange,
}: {
  label: string;
  value: string;
  uploading: boolean;
  onUpload: (f: File) => void;
  onUrlChange: (url: string) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">
        <ImageIcon className="inline w-3 h-3 mr-1" />{label}
      </label>
      {value && (
        <img src={value} alt={label} className="h-16 rounded-xl object-contain bg-white/5 border border-white/10 p-1" />
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full py-2 text-xs font-mono text-white/60 bg-white/5 hover:bg-white/10 border border-dashed border-white/20 rounded-xl transition-colors disabled:opacity-50"
      >
        {uploading ? "Subiendo..." : "Subir imagen"}
      </button>
      <input
        type="text"
        value={value}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="O pega URL directa"
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-brand-terracotta"
      />
      <input
        type="file"
        ref={inputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }}
      />
    </div>
  );
}

function ConstructionPreview({ settings, onClose }: { settings: SiteSettings; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-2xl overflow-hidden border border-white/10">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 bg-black/60 rounded-full text-white hover:bg-black"
        >
          <X className="w-4 h-4" />
        </button>
        <div
          className="min-h-96 flex flex-col items-center justify-center p-12 text-center"
          style={{
            backgroundImage: settings.construction_bg_image
              ? `linear-gradient(rgba(15,25,35,0.8),rgba(15,25,35,0.9)), url(${settings.construction_bg_image})`
              : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundColor: "#0f1923",
          }}
        >
          {settings.construction_logo && (
            <img src={settings.construction_logo} alt="Logo" className="h-16 mb-6 object-contain" />
          )}
          <h1 className="text-4xl font-light text-white tracking-tight mb-3">
            {settings.construction_title || "Próximamente"}
          </h1>
          {settings.construction_subtitle && (
            <p className="text-lg text-white/70 mb-4">{settings.construction_subtitle}</p>
          )}
          {settings.construction_message && (
            <p className="text-sm text-white/50 max-w-md mb-6">{settings.construction_message}</p>
          )}
          {settings.construction_open_date && (
            <div className="flex items-center gap-2 text-brand-terracotta text-sm font-mono mb-6">
              <Calendar className="w-4 h-4" />
              Apertura: {new Date(settings.construction_open_date).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          )}
          {settings.construction_email && (
            <a
              href={`mailto:${settings.construction_email}`}
              className="px-6 py-3 bg-brand-terracotta text-white rounded-xl text-sm font-mono hover:bg-[#8a5c3f] transition-colors"
            >
              Contactar
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

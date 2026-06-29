import React, { useState, useEffect } from "react";
import { Globe, Power, ChevronDown, ChevronUp, Loader2, CheckCircle } from "lucide-react";
import { SiteSettings, DEFAULT_SITE_SETTINGS } from "../../types";
import { getSiteSettings, saveSiteSettings } from "../../lib/supabaseClient";
import { AdminButton, AdminToggle } from "./AdminButtons";
import ConstructionSettings from "./ConstructionSettings";

interface SitePanelProps {
  constructionMode: boolean;
  onSiteSettingsSaved: (settings: SiteSettings) => void;
  onNavigateToStore: () => void;
}

export default function SitePanel({ constructionMode, onSiteSettingsSaved, onNavigateToStore }: SitePanelProps) {
  const [settings, setSettings] = useState<SiteSettings>({
    ...DEFAULT_SITE_SETTINGS,
    construction_mode: constructionMode,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [constructionOpen, setConstructionOpen] = useState(false);

  useEffect(() => {
    getSiteSettings().then((data) => {
      if (data) {
        setSettings({
          site_active: data.site_active ?? true,
          construction_mode: data.construction_mode ?? constructionMode,
          construction_title: data.construction_title ?? DEFAULT_SITE_SETTINGS.construction_title,
          construction_subtitle: data.construction_subtitle ?? DEFAULT_SITE_SETTINGS.construction_subtitle,
          construction_message: data.construction_message ?? DEFAULT_SITE_SETTINGS.construction_message,
          construction_open_date: data.construction_open_date ?? "",
          construction_logo: data.construction_logo ?? "",
          construction_bg_image: data.construction_bg_image ?? "",
          construction_email: data.construction_email ?? "",
          construction_socials: data.construction_socials ?? {},
        });
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const savedToDatabase = await saveSiteSettings(settings);
    if (savedToDatabase) {
      onSiteSettingsSaved(settings);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSettingsChange = (newSettings: SiteSettings) => {
    setSettings(newSettings);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Site Status Card */}
      <div className="bg-[#162231] rounded-2xl border border-white/10 p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-5">
          <Power className="w-5 h-5 text-brand-terracotta" />
          <h3 className="text-base font-semibold text-white">Estado del Sitio</h3>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <p className="text-sm text-white/70">
              Controla si el sitio está accesible al público o en mantenimiento.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`w-2 h-2 rounded-full ${settings.site_active ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
              <span className="text-xs font-mono text-white/60">
                {settings.site_active ? "Sitio en línea y accesible" : "Sitio desactivado"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <AdminToggle
              active={settings.site_active}
              onToggle={() => setSettings((s) => ({ ...s, site_active: !s.site_active }))}
              labelOn="ACTIVO"
              labelOff="INACTIVO"
            />
            <AdminButton variant="viewSite" onClick={onNavigateToStore}>Ver Sitio</AdminButton>
            <AdminButton variant="save" onClick={handleSave} loading={saving}>
              {saved ? (
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Guardado
                </span>
              ) : "Guardar Cambios"}
            </AdminButton>
          </div>
        </div>
      </div>

      {/* Construction Mode Card */}
      <div className="bg-[#162231] rounded-2xl border border-white/10 shadow-xl overflow-hidden">
        <button
          type="button"
          className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
          onClick={() => setConstructionOpen((o) => !o)}
        >
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-brand-terracotta" />
            <div>
              <h3 className="text-base font-semibold text-white">Modo Construcción</h3>
              <p className="text-xs text-white/50 mt-0.5">
                {settings.construction_mode
                  ? "Activo — visitantes ven página de mantenimiento"
                  : "Inactivo — sitio público visible"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded-lg ${
              settings.construction_mode
                ? "bg-brand-terracotta/20 text-brand-terracotta"
                : "bg-white/5 text-white/40"
            }`}>
              {settings.construction_mode ? "ACTIVO" : "INACTIVO"}
            </span>
            {constructionOpen ? (
              <ChevronUp className="w-4 h-4 text-white/40" />
            ) : (
              <ChevronDown className="w-4 h-4 text-white/40" />
            )}
          </div>
        </button>

        {constructionOpen && (
          <div className="px-6 pb-6 border-t border-white/10 pt-6">
            <ConstructionSettings
              settings={settings}
              onChange={handleSettingsChange}
              onSave={handleSave}
              saving={saving}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { Check, Loader2, Mail, MapPin, Phone, User, X } from "lucide-react";
import { getUserProfile, updateUserProfileField } from "../lib/supabaseClient";
import { UserProfile } from "../types";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}

type EditableProfileField = "full_name" | "phone" | "document_id" | "department" | "city" | "address";

const PROFILE_FIELDS: { key: EditableProfileField; label: string; placeholder: string }[] = [
  { key: "full_name", label: "Nombre completo", placeholder: "Ej. Daniel Jaramillo" },
  { key: "phone", label: "Celular", placeholder: "Ej. 3001234567" },
  { key: "document_id", label: "Documento", placeholder: "Ej. CC 1012345678" },
  { key: "department", label: "Departamento", placeholder: "Ej. Cundinamarca" },
  { key: "city", label: "Ciudad", placeholder: "Ej. Bogotá D.C." },
  { key: "address", label: "Dirección", placeholder: "Ej. Calle 100 # 15 - 32" },
];

const EMPTY_PROFILE: UserProfile = {
  username: "",
  email: "",
  full_name: "",
  phone: "",
  document_id: "",
  department: "",
  city: "",
  address: "",
};

export default function UserProfileModal({ isOpen, onClose, username }: UserProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE);
  const [isLoading, setIsLoading] = useState(false);
  const [savingField, setSavingField] = useState<string>("");
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !username) return;

    let mounted = true;
    setIsLoading(true);
    setError("");

    getUserProfile(username).then((data) => {
      if (!mounted) return;
      setProfile(data || { ...EMPTY_PROFILE, username, email: username });
      setIsLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [isOpen, username]);

  if (!isOpen) return null;

  const updateLocalField = (field: EditableProfileField, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setMessages((prev) => ({ ...prev, [field]: "" }));
  };

  const saveField = async (field: EditableProfileField) => {
    setSavingField(field);
    setError("");

    const res = await updateUserProfileField(username, field, profile[field] || "");
    setSavingField("");

    if (!res.success) {
      setError(`No se pudo guardar ${field}: ${res.message}`);
      return;
    }

    setMessages((prev) => ({ ...prev, [field]: "Guardado" }));
  };

  return (
    <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full max-w-2xl shadow-2xl border border-gray-100 rounded-none text-black animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-start justify-between z-10">
          <div>
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-gray-400 font-bold flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> Perfil
            </span>
            <h2 className="text-2xl font-light tracking-tight mt-1">Datos de usuario</h2>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-black transition-colors focus:outline-none">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div className="border border-gray-150 bg-[#FAFAFA] p-4 flex items-center gap-3">
            <Mail className="w-4 h-4 text-gray-500" />
            <div>
              <span className="text-[9px] font-mono uppercase tracking-widest text-gray-400 block">Correo confirmado</span>
              <span className="text-sm font-semibold text-black">{profile.email || username}</span>
            </div>
          </div>

          {error && (
            <div className="border border-red-200 bg-red-50 text-red-700 p-3 text-xs font-mono">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="py-12 flex items-center justify-center text-gray-400 gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs font-mono uppercase tracking-widest">Cargando perfil</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {PROFILE_FIELDS.map((field) => (
                <div key={field.key} className={field.key === "address" ? "md:col-span-2 space-y-2" : "space-y-2"}>
                  <label className="text-[10px] font-mono tracking-[0.2em] font-bold uppercase text-black">
                    {field.label}
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      {field.key === "phone" ? (
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      ) : field.key === "city" || field.key === "department" || field.key === "address" ? (
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      ) : (
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      )}
                      <input
                        type="text"
                        value={profile[field.key] || ""}
                        onChange={(e) => updateLocalField(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full bg-[#FAFAFA] border border-gray-200 p-3 pl-10 text-sm focus:border-black outline-none transition-colors"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => saveField(field.key)}
                      disabled={savingField === field.key}
                      className="w-12 h-12 shrink-0 bg-black text-white hover:bg-neutral-900 disabled:bg-neutral-400 flex items-center justify-center transition-colors"
                      title={`Confirmar ${field.label}`}
                    >
                      {savingField === field.key ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </button>
                  </div>
                  {messages[field.key] && (
                    <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-600">{messages[field.key]}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

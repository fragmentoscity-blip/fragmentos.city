/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Mail, Lock, X, LogIn, UserPlus, Loader2, KeyRound } from "lucide-react";
import {
  authenticateUserWithSupabase,
  completeRegistrationWithPassword,
  requestRegistrationCode,
  verifyRegistrationCode,
} from "../lib/supabaseClient";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, email: string, isAdmin: boolean) => void;
}

type RegisterStep = "email" | "code" | "password";

export default function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [registerStep, setRegisterStep] = useState<RegisterStep>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const resetMessages = () => {
    setError("");
    setSuccessMsg("");
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setCode("");
    setRegisterStep("email");
    resetMessages();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError("Ingresa tu correo y contraseña.");
      return;
    }

    setIsLoading(true);
    try {
      const dbUser = await authenticateUserWithSupabase(cleanEmail, cleanPassword);

      if (dbUser) {
        onLogin(dbUser.username, dbUser.email, dbUser.isAdmin);
        resetForm();
        onClose();
      } else {
        setError("Correo o contraseña incorrectos.");
      }
    } catch (err) {
      console.error(err);
      setError("No fue posible conectar con Supabase.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setIsLoading(true);

    const res = await requestRegistrationCode(email);
    setIsLoading(false);

    if (!res.success) {
      setError(res.message);
      return;
    }

    setRegisterStep("code");
    setSuccessMsg(res.devCode ? `${res.message} Código local: ${res.devCode}` : res.message);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (code.replace(/\D/g, "").length !== 6) {
      setError("Ingresa el código de 6 dígitos.");
      return;
    }

    setIsLoading(true);
    const res = await verifyRegistrationCode(email, code);
    setIsLoading(false);

    if (!res.success) {
      setError(res.message);
      return;
    }

    setRegisterStep("password");
    setSuccessMsg(res.message);
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (password.trim().length < 8) {
      setError("La contraseña debe tener mínimo 8 caracteres.");
      return;
    }

    setIsLoading(true);
    const res = await completeRegistrationWithPassword(email, password);
    setIsLoading(false);

    if (!res.success) {
      setError(res.message);
      return;
    }

    setMode("login");
    setRegisterStep("email");
    setPassword("");
    setCode("");
    setSuccessMsg("Cuenta creada. Ya puedes iniciar sesión.");
  };

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    resetForm();
  };

  const title = mode === "login" ? "Acceder" : "Crear Cuenta";
  const subtitle = mode === "login" ? "Ingresa con tu correo" : "Verificación por correo";

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full max-w-sm p-8 shadow-2xl border border-gray-100 rounded-none text-black animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-black transition-colors focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-light tracking-tight mb-1 text-center">{title}</h2>
        <p className="text-xs text-gray-500 font-mono tracking-wider text-center uppercase mb-6">{subtitle}</p>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 p-3 mb-5 text-xs text-center font-mono">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 p-3 mb-5 text-xs text-center font-mono">
            {successMsg}
          </div>
        )}

        {mode === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <EmailField value={email} onChange={setEmail} disabled={isLoading} autoFocus />
            <PasswordField value={password} onChange={setPassword} disabled={isLoading} label="Contraseña" />

            <SubmitButton isLoading={isLoading} icon={<LogIn className="w-3.5 h-3.5" />} label="Iniciar Sesión" />
          </form>
        )}

        {mode === "register" && registerStep === "email" && (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <EmailField value={email} onChange={setEmail} disabled={isLoading} autoFocus />
            <SubmitButton isLoading={isLoading} icon={<Mail className="w-3.5 h-3.5" />} label="Enviar Código" />
          </form>
        )}

        {mode === "register" && registerStep === "code" && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono tracking-[0.2em] font-bold uppercase text-black">
                Código de 6 dígitos
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  disabled={isLoading}
                  className="w-full bg-[#FAFAFA] border border-gray-200 p-3 pl-10 text-sm tracking-[0.35em] focus:border-black outline-none transition-colors"
                  autoFocus
                />
              </div>
            </div>
            <SubmitButton isLoading={isLoading} icon={<KeyRound className="w-3.5 h-3.5" />} label="Confirmar Correo" />
          </form>
        )}

        {mode === "register" && registerStep === "password" && (
          <form onSubmit={handleCompleteRegistration} className="space-y-4">
            <PasswordField value={password} onChange={setPassword} disabled={isLoading} label="Crear Contraseña" autoFocus />
            <SubmitButton isLoading={isLoading} icon={<UserPlus className="w-3.5 h-3.5" />} label="Crear Usuario" />
          </form>
        )}

        <div className="mt-6 pt-5 border-t border-gray-150 text-center">
          <button
            type="button"
            disabled={isLoading}
            onClick={switchMode}
            className="text-[11px] font-mono uppercase tracking-wider text-gray-500 hover:text-black transition-colors disabled:opacity-50"
          >
            {mode === "register" ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Crear usuario"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EmailField({
  value,
  onChange,
  disabled,
  autoFocus = false,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  autoFocus?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-mono tracking-[0.2em] font-bold uppercase text-black">Correo</label>
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="correo@dominio.com"
          disabled={disabled}
          className="w-full bg-[#FAFAFA] border border-gray-200 p-3 pl-10 text-sm focus:border-black outline-none transition-colors"
          autoFocus={autoFocus}
        />
      </div>
    </div>
  );
}

function PasswordField({
  value,
  onChange,
  disabled,
  label,
  autoFocus = false,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  label: string;
  autoFocus?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-mono tracking-[0.2em] font-bold uppercase text-black">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Mínimo 8 caracteres"
          disabled={disabled}
          className="w-full bg-[#FAFAFA] border border-gray-200 p-3 pl-10 text-sm focus:border-black outline-none transition-colors"
          autoFocus={autoFocus}
        />
      </div>
    </div>
  );
}

function SubmitButton({ isLoading, icon, label }: { isLoading: boolean; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="w-full bg-black hover:bg-neutral-900 text-white p-4 text-[10px] font-mono tracking-[0.2em] uppercase font-bold flex items-center justify-center gap-2 transition-colors mt-2 disabled:opacity-50"
    >
      {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : icon}
      {label}
    </button>
  );
}

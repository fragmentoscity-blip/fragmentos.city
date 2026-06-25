import React, { useState, useEffect, useRef } from "react";
import { Search, Upload, Trash2, X, Image as ImageIcon, Loader2, RefreshCw, Check } from "lucide-react";
import { uploadToSupabaseStorage, listMediaFiles, deleteMediaFile } from "../../lib/supabaseClient";
import { MediaFile } from "../../types";
import { AdminButton } from "./AdminButtons";

interface MediaLibraryProps {
  onSelect?: (url: string) => void;
  selectionMode?: boolean;
}

export default function MediaLibrary({ onSelect, selectionMode = false }: MediaLibraryProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<MediaFile | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFiles = async () => {
    setLoading(true);
    const data = await listMediaFiles();
    setFiles(data);
    setLoading(false);
  };

  useEffect(() => { loadFiles(); }, []);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadToSupabaseStorage(file, "media");
      await loadFiles();
      if (selectionMode && onSelect) {
        onSelect(url);
        setSelected(url);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDelete = async (file: MediaFile) => {
    if (!confirm(`¿Eliminar "${file.name}"?`)) return;
    setDeleting(file.name);
    await deleteMediaFile(file.name);
    await loadFiles();
    setDeleting(null);
    if (preview?.name === file.name) setPreview(null);
  };

  const filtered = files.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Buscar archivos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-terracotta"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadFiles}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors border border-white/10"
            title="Recargar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <AdminButton
            variant="new"
            onClick={() => fileInputRef.current?.click()}
            loading={uploading}
          >
            {uploading ? "Subiendo..." : "Subir Archivo"}
          </AdminButton>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          dragActive
            ? "border-brand-terracotta bg-brand-terracotta/10"
            : "border-white/15 hover:border-white/30 bg-white/5"
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3 text-white/60">
            <Loader2 className="w-8 h-8 animate-spin text-brand-terracotta" />
            <span className="text-sm">Subiendo a Supabase Storage...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-white/40">
            <Upload className="w-8 h-8" />
            <div className="text-sm">
              <span className="text-white underline">Haz clic para subir</span> o arrastra archivos aquí
            </div>
            <span className="text-xs font-mono">PNG, JPG, SVG, WEBP — Máx 50MB</span>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </div>

      {/* File grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-white/40">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-white/30 gap-3">
          <ImageIcon className="w-10 h-10" />
          <p className="text-sm">{search ? "Sin resultados" : "No hay archivos subidos aún"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((file) => (
            <div
              key={file.name}
              className={`group relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                selected === file.url
                  ? "border-brand-terracotta"
                  : "border-white/10 hover:border-white/30"
              }`}
              onClick={() => {
                if (selectionMode && onSelect) {
                  onSelect(file.url);
                  setSelected(file.url);
                } else {
                  setPreview(file);
                }
              }}
            >
              <div className="aspect-square bg-white/5">
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {selected === file.url && selectionMode && (
                <div className="absolute inset-0 bg-brand-terracotta/20 flex items-center justify-center">
                  <Check className="w-8 h-8 text-brand-terracotta" />
                </div>
              )}

              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(file); }}
                  disabled={deleting === file.name}
                  className="self-end p-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors disabled:opacity-50"
                >
                  {deleting === file.name ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
                <p className="text-[9px] font-mono text-white/80 truncate">{file.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {preview && !selectionMode && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-[#162231] rounded-2xl overflow-hidden border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <span className="text-sm text-white font-mono truncate">{preview.name}</span>
              <button onClick={() => setPreview(null)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <img src={preview.url} alt={preview.name} className="w-full max-h-96 object-contain bg-black/20" />
            <div className="p-4 flex gap-3">
              <button
                onClick={() => { navigator.clipboard.writeText(preview.url); }}
                className="flex-1 py-2 text-xs font-mono text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
              >
                Copiar URL
              </button>
              <button
                onClick={() => handleDelete(preview)}
                className="py-2 px-4 text-xs font-mono text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 rounded-xl border border-red-500/20 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

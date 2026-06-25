import React, { useState, useMemo, Fragment } from "react";
import { Search, SlidersHorizontal, ArrowUpDown, Package } from "lucide-react";
import { Product } from "../../types";
import { AdminButton } from "./AdminButtons";
import ContentCard from "./ContentCard";
import ContentEditor from "./ContentEditor";

interface ContentManagerProps {
  products: Product[];
  onAddProduct: (p: Product) => void;
  onEditProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
}

type FilterStatus = "all" | "published" | "hidden";
type SortBy = "name" | "price" | "stock";

export default function ContentManager({
  products, onAddProduct, onEditProduct, onDeleteProduct,
}: ContentManagerProps) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [editingProduct, setEditingProduct] = useState<Product | null | "new">(null);

  const filtered = useMemo<Product[]>(() => {
    let list: Product[] = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }

    if (filterStatus === "published") list = list.filter((p) => p.stock > 0);
    if (filterStatus === "hidden") list = list.filter((p) => p.stock === 0);

    list.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "price") return a.basePrice - b.basePrice;
      if (sortBy === "stock") return b.stock - a.stock;
      return 0;
    });

    return list;
  }, [products, search, filterStatus, sortBy]);

  const handleSave = (product: Product) => {
    const exists = products.find((p) => p.id === product.id);
    if (exists) onEditProduct(product);
    else onAddProduct(product);
    setEditingProduct(null);
  };

  const handleDuplicate = (product: Product) => {
    const copy: Product = {
      ...product,
      id: product.id + "_copy_" + Date.now(),
      name: product.name + " (copia)",
      stock: 0,
    };
    onAddProduct(copy);
  };

  const handlePublish = (product: Product) => onEditProduct({ ...product, stock: Math.max(product.stock, 1) });
  const handleHide   = (product: Product) => onEditProduct({ ...product, stock: 0 });

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-3 max-w-2xl">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Buscar contenido..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-terracotta transition-colors"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white/70 focus:outline-none focus:border-brand-terracotta transition-colors appearance-none cursor-pointer"
            >
              <option value="all">Todos</option>
              <option value="published">Publicados</option>
              <option value="hidden">Ocultos</option>
            </select>
          </div>

          {/* Sort */}
          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white/70 focus:outline-none focus:border-brand-terracotta transition-colors appearance-none cursor-pointer"
            >
              <option value="name">Nombre</option>
              <option value="price">Precio</option>
              <option value="stock">Stock</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <AdminButton variant="new" onClick={() => setEditingProduct("new")}>Nuevo Contenido</AdminButton>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex gap-4 text-xs font-mono text-white/40">
        <span>{filtered.length} de {products.length} ítems</span>
        <span>·</span>
        <span className="text-emerald-400">{products.filter((p) => p.stock > 0).length} publicados</span>
        <span>·</span>
        <span className="text-amber-400">{products.filter((p) => p.stock === 0).length} ocultos</span>
      </div>

      {/* Content list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-white/30 gap-4">
          <Package className="w-12 h-12" />
          <p className="text-sm">{search ? "Sin resultados para tu búsqueda" : "No hay contenido aún"}</p>
          {!search && (
            <AdminButton variant="new" onClick={() => setEditingProduct("new")}>Crear primer contenido</AdminButton>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((product: Product) => (
            <Fragment key={product.id}>
              <ContentCard
                product={product}
                onEdit={(p: Product) => setEditingProduct(p)}
                onDuplicate={handleDuplicate}
                onPublish={handlePublish}
                onHide={handleHide}
                onDelete={onDeleteProduct}
              />
            </Fragment>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {editingProduct !== null && (
        <ContentEditor
          product={editingProduct === "new" ? null : editingProduct}
          onSave={handleSave}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  );
}

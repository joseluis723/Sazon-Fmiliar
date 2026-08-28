"use client";

import { useEffect, useState } from "react";
import AuthGuard from "../../../components/AuthGuard";

export default function MenuAdminPage() {
  return <AuthGuard roles={["ADMIN"]}>{() => <MenuAdminContent />}</AuthGuard>;
}

function MenuAdminContent() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    imageUrl: "",
  });
  const [editingProductId, setEditingProductId] = useState(null);
  const [error, setError] = useState(null);

  async function loadAll() {
    const [catRes, prodRes] = await Promise.all([fetch("/api/categories"), fetch("/api/products")]);
    const catData = await catRes.json();
    const prodData = await prodRes.json();
    setCategories(catData.categories || []);
    setProducts(prodData.products || []);
    if (!productForm.categoryId && catData.categories?.length) {
      setProductForm((f) => ({ ...f, categoryId: catData.categories[0].id }));
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addCategory(e) {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategoryName.trim() }),
    });
    if (res.ok) {
      setNewCategoryName("");
      loadAll();
    }
  }

  async function toggleCategoryActive(cat) {
    await fetch(`/api/categories/${cat.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !cat.active }),
    });
    loadAll();
  }

  async function deleteCategory(cat) {
    const res = await fetch(`/api/categories/${cat.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    loadAll();
  }

  function startEditProduct(p) {
    setEditingProductId(p.id);
    setProductForm({
      name: p.name,
      description: p.description || "",
      price: String(p.price),
      categoryId: p.categoryId,
      imageUrl: p.imageUrl || "",
    });
  }

  function resetProductForm() {
    setEditingProductId(null);
    setProductForm({
      name: "",
      description: "",
      price: "",
      categoryId: categories[0]?.id || "",
      imageUrl: "",
    });
  }

  async function submitProduct(e) {
    e.preventDefault();
    setError(null);
    if (!productForm.name || !productForm.price || !productForm.categoryId) {
      setError("Nombre, precio y categoria son obligatorios");
      return;
    }
    const url = editingProductId ? `/api/products/${editingProductId}` : "/api/products";
    const method = editingProductId ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productForm),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    resetProductForm();
    loadAll();
  }

  async function toggleAvailable(p) {
    await fetch(`/api/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !p.available }),
    });
    loadAll();
  }

  async function deleteProduct(p) {
    await fetch(`/api/products/${p.id}`, { method: "DELETE" });
    loadAll();
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-semibold">Gestion del menu</h1>
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <section className="ticket-card p-4 dark:bg-ink-800 dark:border-paper/10">
        <h2 className="font-display font-semibold">Categorias</h2>
        <form onSubmit={addCategory} className="mt-3 flex gap-2">
          <input
            className="input"
            placeholder="Nueva categoria (ej. Postres)"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <button className="btn-primary whitespace-nowrap">Agregar</button>
        </form>
        <ul className="mt-4 divide-y divide-ink/10">
          {categories.map((cat) => (
            <li key={cat.id} className="flex items-center justify-between py-2 text-sm">
              <span className={cat.active ? "" : "text-ink/40 line-through"}>
                {cat.name} <span className="text-ink/40">({cat._count?.products ?? 0} productos)</span>
              </span>
              <span className="flex gap-2">
                <button className="btn-secondary py-1 text-xs" onClick={() => toggleCategoryActive(cat)}>
                  {cat.active ? "Desactivar" : "Activar"}
                </button>
                <button className="btn-secondary py-1 text-xs" onClick={() => deleteCategory(cat)}>
                  Eliminar
                </button>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="ticket-card p-4 dark:bg-ink-800 dark:border-paper/10">
        <h2 className="font-display font-semibold">
          {editingProductId ? "Editar producto" : "Nuevo producto"}
        </h2>
        <form onSubmit={submitProduct} className="mt-3 grid gap-3 md:grid-cols-2">
          <input
            className="input"
            placeholder="Nombre"
            value={productForm.name}
            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
          />
          <select
            className="input"
            value={productForm.categoryId}
            onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            className="input"
            type="number"
            step="0.01"
            placeholder="Precio"
            value={productForm.price}
            onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
          />
          <input
            className="input"
            placeholder="URL de imagen (opcional)"
            value={productForm.imageUrl}
            onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
          />
          <textarea
            className="input md:col-span-2"
            placeholder="Descripcion (opcional)"
            value={productForm.description}
            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
          />
          <div className="flex gap-2 md:col-span-2">
            <button className="btn-primary">{editingProductId ? "Guardar cambios" : "Crear producto"}</button>
            {editingProductId && (
              <button type="button" className="btn-secondary" onClick={resetProductForm}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="ticket-card p-4 dark:bg-ink-800 dark:border-paper/10">
        <h2 className="font-display font-semibold">Productos ({products.length})</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left text-ink/50">
                <th className="py-2 pr-2">Nombre</th>
                <th className="py-2 pr-2">Categoria</th>
                <th className="py-2 pr-2">Precio</th>
                <th className="py-2 pr-2">Estado</th>
                <th className="py-2">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="py-2 pr-2">{p.name}</td>
                  <td className="py-2 pr-2 text-ink/60">{p.category?.name}</td>
                  <td className="py-2 pr-2 font-mono">Bs {p.price.toFixed(2)}</td>
                  <td className="py-2 pr-2">
                    {p.available ? (
                      <span className="text-herb-600">Disponible</span>
                    ) : (
                      <span className="text-ink/40">Agotado</span>
                    )}
                  </td>
                  <td className="flex gap-2 py-2">
                    <button className="btn-secondary py-1 text-xs" onClick={() => toggleAvailable(p)}>
                      {p.available ? "Marcar agotado" : "Marcar disponible"}
                    </button>
                    <button className="btn-secondary py-1 text-xs" onClick={() => startEditProduct(p)}>
                      Editar
                    </button>
                    <button className="btn-secondary py-1 text-xs" onClick={() => deleteProduct(p)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

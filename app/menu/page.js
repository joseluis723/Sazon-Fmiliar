"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "../../components/ProductCard";
import CategoryTabs from "../../components/CategoryTabs";
import CartSheet from "../../components/CartSheet";

function MenuContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mesa = searchParams.get("mesa");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [table, setTable] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("todas");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    setLoading(true);

    const qs = mesa ? `?mesa=${encodeURIComponent(mesa)}` : "";

    fetch(`/api/menu${qs}`)
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "No se pudo cargar el menu");
        }

        return data;
      })
      .then((data) => {
        setTable(data.table);
        setCategories(data.categories);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [mesa]);

  const allProducts = useMemo(
    () =>
      categories.flatMap((c) =>
        c.products.map((p) => ({
          ...p,
          categoryId: c.id,
        }))
      ),
    [categories]
  );

  const visibleProducts = useMemo(() => {
    return allProducts.filter((p) => {
      const matchesCategory =
        activeCategory === "todas" ||
        p.categoryId === activeCategory;

      const matchesSearch = p.name
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [allProducts, activeCategory, search]);

  const cartQuantities = useMemo(() => {
    const map = new Map();

    cart.forEach((it) => {
      map.set(
        it.productId,
        (map.get(it.productId) || 0) + it.quantity
      );
    });

    return map;
  }, [cart]);

  function addToCart(product) {
    setCart((prev) => {
      const existing = prev.find(
        (it) => it.productId === product.id && !it.notes
      );

      if (existing) {
        return prev.map((it) =>
          it.id === existing.id
            ? { ...it, quantity: it.quantity + 1 }
            : it
        );
      }

      return [
        ...prev,
        {
          id: `${product.id}-${Date.now()}`,
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          notes: "",
        },
      ];
    });

    setCartOpen(true);
  }

  function changeQuantity(itemId, quantity) {
    if (quantity <= 0) {
      setCart((prev) =>
        prev.filter((it) => it.id !== itemId)
      );
      return;
    }

    setCart((prev) =>
      prev.map((it) =>
        it.id === itemId
          ? { ...it, quantity }
          : it
      )
    );
  }

  function removeItem(itemId) {
    setCart((prev) =>
      prev.filter((it) => it.id !== itemId)
    );
  }

  function updateItemNote(itemId, note) {
    setCart((prev) =>
      prev.map((it) =>
        it.id === itemId
          ? { ...it, notes: note }
          : it
      )
    );
  }

  async function confirmOrder(orderNotes) {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tableNumber: mesa,
          notes: orderNotes,
          items: cart.map((it) => ({
            productId: it.productId,
            quantity: it.quantity,
            notes: it.notes,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "No se pudo enviar el pedido"
        );
      }

      router.push(`/pedido/${data.order.id}`);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const totalItemsInCart = cart.reduce(
    (sum, it) => sum + it.quantity,
    0
  );

  if (!mesa) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center">
        <div>
          <h1 className="font-display text-2xl font-semibold">
            Falta identificar la mesa
          </h1>

          <p className="mt-2 text-ink/60">
            Escanea el codigo QR impreso en tu mesa para abrir el
            menu correcto.
          </p>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-ink/50">
          Cargando menu...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ember-700">
            No pudimos abrir el menu
          </h1>

          <p className="mt-2 text-ink/60">
            {error}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-28">
      <header className="sticky top-0 z-20 bg-paper px-4 pb-2 pt-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-ember">
              {table?.name || `Mesa ${table?.number}`}
            </p>

            <h1 className="font-display text-xl font-semibold">
              Nuestro menu
            </h1>
          </div>

          <span className="text-3xl">
            🍴
          </span>
        </div>

        <input
          type="search"
          placeholder="Buscar en el menu..."
          className="input mt-3"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />
      </header>

      <div className="px-4">
        <CategoryTabs
          categories={categories}
          active={activeCategory}
          onChange={setActiveCategory}
        />

        <div className="mt-3 space-y-3">
          {visibleProducts.length === 0 ? (
            <p className="py-10 text-center text-ink/50">
              No encontramos productos con ese criterio.
            </p>
          ) : (
            visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                quantityInCart={
                  cartQuantities.get(product.id) || 0
                }
                onAdd={addToCart}
              />
            ))
          )}
        </div>
      </div>

      {totalItemsInCart > 0 && !cartOpen && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full bg-ink px-6 py-3 text-paper shadow-lg"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ember text-sm font-bold">
            {totalItemsInCart}
          </span>

          <span className="font-semibold">
            Ver carrito
          </span>
        </button>
      )}

      <CartSheet
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onChangeQuantity={changeQuantity}
        onRemove={removeItem}
        onUpdateItemNote={updateItemNote}
        tableNumber={table?.number}
        onConfirmOrder={confirmOrder}
        submitting={submitting}
      />

      {submitError && (
        <div className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 rounded-lg bg-red-700 px-4 py-2 text-sm text-white">
          {submitError}
        </div>
      )}
    </main>
  );
}

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <p className="text-ink/50">
            Cargando menu...
          </p>
        </main>
      }
    >
      <MenuContent />
    </Suspense>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import AuthGuard from "../../components/AuthGuard";
import AdminNav from "../../components/AdminNav";

const NEXT_STATUS = {
  NUEVO: { next: "CONFIRMADO", label: "ACEPTAR PEDIDO" },
  CONFIRMADO: { next: "EN_PREPARACION", label: "EMPEZAR PREPARACION" },
  EN_PREPARACION: { next: "LISTO", label: "PEDIDO LISTO" },
};

const STATUS_DOT = {
  NUEVO: "🟡",
  CONFIRMADO: "🟡",
  EN_PREPARACION: "🟠",
  LISTO: "🟢",
};

export default function CocinaPage() {
  return <AuthGuard roles={["ADMIN", "COCINA"]}>{(user) => <CocinaContent user={user} />}</AuthGuard>;
}

function CocinaContent({ user }) {
  const [orders, setOrders] = useState([]);
  const [flashNewOrder, setFlashNewOrder] = useState(false);
  const audioRef = useRef(null);
  const [dark, setDark] = useState(true);

  async function load() {
    const res = await fetch("/api/orders?status=NUEVO");
    const confirmados = await fetch("/api/orders?status=CONFIRMADO").then((r) => r.json());
    const enPrep = await fetch("/api/orders?status=EN_PREPARACION").then((r) => r.json());
    const nuevos = await res.json();
    const all = [...nuevos.orders, ...confirmados.orders, ...enPrep.orders].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
    setOrders(all);
  }

  useEffect(() => {
    load();
    const socket = io({ path: "/api/socket" });
    socket.emit("join:staff");

    socket.on("order:new", () => {
      load();
      setFlashNewOrder(true);
      audioRef.current?.play().catch(() => {});
      setTimeout(() => setFlashNewOrder(false), 2500);
    });

    socket.on("order:status", () => {
      load();
    });

    return () => socket.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function advanceStatus(order) {
    const next = NEXT_STATUS[order.status]?.next;
    if (!next) return;
    await fetch(`/api/orders/${order.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
  }

  async function cancelOrder(order) {
    if (!confirm(`Cancelar el pedido #${order.number}? Esta accion no se puede deshacer.`)) return;
    await fetch(`/api/orders/${order.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELADO" }),
    });
    load();
  }

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-paper text-ink dark:bg-ink dark:text-paper">
        <AdminNav user={user} dark={dark} onToggleDark={() => setDark((d) => !d)} />

        <audio ref={audioRef} src="data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=" />

        <div className={`p-5 transition-colors ${flashNewOrder ? "bg-butter/20" : ""}`}>
          <div className="mb-4 flex items-center justify-between">
            <h1 className="font-display text-2xl font-semibold">Panel de cocina</h1>
            {flashNewOrder && (
              <span className="animate-pulse rounded-full bg-ember px-4 py-1.5 text-sm font-semibold text-paper">
                Nuevo pedido
              </span>
            )}
          </div>

          {orders.length === 0 ? (
            <p className="text-ink/50 dark:text-paper/50">No hay pedidos activos en este momento.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-card border-2 border-ink/10 bg-paper p-5 shadow-ticket dark:bg-ink-800 dark:border-paper/10"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-xl font-bold">PEDIDO #{order.number}</h2>
                    <span className="text-2xl">{STATUS_DOT[order.status]}</span>
                  </div>
                  <p className="font-mono text-sm text-ember-600">
                    {order.table?.name || `MESA ${order.table?.number}`}
                  </p>

                  <ul className="mt-3 space-y-1 text-lg">
                    {order.items.map((item) => (
                      <li key={item.id}>
                        <span className="font-bold">{item.quantity}x</span> {item.product.name}
                      </li>
                    ))}
                  </ul>

                  {order.notes && (
                    <p className="mt-2 rounded-lg bg-butter/15 px-3 py-2 text-sm font-medium">
                      Observacion: {order.notes}
                    </p>
                  )}
                  {order.items.some((it) => it.notes) && (
                    <ul className="mt-1 text-sm text-ink/60 dark:text-paper/60">
                      {order.items
                        .filter((it) => it.notes)
                        .map((it) => (
                          <li key={it.id}>
                            {it.product.name}: {it.notes}
                          </li>
                        ))}
                    </ul>
                  )}

                  <p className="mt-3 text-xs text-ink/40 dark:text-paper/40">
                    {new Date(order.createdAt).toLocaleTimeString("es-BO")}
                  </p>

                  <div className="mt-4 flex gap-2">
                    {NEXT_STATUS[order.status] && (
                      <button
                        onClick={() => advanceStatus(order)}
                        className="btn-primary flex-1 text-sm"
                      >
                        {NEXT_STATUS[order.status].label}
                      </button>
                    )}
                    <button onClick={() => cancelOrder(order)} className="btn-secondary text-sm">
                      Cancelar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

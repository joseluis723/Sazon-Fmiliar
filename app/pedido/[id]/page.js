"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import StatusBadge from "../../../components/StatusBadge";

const STEPS = [
  { key: "NUEVO", label: "Pedido recibido" },
  { key: "CONFIRMADO", label: "Pedido confirmado" },
  { key: "EN_PREPARACION", label: "En preparacion" },
  { key: "LISTO", label: "Listo para entregar" },
  { key: "ENTREGADO", label: "Entregado" },
];

export default function OrderStatusPage({ params }) {
  const { id } = params;
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Pedido no encontrado");
        return data;
      })
      .then((data) => setOrder(data.order))
      .catch((err) => setError(err.message));
  }, [id]);

  useEffect(() => {
    if (!order) return;
    const socket = io({ path: "/api/socket" });
    socket.emit("join:mesa", order.tableId);
    socket.on("order:status", (updated) => {
      if (updated.id === order.id) {
        setOrder((prev) => ({ ...prev, status: updated.status }));
      }
    });
    return () => socket.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center">
        <p className="text-ember-700">{error}</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-ink/50">Cargando pedido...</p>
      </main>
    );
  }

  const currentStepIndex = STEPS.findIndex((s) => s.key === order.status);
  const cancelled = order.status === "CANCELADO";

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-md">
        <p className="font-mono text-xs uppercase tracking-wide text-ember">
          {order.table?.name || `Mesa ${order.table?.number}`}
        </p>
        <h1 className="font-display text-2xl font-semibold">Pedido #{order.number}</h1>
        <div className="mt-2">
          <StatusBadge status={order.status} />
        </div>

        {cancelled ? (
          <p className="mt-6 rounded-lg bg-red-50 p-4 text-red-700">
            Este pedido fue cancelado. Si tienes dudas, avisa al personal del restaurante.
          </p>
        ) : (
          <ol className="mt-6 space-y-4">
            {STEPS.map((step, i) => {
              const done = i <= currentStepIndex;
              return (
                <li key={step.key} className="flex items-center gap-3">
                  <span
                    className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      done ? "bg-herb text-paper" : "bg-ink/10 text-ink/40"
                    }`}
                  >
                    {done ? "✓" : ""}
                  </span>
                  <span className={done ? "font-medium text-ink" : "text-ink/40"}>{step.label}</span>
                </li>
              );
            })}
          </ol>
        )}

        <div className="ticket-card mt-8 p-4">
          <h2 className="font-display font-semibold">Resumen del pedido</h2>
          <ul className="mt-2 divide-y divide-ink/10">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between py-2 text-sm">
                <span>
                  {item.quantity}x {item.product.name}
                  {item.notes && <span className="block text-ink/50">Nota: {item.notes}</span>}
                </span>
                <span className="font-mono">Bs {(item.unitPrice * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          {order.notes && (
            <p className="mt-2 text-sm text-ink/60">Observaciones: {order.notes}</p>
          )}
          <div className="mt-3 flex justify-between border-t border-ink/10 pt-3 font-display text-lg font-semibold">
            <span>Total</span>
            <span className="font-mono">Bs {order.total.toFixed(2)}</span>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-ink/50">
          Esta pagina se actualiza sola. Puedes dejarla abierta mientras esperas.
        </p>
      </div>
    </main>
  );
}

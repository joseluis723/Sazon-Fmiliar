"use client";

import { useEffect, useState } from "react";
import AuthGuard from "../../../components/AuthGuard";
import StatusBadge from "../../../components/StatusBadge";

const STATUSES = ["NUEVO", "CONFIRMADO", "EN_PREPARACION", "LISTO", "ENTREGADO", "CANCELADO"];

export default function PedidosAdminPage() {
  return <AuthGuard roles={["ADMIN", "MESERO"]}>{() => <PedidosContent />}</AuthGuard>;
}

function PedidosContent() {
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({ status: "", date: "", number: "" });
  const [tables, setTables] = useState([]);

  async function load() {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.date) params.set("date", filters.date);
    if (filters.number) params.set("number", filters.number);
    const res = await fetch(`/api/orders?${params.toString()}`);
    const data = await res.json();
    setOrders(data.orders || []);
  }

  useEffect(() => {
    fetch("/api/tables")
      .then((r) => r.json())
      .then((d) => setTables(d.tables || []));
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  async function changeStatus(order, status) {
    await fetch(`/api/orders/${order.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  async function markAsPaid(order, method) {
    if (!confirm(`Confirmas que el pedido #${order.number} fue pagado (${method})?`)) return;
    await fetch(`/api/orders/${order.id}/payment`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method }),
    });
    load();
  }

  function exportCsv() {
    const headers = ["Numero", "Mesa", "Fecha", "Estado", "Total"];
    const rows = orders.map((o) => [
      o.number,
      o.table?.name || o.table?.number,
      new Date(o.createdAt).toLocaleString("es-BO"),
      o.status,
      o.total.toFixed(2),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pedidos.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold">Pedidos</h1>
        <button className="btn-secondary" onClick={exportCsv}>
          Exportar CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          className="input max-w-[200px]"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">Todos los estados</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="input max-w-[180px]"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
        />
        <input
          type="number"
          placeholder="N. de pedido"
          className="input max-w-[140px]"
          value={filters.number}
          onChange={(e) => setFilters({ ...filters, number: e.target.value })}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-left text-ink/50">
              <th className="py-2 pr-2">#</th>
              <th className="py-2 pr-2">Mesa</th>
              <th className="py-2 pr-2">Fecha</th>
              <th className="py-2 pr-2">Items</th>
              <th className="py-2 pr-2">Total</th>
              <th className="py-2 pr-2">Estado</th>
              <th className="py-2 pr-2">Cambiar estado</th>
              <th className="py-2 pr-2">Pago</th>
              <th className="py-2">Confirmar pago</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="py-2 pr-2 font-mono">{order.number}</td>
                <td className="py-2 pr-2">{order.table?.name || `Mesa ${order.table?.number}`}</td>
                <td className="py-2 pr-2 text-ink/60">
                  {new Date(order.createdAt).toLocaleString("es-BO")}
                </td>
                <td className="py-2 pr-2 text-ink/60">
                  {order.items.map((it) => `${it.quantity}x ${it.product.name}`).join(", ")}
                </td>
                <td className="py-2 pr-2 font-mono">Bs {order.total.toFixed(2)}</td>
                <td className="py-2 pr-2">
                  <StatusBadge status={order.status} />
                </td>
                <td className="py-2">
                  <select
                    className="input py-1 text-xs"
                    value={order.status}
                    onChange={(e) => changeStatus(order, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2 pr-2">
                  {order.payment?.status === "PAGADO" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-herb/15 px-3 py-1 text-xs font-medium text-herb-600">
                      Pagado ({order.payment.method})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/5 px-3 py-1 text-xs font-medium text-ink/60">
                      Pendiente
                    </span>
                  )}
                </td>
                <td className="py-2">
                  {order.payment?.status !== "PAGADO" && (
                    <div className="flex gap-1">
                      <button
                        className="btn-secondary py-1 text-xs"
                        onClick={() => markAsPaid(order, "EFECTIVO")}
                      >
                        Efectivo
                      </button>
                      <button
                        className="btn-secondary py-1 text-xs"
                        onClick={() => markAsPaid(order, "EN_ESTABLECIMIENTO")}
                      >
                        En caja
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={9} className="py-8 text-center text-ink/40">
                  No hay pedidos con estos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

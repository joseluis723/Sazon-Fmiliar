"use client";

import { useEffect, useState } from "react";
import AuthGuard from "../../components/AuthGuard";

function StatCard({ label, value }) {
  return (
    <div className="ticket-card p-4 dark:bg-ink-800 dark:border-paper/10">
      <p className="text-sm text-ink/60 dark:text-paper/60">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard roles={["ADMIN"]}>
      {() => <DashboardContent />}
    </AuthGuard>
  );
}

function DashboardContent() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then(setStats);
  }, []);

  if (!stats) return <p className="text-ink/50">Cargando estadisticas...</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
      <p className="text-ink/60 dark:text-paper/60">Resumen de hoy</p>

      <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Ventas de hoy" value={`Bs ${stats.ventasHoy.toFixed(2)}`} />
        <StatCard label="Pedidos de hoy" value={stats.cantidadPedidos} />
        <StatCard label="Pendientes" value={stats.pendientes} />
        <StatCard label="Completados" value={stats.completados} />
        <StatCard label="Mesas ocupadas" value={stats.mesasOcupadas} />
      </div>

      <div className="ticket-card mt-6 p-4 dark:bg-ink-800 dark:border-paper/10">
        <h2 className="font-display font-semibold">Productos mas vendidos hoy</h2>
        {stats.productosMasVendidos.length === 0 ? (
          <p className="mt-2 text-sm text-ink/50">Aun no hay ventas hoy.</p>
        ) : (
          <ol className="mt-3 space-y-2">
            {stats.productosMasVendidos.map((p, i) => (
              <li key={p.name} className="flex items-center justify-between text-sm">
                <span>
                  <span className="mr-2 font-mono text-ink/40">{i + 1}.</span>
                  {p.name}
                </span>
                <span className="font-mono">{p.cantidad} un.</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

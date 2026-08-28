"use client";

import { useEffect, useState } from "react";
import AuthGuard from "../../../components/AuthGuard";

export default function MesasAdminPage() {
  return <AuthGuard roles={["ADMIN"]}>{() => <MesasContent />}</AuthGuard>;
}

function MesasContent() {
  const [tables, setTables] = useState([]);
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(null);

  async function load() {
    const res = await fetch("/api/tables");
    const data = await res.json();
    setTables(data.tables || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function addTable(e) {
    e.preventDefault();
    setError(null);
    if (!number) return;
    const res = await fetch("/api/tables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number, name: name || undefined }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setNumber("");
    setName("");
    load();
  }

  async function toggleActive(table) {
    await fetch(`/api/tables/${table.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !table.active }),
    });
    load();
  }

  async function removeTable(table) {
    await fetch(`/api/tables/${table.id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold">Mesas y codigos QR</h1>
        <a href="/api/tables/qr-pdf" className="btn-primary" target="_blank" rel="noreferrer">
          Descargar todos los QR (PDF)
        </a>
      </div>

      <section className="ticket-card p-4 dark:bg-ink-800 dark:border-paper/10">
        <h2 className="font-display font-semibold">Nueva mesa</h2>
        <form onSubmit={addTable} className="mt-3 flex flex-wrap gap-2">
          <input
            className="input max-w-[140px]"
            type="number"
            placeholder="Numero"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
          />
          <input
            className="input max-w-[220px]"
            placeholder="Nombre (opcional, ej. Terraza 2)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button className="btn-primary">Crear mesa</button>
        </form>
        {error && <p className="mt-2 text-sm text-ember-700">{error}</p>}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tables.map((table) => (
          <div key={table.id} className="ticket-card p-4 dark:bg-ink-800 dark:border-paper/10">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold">{table.name || `Mesa ${table.number}`}</h3>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  table.active ? "bg-herb/15 text-herb-600" : "bg-ink/10 text-ink/50"
                }`}
              >
                {table.active ? "Activa" : "Inactiva"}
              </span>
            </div>
            <p className="mt-1 font-mono text-xs text-ink/50">
              /menu?mesa={table.number}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={`/api/tables/${table.id}/qr`} className="btn-secondary py-1.5 text-xs" target="_blank" rel="noreferrer">
                Descargar QR (PNG)
              </a>
              <button className="btn-secondary py-1.5 text-xs" onClick={() => toggleActive(table)}>
                {table.active ? "Desactivar" : "Activar"}
              </button>
              <button className="btn-secondary py-1.5 text-xs" onClick={() => removeTable(table)}>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

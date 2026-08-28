"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@restaurante.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo iniciar sesion");

      if (data.user.role === "ADMIN") router.push("/admin");
      else if (data.user.role === "COCINA") router.push("/cocina");
      else router.push("/admin/pedidos");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="ticket-card w-full max-w-sm p-6">
        <h1 className="font-display text-2xl font-semibold">Panel del restaurante</h1>
        <p className="mt-1 text-sm text-ink/60">Ingresa con tu cuenta de administrador, cocina o mesero.</p>

        <div className="mt-5 space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Correo</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Contrasena</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-ember-700">{error}</p>}

        <button type="submit" className="btn-primary mt-5 w-full" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <p className="mt-4 text-xs text-ink/40">
          Datos de prueba: admin@restaurante.com / cocina@restaurante.com / mesero@restaurante.com &mdash; contrasena: password123
        </p>
      </form>
    </main>
  );
}

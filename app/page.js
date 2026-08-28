import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-ember mb-4">
        Sistema de pedidos por QR
      </span>
      <h1 className="font-display text-4xl md:text-5xl font-semibold max-w-2xl leading-tight">
        Escanea la mesa. Pide desde tu telefono.
      </h1>
      <p className="mt-4 max-w-md text-ink/70">
        Esta pagina no es parte del flujo del cliente: el cliente llega directo a{" "}
        <code className="font-mono text-sm">/menu?mesa=1</code> al escanear el QR de su mesa.
        Estos enlaces son para el equipo del restaurante.
      </p>
      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <Link href="/menu?mesa=1" className="btn-primary">
          Ver menu de ejemplo (Mesa 1)
        </Link>
        <Link href="/login" className="btn-secondary">
          Entrar al panel del restaurante
        </Link>
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Dashboard", roles: ["ADMIN"] },
  { href: "/admin/menu", label: "Menu", roles: ["ADMIN"] },
  { href: "/admin/mesas", label: "Mesas y QR", roles: ["ADMIN"] },
  { href: "/admin/pedidos", label: "Pedidos", roles: ["ADMIN", "MESERO"] },
  { href: "/cocina", label: "Cocina", roles: ["ADMIN", "COCINA"] },
];

export default function AdminNav({ user, dark, onToggleDark }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const visibleLinks = LINKS.filter((l) => l.roles.includes(user.role));

  return (
    <>
      <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 bg-paper px-5 py-3 dark:bg-ink dark:text-paper">
        <div className="flex items-center gap-5">
          <span className="font-display text-lg font-semibold">Restaurante QR</span>
          <div className="flex gap-1">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                  pathname === link.href ? "bg-ink text-paper dark:bg-paper dark:text-ink" : "text-ink/60 dark:text-paper/60"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-ink/60 dark:text-paper/60">
            {user.name} &middot; {user.role}
          </span>
          <button onClick={onToggleDark} className="btn-secondary py-1.5 text-xs">
            {dark ? "Modo claro" : "Modo oscuro"}
          </button>
          <button onClick={logout} className="btn-secondary py-1.5 text-xs">
            Salir
          </button>
        </div>
      </nav>
    </>
  );
}

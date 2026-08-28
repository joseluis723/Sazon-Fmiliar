"use client";

const STATUS_CONFIG = {
  NUEVO: { label: "Nuevo", dot: "bg-butter", text: "text-butter-600" },
  CONFIRMADO: { label: "Confirmado", dot: "bg-butter", text: "text-butter-600" },
  EN_PREPARACION: { label: "En preparacion", dot: "bg-ember", text: "text-ember-600" },
  LISTO: { label: "Listo", dot: "bg-herb", text: "text-herb-600" },
  ENTREGADO: { label: "Entregado", dot: "bg-ink/40", text: "text-ink/60" },
  CANCELADO: { label: "Cancelado", dot: "bg-red-700", text: "text-red-700" },
};

export default function StatusBadge({ status, className = "" }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.NUEVO;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-ink/5 px-3 py-1 text-sm font-medium ${cfg.text} ${className}`}
    >
      <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export { STATUS_CONFIG };

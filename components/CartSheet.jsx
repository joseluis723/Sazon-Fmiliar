"use client";

import { useState } from "react";

export default function CartSheet({
  open,
  onClose,
  cart,
  onChangeQuantity,
  onRemove,
  onUpdateItemNote,
  tableNumber,
  onConfirmOrder,
  submitting,
}) {
  const [confirming, setConfirming] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");

  const subtotal = cart.reduce((sum, it) => sum + it.price * it.quantity, 0);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 md:items-center">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-2xl bg-paper md:rounded-2xl">
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
          <h2 className="font-display text-xl font-semibold">
            {confirming ? "Confirma tu pedido" : "Tu pedido"}
          </h2>
          <button onClick={onClose} className="text-2xl leading-none text-ink/50" aria-label="Cerrar carrito">
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cart.length === 0 ? (
            <p className="py-10 text-center text-ink/50">Tu carrito esta vacio. Elige algo rico del menu.</p>
          ) : confirming ? (
            <div className="space-y-4">
              <p className="text-sm text-ink/60">
                Mesa <span className="font-semibold text-ink">{tableNumber}</span> &middot; revisa bien antes de enviar, no podras editarlo despues.
              </p>
              <ul className="divide-y divide-ink/10">
                {cart.map((item) => (
                  <li key={item.id} className="flex justify-between py-2 text-sm">
                    <span>
                      {item.quantity}x {item.name}
                      {item.notes && <span className="block text-ink/50">Nota: {item.notes}</span>}
                    </span>
                    <span className="font-mono">Bs {(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div>
                <label className="mb-1 block text-sm font-medium">Observaciones generales (opcional)</label>
                <textarea
                  className="input"
                  rows={2}
                  placeholder="Ej. Traer todo junto, cubiertos para 3, etc."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <ul className="space-y-4">
              {cart.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="font-mono text-sm text-ink/60">Bs {item.price.toFixed(2)}</p>
                    <input
                      type="text"
                      placeholder="Observacion (ej. sin cebolla)"
                      className="input mt-1.5 text-sm"
                      value={item.notes || ""}
                      onChange={(e) => onUpdateItemNote(item.id, e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button onClick={() => onRemove(item.id)} className="text-sm text-ember-600">
                      Quitar
                    </button>
                    <div className="flex items-center gap-2 rounded-full border border-ink/15 px-2 py-1">
                      <button
                        onClick={() => onChangeQuantity(item.id, item.quantity - 1)}
                        className="h-6 w-6 rounded-full text-lg leading-none"
                        aria-label="Disminuir cantidad"
                      >
                        -
                      </button>
                      <span className="w-4 text-center font-mono">{item.quantity}</span>
                      <button
                        onClick={() => onChangeQuantity(item.id, item.quantity + 1)}
                        className="h-6 w-6 rounded-full text-lg leading-none"
                        aria-label="Aumentar cantidad"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-ink/10 px-5 py-4">
            <div className="mb-3 flex items-center justify-between font-display text-lg font-semibold">
              <span>Total</span>
              <span className="font-mono">Bs {subtotal.toFixed(2)}</span>
            </div>

            {confirming ? (
              <div className="flex gap-2">
                <button className="btn-secondary flex-1" onClick={() => setConfirming(false)} disabled={submitting}>
                  Volver
                </button>
                <button
                  className="btn-primary flex-1"
                  onClick={() => onConfirmOrder(orderNotes)}
                  disabled={submitting}
                >
                  {submitting ? "Enviando..." : "Si, enviar pedido"}
                </button>
              </div>
            ) : (
              <button className="btn-primary w-full text-base" onClick={() => setConfirming(true)}>
                CONFIRMAR PEDIDO
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

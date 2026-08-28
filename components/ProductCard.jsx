"use client";

export default function ProductCard({ product, quantityInCart, onAdd }) {
  return (
    <div className="ticket-card flex gap-3 p-3">
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-ink/5">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl">🍽️</div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-semibold leading-snug">{product.name}</h3>
            {product.featured && (
              <span className="whitespace-nowrap rounded-full bg-butter/20 px-2 py-0.5 text-[11px] font-semibold text-butter-600">
                Destacado
              </span>
            )}
          </div>
          {product.description && (
            <p className="mt-0.5 text-sm text-ink/60 line-clamp-2">{product.description}</p>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="font-mono font-semibold text-ink">
            Bs {product.price.toFixed(2)}
          </span>

          {!product.available ? (
            <span className="text-sm font-medium text-ink/40">Agotado</span>
          ) : (
            <button
              onClick={() => onAdd(product)}
              className="relative rounded-full bg-ember px-4 py-1.5 text-sm font-semibold text-paper transition-colors hover:bg-ember-600 active:scale-95"
            >
              Agregar
              {quantityInCart > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-paper">
                  {quantityInCart}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

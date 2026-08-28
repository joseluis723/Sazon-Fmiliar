"use client";

export default function CategoryTabs({ categories, active, onChange }) {
  return (
    <div className="sticky top-[68px] z-10 -mx-4 flex gap-2 overflow-x-auto bg-paper/95 px-4 py-3 backdrop-blur">
      <button
        onClick={() => onChange("todas")}
        className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
          active === "todas" ? "bg-ink text-paper" : "bg-ink/5 text-ink/70"
        }`}
      >
        Todas
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            active === cat.id ? "bg-ink text-paper" : "bg-ink/5 text-ink/70"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}

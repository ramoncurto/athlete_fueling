import type { Kit } from "@schemas/index";

export default function KitSummary({ kits }: { kits: Kit[] }) {
  return (
    <div className="rounded-3xl border border-slate-800/70 bg-slate-900/40 p-6 text-sm text-slate-300">
      <h3 className="text-lg font-semibold text-white">Kit variants</h3>
      <div className="mt-4 space-y-4">
        {kits.map((kit) => (
          <div key={kit.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-cyan-200">{kit.variant.toUpperCase()}</span>
              <span className="text-xs uppercase tracking-wide text-slate-400">
                ${kit.totalPrice.toFixed(2)} - {kit.totalWeightGrams} g
              </span>
            </div>
            <ul className="mt-3 space-y-1 text-xs text-slate-400">
              {kit.items.map((item) => (
                <li key={`${kit.id}-${item.sku}`}>
                  {item.quantity} x {item.name} ({item.brand})
                </li>
              ))}
            </ul>
          </div>
        ))}
        {!kits.length && <p className="text-xs text-slate-600">No kits generated yet.</p>}
      </div>
    </div>
  );
}

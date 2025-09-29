import type { Kit } from "@schemas/index";

type KitSummaryProps = {
  kits: Kit[];
  showViewAll?: boolean;
};

export default function KitSummary({ kits, showViewAll = false }: KitSummaryProps) {
  if (!kits.length) {
    return (
      <div className="rounded-3xl border border-slate-800/70 bg-slate-900/40 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-full bg-slate-700/50 p-2">
            <svg className="h-5 w-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zM8 6a2 2 0 114 0v1H8V6zm0 3a1 1 0 012 0 1 1 0 11-2 0zm4 0a1 1 0 112 0 1 1 0 11-2 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Kit Builder</h3>
            <p className="text-sm text-slate-400">Generate shopping lists from your plans</p>
          </div>
        </div>
        <div className="rounded-2xl bg-slate-800/30 p-4 text-center">
          <p className="text-sm text-slate-400 mb-3">No kits generated yet</p>
          <p className="text-xs text-slate-500">
            Create a race plan first, then use Kit Builder to generate product recommendations and shopping lists.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-800/70 bg-slate-900/40 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-cyan-500/20 p-2">
            <svg className="h-5 w-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zM8 6a2 2 0 114 0v1H8V6zm0 3a1 1 0 012 0 1 1 0 11-2 0zm4 0a1 1 0 112 0 1 1 0 11-2 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Recent Kits</h3>
            <p className="text-sm text-slate-400">{kits.length} kit variant{kits.length !== 1 ? 's' : ''} ready</p>
          </div>
        </div>
        {showViewAll && (
          <a
            href="#kit-history"
            className="text-sm text-cyan-400 hover:text-cyan-300 font-medium"
          >
            View all →
          </a>
        )}
      </div>

      <div className="space-y-3">
        {kits.map((kit) => {
          const weightInOz = (kit.totalWeightGrams * 0.035274).toFixed(1);
          return (
            <div key={kit.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-cyan-500/10 px-3 py-1 text-sm font-semibold text-cyan-300">
                    {kit.variant.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-sm font-medium text-slate-300">
                    ${kit.totalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-300">{kit.totalWeightGrams}g</p>
                  <p className="text-xs text-slate-500">{weightInOz} oz</p>
                </div>
              </div>

              <div className="space-y-1">
                {kit.items.slice(0, 3).map((item) => (
                  <div key={`${kit.id}-${item.sku}`} className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">
                      {item.quantity}× {item.name}
                    </span>
                    <span className="text-slate-500">{item.brand}</span>
                  </div>
                ))}
                {kit.items.length > 3 && (
                  <p className="text-xs text-slate-500 italic">+ {kit.items.length - 3} more items</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

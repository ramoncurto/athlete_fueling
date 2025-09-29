type QuickActionsProps = {
  subscribed: boolean;
  hasEvents: boolean;
  locale: string;
};

export default function QuickActions({ subscribed, hasEvents, locale }: QuickActionsProps) {
  const actions = [
    {
      title: 'Plan New Race',
      description: 'Create fueling strategy for upcoming event',
      href: '#scenario-studio',
      icon: (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      ),
      primary: true,
      show: true
    },
    {
      title: 'Try Free Calculator',
      description: 'Quick fueling estimates for any distance',
      href: `/${locale}/tools/fuel-calculator`,
      icon: (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 0a1 1 0 100 2h.01a1 1 0 100-2H9zm2 0a1 1 0 100 2h.01a1 1 0 100-2H11z" clipRule="evenodd" />
        </svg>
      ),
      primary: false,
      show: !subscribed || !hasEvents
    },
    {
      title: 'Download Plans',
      description: 'Get race packs for your events',
      href: '#event-plans',
      icon: (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      ),
      primary: false,
      show: hasEvents
    },
    {
      title: 'Update Preferences',
      description: 'Fine-tune your fueling preferences',
      href: '#preferences',
      icon: (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      ),
      primary: false,
      show: true
    }
  ].filter(action => action.show);

  return (
    <div className="rounded-3xl border border-slate-800/50 bg-slate-900/20 p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
        <p className="text-sm text-slate-400">Jump to commonly used features</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => (
          <a
            key={action.title}
            href={action.href}
            className={`group relative overflow-hidden rounded-2xl p-4 transition-all duration-200 ${
              action.primary
                ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800/80 hover:text-white'
            } hover:scale-105 hover:shadow-lg`}
          >
            {/* Background decoration for primary button */}
            {action.primary && (
              <div className="absolute inset-0 opacity-20">
                <div className="absolute right-0 top-0 h-16 w-16 rounded-full bg-white blur-xl" />
              </div>
            )}

            <div className="relative">
              <div className={`mb-3 inline-flex rounded-xl p-2 ${
                action.primary
                  ? 'bg-white/20'
                  : 'bg-slate-700/50 group-hover:bg-slate-600/50'
              }`}>
                {action.icon}
              </div>

              <h3 className={`font-semibold ${action.primary ? 'text-white' : 'group-hover:text-white'}`}>
                {action.title}
              </h3>

              <p className={`mt-1 text-sm ${
                action.primary
                  ? 'text-white/80'
                  : 'text-slate-500 group-hover:text-slate-400'
              }`}>
                {action.description}
              </p>
            </div>
          </a>
        ))}
      </div>

      {!subscribed && (
        <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-800/30 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-amber-500/20 p-2 mt-0.5">
              <svg className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-amber-200">Demo Mode Active</p>
              <p className="mt-1 text-xs text-slate-400">
                You&apos;re seeing limited scenarios in the studio. Upgrade to access the full feature set and unlimited planning.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
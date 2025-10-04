type QuickActionsProps = {
  subscribed: boolean;
  hasEvents: boolean;
  locale: string;
};

export default function QuickActions({ subscribed, hasEvents, locale }: QuickActionsProps) {
  const actions = [
    {
      title: 'Plan New Race',
      description: 'Build your fueling strategy',
      href: `/${locale}/plan/scenarios`,
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      ),
      primary: true,
      show: true
    },
    {
      title: 'Download Race Pack',
      description: 'Export your plan as PDF',
      href: '#event-plans',
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      ),
      primary: false,
      show: hasEvents
    },
    {
      title: 'Update Preferences',
      description: 'Adjust your fueling profile',
      href: '#preferences',
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      ),
      primary: false,
      show: true
    }
  ].filter(action => action.show);

  return (
    <div className="space-y-3">
      {!subscribed && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-amber-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900">Demo mode - Limited features</p>
              <a href={`/${locale}/checkout/annual`} className="text-xs text-amber-700 underline hover:text-amber-800">
                Upgrade for full access
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {actions.map((action) => (
          <a
            key={action.title}
            href={action.href}
            className={`group relative overflow-hidden rounded-lg p-4 transition-all duration-150 ${
              action.primary
                ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white hover:shadow-md hover:-translate-y-0.5'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-cyan-300 hover:-translate-y-0.5'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`flex-shrink-0 rounded-lg p-2 ${
                action.primary
                  ? 'bg-white/20'
                  : 'bg-gray-50 group-hover:bg-cyan-50'
              }`}>
                {action.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className={`font-semibold text-sm ${action.primary ? 'text-white' : 'text-gray-900'}`}>
                  {action.title}
                </h3>
                <p className={`text-xs ${
                  action.primary
                    ? 'text-cyan-50'
                    : 'text-gray-600'
                }`}>
                  {action.description}
                </p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
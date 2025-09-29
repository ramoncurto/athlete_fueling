'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';

export type DashboardSection = 'overview' | 'events' | 'preferences' | 'history' | 'training';

type NavigationItem = {
  id: DashboardSection;
  label: string;
  icon: ReactNode;
  description: string;
};

type DashboardNavigationProps = {
  activeSection: DashboardSection;
  onSectionChange: (section: DashboardSection) => void;
  children: ReactNode;
};

const navigationItems: NavigationItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    description: 'Dashboard home and quick actions',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
      </svg>
    )
  },
  {
    id: 'events',
    label: 'Events & Plans',
    description: 'Race planning and scenarios',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
      </svg>
    )
  },
  {
    id: 'preferences',
    label: 'Preferences',
    description: 'Fueling and taste settings',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
    )
  },
  {
    id: 'history',
    label: 'History',
    description: 'Past plans and intake logs',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    )
  },
  {
    id: 'training',
    label: 'Training',
    description: 'Gut training guidance',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
];

export default function DashboardNavigation({
  activeSection,
  onSectionChange,
  children
}: DashboardNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-full min-h-screen">
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="rounded-xl bg-slate-900/90 p-3 text-white shadow-lg backdrop-blur-sm"
        >
          {isMobileMenuOpen ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <nav className={`
        fixed inset-y-0 left-0 z-40 w-72 transform bg-slate-950/95 backdrop-blur-xl transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-full flex-col p-6">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-white">Athletic Fuel</h1>
            <p className="text-sm text-slate-400">Athlete Dashboard</p>
          </div>

          <div className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSectionChange(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    group flex w-full items-center rounded-xl p-3 text-left transition-all duration-200
                    ${isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                    }
                  `}
                >
                  <div className={`
                    flex-shrink-0 rounded-lg p-2
                    ${isActive
                      ? 'bg-white/20'
                      : 'bg-slate-700/50 group-hover:bg-slate-600/50'
                    }
                  `}>
                    {item.icon}
                  </div>
                  <div className="ml-3 min-w-0 flex-1">
                    <p className="font-medium">{item.label}</p>
                    <p className={`
                      text-xs leading-relaxed
                      ${isActive
                        ? 'text-white/80'
                        : 'text-slate-500 group-hover:text-slate-400'
                      }
                    `}>
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-auto">
            <div className="rounded-xl bg-slate-800/50 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-500/20 p-2">
                  <svg className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">System Online</p>
                  <p className="text-xs text-slate-400">All services operational</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-0">
        <div className="lg:pl-6">
          {children}
        </div>
      </main>
    </div>
  );
}
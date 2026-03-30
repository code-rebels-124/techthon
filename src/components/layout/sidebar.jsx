import {
  Activity,
  BrainCircuit,
  Building2,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  Search,
  Siren,
  Users,
  Workflow,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../utils/cn'

const navigationByRole = {
  hospital: [
    { to: '/hospital', label: 'Dashboard', icon: Activity },
    { to: '/hospitals', label: 'Hospitals', icon: Building2 },
    { to: '/insights', label: 'AI Insights', icon: BrainCircuit },
    { to: '/emergency', label: 'Emergency', icon: Siren },
  ],
  consumer: [
    { to: '/consumer', label: 'Dashboard', icon: Activity },
    { to: '/hospitals', label: 'Availability', icon: Search },
    { to: '/emergency', label: 'Emergency', icon: Siren },
    { to: '/donors', label: 'Donor Finder', icon: Users },
  ],
}

export function Sidebar({ className, role = 'hospital', collapsed = false, onToggleCollapse }) {
  const navigation = navigationByRole[role] || navigationByRole.hospital

  return (
    <aside
      className={cn(
        'hidden shrink-0 transition-[width] duration-300 xl:block',
        collapsed ? 'w-[104px]' : 'w-[290px]',
        className,
      )}
    >
      <div
        className={cn(
          'sticky top-6 rounded-[32px] border border-white/60 bg-white/70 shadow-panel backdrop-blur-xl dark:border-white/10 dark:bg-white/5',
          collapsed ? 'p-4' : 'p-6',
        )}
      >
        <div className={cn('mb-10 flex items-center', collapsed ? 'justify-center' : 'gap-3')}>
          <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-500 text-white shadow-glow">
            <HeartPulse className="size-6" />
          </div>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="text-lg font-semibold">LifeFlow</p>
              <p className="text-sm text-muted-foreground">
                {role === 'hospital' ? 'Smart blood command center' : 'Smart blood access portal'}
              </p>
            </div>
          ) : null}
        </div>

        {onToggleCollapse ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn(
              'mb-5 flex w-full items-center rounded-2xl border border-white/70 bg-white/70 text-sm font-medium text-muted-foreground transition hover:text-foreground dark:border-white/10 dark:bg-white/5',
              collapsed ? 'justify-center px-0 py-3' : 'justify-between px-4 py-3',
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {!collapsed ? <span>Collapse</span> : null}
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
        ) : null}

        <nav className="space-y-3">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  cn(
                    'flex items-center rounded-2xl py-3 text-sm font-medium transition-all',
                    collapsed ? 'justify-center px-0' : 'gap-3 px-4',
                    isActive
                      ? 'bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-glow'
                      : 'text-muted-foreground hover:bg-white/70 hover:text-foreground dark:hover:bg-white/10',
                  )
                }
              >
                <Icon className="size-5" />
                {!collapsed ? item.label : null}
              </NavLink>
            )
          })}
        </nav>

        <div
          className={cn(
            'mt-10 rounded-[28px] bg-gradient-to-br from-rose-500 to-red-500 text-white',
            collapsed ? 'p-4' : 'p-5',
          )}
        >
          <div
            className={cn(
              'inline-flex rounded-full bg-white/15 text-xs font-semibold uppercase tracking-[0.16em]',
              collapsed ? 'mb-0 justify-center px-0 py-0' : 'mb-3 px-3 py-1',
            )}
          >
            {collapsed ? <Workflow className="size-5" /> : 'Live intelligence'}
          </div>
          {!collapsed ? (
            <>
              <p className="text-lg font-semibold">
                {role === 'hospital' ? 'Redistribution engine active' : 'Emergency support active'}
              </p>
              <p className="mt-2 text-sm text-rose-50/90">
                {role === 'hospital'
                  ? 'Routing supply from high-capacity banks to critical care centers automatically.'
                  : 'Find blood quickly, discover nearby support, and reach matching donor networks.'}
              </p>
              <div className="mt-5 flex items-center gap-2 text-sm">
                <Workflow className="size-4" />
                {role === 'hospital' ? '5 actions recommended today' : 'Live donor and stock visibility'}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </aside>
  )
}

import { Bell, LogOut, MoonStar, ShieldCheck, SunMedium } from 'lucide-react'
import { useState } from 'react'
import { StatusDot } from '../status-dot'
import { Button } from '../ui/button'
import { Card } from '../ui/card'

export function Topbar({ notifications, darkMode, onToggleDarkMode, currentUser, role, onLogout }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">LifeFlow platform</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight lg:text-4xl">
          Smart Blood Supply Management System
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
        {currentUser ? (
          <div className="flex items-center gap-3 rounded-full border border-white/70 bg-white/70 px-4 py-2 backdrop-blur dark:border-white/10 dark:bg-white/5">
            <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-red-500 text-sm font-semibold text-white">
              {(currentUser.name || currentUser.email || 'U').slice(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold">{currentUser.name || currentUser.email}</p>
              <p className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                <ShieldCheck className="size-3.5" />
                {role}
              </p>
            </div>
          </div>
        ) : null}

        <Button variant="secondary" size="icon" onClick={onToggleDarkMode} aria-label="Toggle theme">
          {darkMode ? <SunMedium className="size-5" /> : <MoonStar className="size-5" />}
        </Button>

        <div className="relative">
          <Button variant="secondary" size="icon" onClick={() => setOpen((value) => !value)} aria-label="Notifications">
            <Bell className="size-5" />
          </Button>
          <span className="absolute right-2 top-2 size-2 rounded-full bg-rose-500" />

          {open ? (
            <Card className="absolute right-0 top-14 z-30 w-[320px] p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold">Alerts Inbox</p>
                <span className="text-xs text-muted-foreground">{notifications.length} items</span>
              </div>
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="rounded-2xl border border-white/70 bg-white/60 p-3 dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <StatusDot status={notification.type === 'warning' ? 'low' : notification.type} />
                      <p className="text-sm font-semibold">{notification.title}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.detail}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{notification.time}</p>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}
        </div>

        {currentUser ? (
          <Button variant="secondary" onClick={onLogout}>
            <LogOut className="size-4" />
            Logout
          </Button>
        ) : null}
      </div>
    </div>
  )
}

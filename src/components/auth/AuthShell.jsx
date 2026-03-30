import { HeartPulse, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '../ui/card'

export function AuthShell({ title, subtitle, alternateLabel, alternateLink, alternateText, children, demoCredentials }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(251,113,133,0.22),transparent_30%),radial-gradient(circle_at_right,rgba(251,146,60,0.15),transparent_25%),linear-gradient(180deg,#fff7f8,#fffdfd_45%,#fff7f8)] dark:bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.18),transparent_30%),radial-gradient(circle_at_right,rgba(249,115,22,0.10),transparent_25%),linear-gradient(180deg,#130f17,#18111e_45%,#110f16)]" />
      <div className="mx-auto grid min-h-screen max-w-[1500px] items-center gap-8 px-4 py-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-6">
        <section className="relative overflow-hidden rounded-[36px] border border-white/70 bg-hero-grid p-8 shadow-glow dark:border-white/10 dark:bg-dark-grid lg:p-12">
          <div className="absolute -right-16 -top-16 size-56 rounded-full bg-rose-300/35 blur-3xl dark:bg-rose-500/20" />
          <div className="absolute bottom-0 left-1/3 size-44 rounded-full bg-orange-200/50 blur-3xl dark:bg-orange-500/10" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-500 text-white shadow-glow">
                <HeartPulse className="size-7" />
              </div>
              <div>
                <p className="text-xl font-semibold">LifeFlow</p>
                <p className="text-sm text-muted-foreground">Smart Blood Supply Management</p>
              </div>
            </div>

            <div className="mt-12 inline-flex items-center gap-2 rounded-full bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700 dark:bg-white/10 dark:text-rose-200">
              <Sparkles className="size-4" />
              Hackathon-ready auth
            </div>
            <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight lg:text-6xl">
              Secure access for hospitals and consumers in one seamless flow.
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground lg:text-lg">
              Route hospitals into inventory and redistribution intelligence, while consumers get fast blood
              search, emergency support, and donor discovery.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {demoCredentials.map((credential) => (
                <div
                  key={credential.email}
                  className="rounded-[24px] border border-white/70 bg-white/65 p-4 dark:border-white/10 dark:bg-white/5"
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{credential.role}</p>
                  <p className="mt-2 font-semibold">{credential.email}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Password: {credential.password}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Card className="mx-auto w-full max-w-xl rounded-[32px] p-8 lg:p-10">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Welcome back</p>
            <h2 className="mt-3 text-3xl font-semibold">{title}</h2>
            <p className="mt-3 text-muted-foreground">{subtitle}</p>
          </div>

          {children}

          <p className="mt-6 text-sm text-muted-foreground">
            {alternateText}{' '}
            <Link to={alternateLink} className="font-semibold text-rose-600 hover:text-rose-500">
              {alternateLabel}
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}

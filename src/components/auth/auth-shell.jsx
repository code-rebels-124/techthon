import { Droplets, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "../ui/card";

export function AuthShell({ title, subtitle, footerLabel, footerLink, footerAction, children }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,117,145,0.24),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(255,205,214,0.36),transparent_30%),linear-gradient(180deg,#fff5f7_0%,#fff9fb_100%)] p-4 dark:bg-[linear-gradient(180deg,#12060a_0%,#18070d_100%)] md:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative hidden overflow-hidden rounded-[36px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_28%),linear-gradient(135deg,#8f1025_0%,#d61c3f_55%,#ff738f_100%)] p-10 text-white shadow-2xl shadow-rose-500/20 lg:flex lg:flex-col">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[24px] bg-white/16 backdrop-blur-xl">
              <Droplets className="h-7 w-7" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold">LifeFlow</p>
              <p className="text-sm text-white/80">Smart Blood Supply Management</p>
            </div>
          </div>

          <div className="mt-16 max-w-xl">
            <p className="text-sm uppercase tracking-[0.32em] text-white/65">Secure access</p>
            <h1 className="mt-5 font-display text-5xl font-bold leading-tight">
              Blood intelligence with role-based hospital and requester flows.
            </h1>
            <p className="mt-6 text-base leading-8 text-white/82">
              Sign in to manage inventory, respond to shortages, search availability, and trigger emergency blood access from one polished control center.
            </p>
          </div>

          <div className="mt-auto grid gap-4 md:grid-cols-2">
            {[
              { icon: ShieldCheck, title: "Hospital operations", description: "Track inventory, alerts, and redistribution in one place." },
              { icon: Sparkles, title: "Requester access", description: "Launch emergency requests and track matching hospitals live." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[28px] bg-white/12 p-5 backdrop-blur-xl"
                >
                  <Icon className="h-5 w-5" />
                  <p className="mt-4 font-display text-xl font-bold">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-white/75">{item.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-center">
          <Card className="w-full max-w-xl overflow-hidden">
            <CardContent className="p-8 md:p-10">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-rose-500">Account access</p>
                <h2 className="mt-4 font-display text-4xl font-bold text-strong">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted">{subtitle}</p>
              </div>

              <div className="mt-8">{children}</div>

              <p className="mt-8 text-sm text-muted">
                {footerLabel}{" "}
                <Link className="font-semibold text-rose-500 transition hover:text-rose-600" to={footerLink}>
                  {footerAction}
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

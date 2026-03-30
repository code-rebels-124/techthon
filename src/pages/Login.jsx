import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle, LogIn } from "lucide-react";
import { AuthShell } from "../components/auth/auth-shell";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";

const demoCredentials = [
  { label: "Hospital Demo", email: "hospital@test.com", password: "123456" },
  { label: "Requester Demo", email: "user@test.com", password: "123456" },
];

export function LoginPage() {
  const { login, currentUser, homeRoute } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (currentUser) {
    return <Navigate to={homeRoute} replace />;
  }

  const nextRoute = location.state?.from?.pathname ?? null;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const session = await login(form);
      navigate(nextRoute ?? (session.profile.role === "hospital" ? "/hospital" : "/consumer"), { replace: true });
    } catch (loginError) {
      setError(loginError.message || "Unable to login");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Secure access"
      subtitle="Hospitals manage isolated supply data here, while requesters can create live emergency requests from the same network."
      footerLabel="Need an account?"
      footerLink="/register"
      footerAction="Create one"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          required
        />

        {error ? (
          <div className="rounded-[22px] bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          </div>
        ) : null}

        <Button className="w-full" size="lg" type="submit" disabled={submitting}>
          <LogIn className="h-4 w-4" />
          {submitting ? "Signing in..." : "Login"}
        </Button>
      </form>

      <div className="mt-6 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">Demo access</p>
        {demoCredentials.map((demo) => (
          <button
            key={demo.label}
            type="button"
            onClick={() => setForm({ email: demo.email, password: demo.password })}
            className="glass-panel flex w-full items-center justify-between rounded-[22px] px-4 py-3 text-left transition hover:bg-white/85 dark:hover:bg-white/10"
          >
            <span>
              <span className="block text-sm font-semibold text-strong">{demo.label}</span>
              <span className="block text-xs text-muted">{demo.email} / {demo.password}</span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">Use</span>
          </button>
        ))}
      </div>
    </AuthShell>
  );
}

import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AlertTriangle, UserPlus } from "lucide-react";
import { AuthShell } from "../components/auth/auth-shell";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";

export function RegisterPage() {
  const { register, currentUser, homeRoute } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "hospital",
    city: "",
    state: "",
    hospitalType: "",
    address: "",
    contactPhone: "",
    latitude: "",
    longitude: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (currentUser) {
    return <Navigate to={homeRoute} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const session = await register(form);
      navigate(session.profile.role === "hospital" ? "/hospital" : "/consumer", { replace: true });
    } catch (registerError) {
      setError(registerError.message || "Unable to register");
    } finally {
      setSubmitting(false);
    }
  }

  const isHospital = form.role === "hospital";

  return (
    <AuthShell
      title="Create network access"
      subtitle="Hospitals appear automatically in the shared hospitals directory after signup. Requesters can create live emergency requests once registered."
      footerLabel="Already have an account?"
      footerLink="/login"
      footerAction="Login"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <select
          value={form.role}
          onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
          className="glass-panel h-11 w-full rounded-2xl border-0 px-4 text-sm text-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
        >
          <option value="hospital">Hospital</option>
          <option value="requester">Requester</option>
        </select>

        <Input
          type="text"
          placeholder={isHospital ? "Hospital name" : "Full name"}
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          required
        />
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
          minLength={6}
        />
        <Input
          type="text"
          placeholder="City"
          value={form.city}
          onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
          required
        />
        <Input
          type="text"
          placeholder="State"
          value={form.state}
          onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))}
          required={isHospital}
        />

        {isHospital ? (
          <>
            <Input
              type="text"
              placeholder="Hospital type"
              value={form.hospitalType}
              onChange={(event) => setForm((current) => ({ ...current, hospitalType: event.target.value }))}
              required
            />
            <Input
              type="text"
              placeholder="Address"
              value={form.address}
              onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
              required
            />
            <Input
              type="text"
              placeholder="Contact phone"
              value={form.contactPhone}
              onChange={(event) => setForm((current) => ({ ...current, contactPhone: event.target.value }))}
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                type="number"
                step="0.0001"
                placeholder="Latitude"
                value={form.latitude}
                onChange={(event) => setForm((current) => ({ ...current, latitude: event.target.value }))}
              />
              <Input
                type="number"
                step="0.0001"
                placeholder="Longitude"
                value={form.longitude}
                onChange={(event) => setForm((current) => ({ ...current, longitude: event.target.value }))}
              />
            </div>
          </>
        ) : null}

        {error ? (
          <div className="rounded-[22px] bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          </div>
        ) : null}

        <Button className="w-full" size="lg" type="submit" disabled={submitting}>
          <UserPlus className="h-4 w-4" />
          {submitting ? "Creating account..." : "Register"}
        </Button>
      </form>
    </AuthShell>
  );
}

import { useEffect, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { createDonor, deleteDonor, fetchDonors, updateDonor } from "../services/api";

const initialForm = {
  name: "",
  bloodGroup: "O+",
  location: "",
  phone: "",
  lastDonationDate: "",
  availability: "Ready",
};

export function DonorFinderPage() {
  const [query, setQuery] = useState("");
  const [donors, setDonors] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadDonors(search = "") {
    setLoading(true);
    try {
      const payload = await fetchDonors(search);
      setDonors(payload.items);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadDonors(query);
    }, 180);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    loadDonors();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);

    try {
      if (editingId) {
        await updateDonor(editingId, form);
      } else {
        await createDonor(form);
      }

      setForm(initialForm);
      setEditingId(null);
      await loadDonors(query);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <Card className="interactive-surface">
        <CardHeader>
          <CardTitle>Hospital Donor Network</CardTitle>
          <CardDescription>Instant search is scoped to your hospital only and matches by name, blood group, or location.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                className="pl-10"
                placeholder="Search donors instantly..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>

            <div className="grid gap-3">
              {loading ? (
                <div className="rounded-[24px] bg-white/5 p-6 text-sm text-muted">Refreshing donors...</div>
              ) : donors.length ? (
                donors.map((donor) => (
                  <div key={donor.id} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-strong">{donor.name}</p>
                        <p className="mt-1 text-sm text-muted">
                          {donor.location} | {donor.phone}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-cyan-500/15 text-cyan-300">{donor.bloodGroup}</Badge>
                        <Badge className="bg-emerald-500/15 text-emerald-300">{donor.availability}</Badge>
                      </div>
                    </div>
                    <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted">
                      Last donation {new Date(donor.lastDonationDate).toLocaleDateString()}
                    </p>
                    <div className="mt-4 flex gap-3">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditingId(donor.id);
                          setForm({
                            name: donor.name,
                            bloodGroup: donor.bloodGroup,
                            location: donor.location,
                            phone: donor.phone,
                            lastDonationDate: donor.lastDonationDate.slice(0, 10),
                            availability: donor.availability,
                          });
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={async () => {
                          await deleteDonor(donor.id);
                          await loadDonors(query);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] bg-white/5 p-6 text-sm text-muted">No donors match this search yet.</div>
              )}
            </div>
          </div>

          <form className="space-y-4 rounded-[28px] border border-white/10 bg-black/20 p-5" onSubmit={handleSubmit}>
            <p className="font-display text-xl font-bold text-strong">{editingId ? "Update donor" : "Add donor"}</p>
            <Input placeholder="Donor name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
            <div className="grid gap-4 sm:grid-cols-2">
              <select
                value={form.bloodGroup}
                onChange={(event) => setForm((current) => ({ ...current, bloodGroup: event.target.value }))}
                className="glass-panel h-11 w-full rounded-2xl border-0 px-4 text-sm text-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
              >
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
              <Input placeholder="Location" value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} required />
            </div>
            <Input placeholder="Phone number" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} required />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input type="date" value={form.lastDonationDate} onChange={(event) => setForm((current) => ({ ...current, lastDonationDate: event.target.value }))} />
              <select
                value={form.availability}
                onChange={(event) => setForm((current) => ({ ...current, availability: event.target.value }))}
                className="glass-panel h-11 w-full rounded-2xl border-0 px-4 text-sm text-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
              >
                <option value="Ready">Ready</option>
                <option value="Review">Review</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </div>
            <div className="flex gap-3">
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update donor" : "Add donor"}
              </Button>
              {editingId ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setEditingId(null);
                    setForm(initialForm);
                  }}
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

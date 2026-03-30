import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { getStatusTone } from "../lib/utils";

export function HospitalsPage() {
  const { hospitals, isLoading } = useOutletContext();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [bloodGroup, setBloodGroup] = useState("all");

  const filtered = useMemo(() => {
    return hospitals.filter((hospital) => {
      const safeHospital = {
        name: hospital?.name ?? "",
        city: hospital?.city ?? "",
        state: hospital?.state ?? "",
        inventory: Array.isArray(hospital?.inventory) ? hospital.inventory : [],
        status: hospital?.status ?? "safe",
      };
      const inventoryText = safeHospital.inventory.map((item) => `${item.bloodGroup} ${item.units}`).join(" ");
      const matchesQuery =
        safeHospital.name.toLowerCase().includes(query.toLowerCase()) ||
        safeHospital.city.toLowerCase().includes(query.toLowerCase()) ||
        safeHospital.state.toLowerCase().includes(query.toLowerCase()) ||
        inventoryText.toLowerCase().includes(query.toLowerCase());
      const matchesFilter = filter === "all" ? true : safeHospital.status === filter;
      const selectedStock =
        bloodGroup === "all" ? null : safeHospital.inventory.find((item) => item.bloodGroup === bloodGroup);
      const matchesGroup = bloodGroup === "all" ? true : (selectedStock?.units ?? 0) > 0;
      return matchesQuery && matchesFilter && matchesGroup;
    });
  }, [bloodGroup, filter, hospitals, query]);

  return (
    <div className="space-y-5">
      <Card className="interactive-surface">
        <CardHeader className="flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Registered Hospitals</CardTitle>
            <CardDescription>New hospitals appear here automatically after registration, with live stock summaries drawn from the shared backend store.</CardDescription>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-[260px]">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-10" placeholder="Search by hospital, city, blood group..." />
            </div>
            <select
              value={bloodGroup}
              onChange={(event) => setBloodGroup(event.target.value)}
              className="glass-panel h-11 rounded-2xl border-0 px-4 text-sm text-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              <option value="all">All blood groups</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
            <div className="glass-panel flex rounded-2xl p-1">
              {["all", "safe", "low", "critical"].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFilter(option)}
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold capitalize transition ${
                    filter === option ? "bg-rose-500 text-white" : "text-muted"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => <Card key={index} className="h-60 animate-pulse" />)
          : filtered.map((hospital) => (
              <Card key={hospital.id} className="interactive-surface">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="font-display text-2xl font-bold text-strong">{hospital.name}</p>
                        <Badge className={getStatusTone(hospital.status)}>{hospital.status}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted">
                        {hospital.city}, {hospital.state ?? "Unknown"} | {hospital.hospitalType ?? hospital.type ?? "Hospital"}
                      </p>
                      <p className="mt-1 text-sm text-muted">{hospital.address}</p>
                      <p className="mt-1 text-sm text-muted">Contact: {hospital.contactPhone || hospital.contactEmail || "N/A"}</p>
                    </div>
                    <div className="rounded-2xl bg-white/60 px-4 py-3 text-right text-sm dark:bg-white/6">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">Total stock</p>
                      <p className="mt-1 font-display text-2xl font-bold text-strong">{hospital.totalUnits}</p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-4 gap-3 sm:grid-cols-8">
                    {hospital.inventory.map((item) => (
                      <div key={`${hospital.id}-${item.bloodGroup}`} className="rounded-2xl bg-white/60 p-3 text-center dark:bg-white/6">
                        <p className="font-display text-base font-bold text-strong">{item.bloodGroup}</p>
                        <p className="mt-2 text-sm font-semibold text-rose-400">{item.units}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  );
}

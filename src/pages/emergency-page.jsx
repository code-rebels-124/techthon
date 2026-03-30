import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { createEmergencyRequest, respondToEmergencyRequest } from "../services/api";
import { getStatusTone } from "../lib/utils";

const emergencyDefaults = {
  bloodGroup: "O-",
  unitsNeeded: 1,
  location: "",
  contactNumber: "",
  notes: "",
};

export function EmergencyPage() {
  const { role, emergencyFeed, refetch } = useOutletContext();
  const [form, setForm] = useState(emergencyDefaults);
  const [submitting, setSubmitting] = useState(false);
  const [actingId, setActingId] = useState(null);
  const [matches, setMatches] = useState([]);

  async function handleRequestSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const payload = await createEmergencyRequest({
        ...form,
        unitsNeeded: Number(form.unitsNeeded),
      });

      setMatches(payload.matches);
      setForm(emergencyDefaults);
      await refetch();
    } finally {
      setSubmitting(false);
    }
  }

  if (role === "hospital") {
    return (
      <div className="space-y-5">
        <Card className="interactive-surface">
          <CardHeader>
            <CardTitle>Emergency Response Queue</CardTitle>
            <CardDescription>Only requests relevant to your hospital stock appear here. Accepting a request reserves units immediately.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 xl:grid-cols-2">
            {emergencyFeed.length ? (
              emergencyFeed.map((request) => (
                <div key={request.id} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-strong">
                        {request.bloodGroup} needed in {request.location}
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        {request.unitsNeeded} units | requested by {request.requesterName}
                      </p>
                    </div>
                    <Badge className={getStatusTone(request.status === "active" ? "critical" : request.status === "accepted" ? "low" : "safe")}>
                      {request.status}
                    </Badge>
                  </div>

                  {request.hospitalMatch ? (
                    <p className="mt-3 text-sm text-muted">
                      Your stock: {request.hospitalMatch.availableUnits} units | Distance: {request.hospitalMatch.distance ?? "N/A"} km
                    </p>
                  ) : null}

                  <p className="mt-3 text-sm text-muted">{request.notes || "No extra clinical notes supplied."}</p>

                  <div className="mt-4 flex gap-3">
                    {request.status === "active" ? (
                      <Button
                        size="sm"
                        onClick={async () => {
                          setActingId(request.id);
                          try {
                            await respondToEmergencyRequest(request.id, "accept");
                            await refetch();
                          } finally {
                            setActingId(null);
                          }
                        }}
                        disabled={actingId === request.id}
                      >
                        {actingId === request.id ? "Accepting..." : "Accept request"}
                      </Button>
                    ) : null}

                    {request.status === "accepted" && request.acceptedByHospitalId ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={async () => {
                          setActingId(request.id);
                          try {
                            await respondToEmergencyRequest(request.id, "complete");
                            await refetch();
                          } finally {
                            setActingId(null);
                          }
                        }}
                        disabled={actingId === request.id}
                      >
                        {actingId === request.id ? "Completing..." : "Mark completed"}
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 text-sm text-muted">
                No active emergency requests match your current stock.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="interactive-surface">
        <CardHeader>
          <CardTitle>Create Emergency Request</CardTitle>
          <CardDescription>Submit blood group, units, and location. Matching hospitals are returned instantly from live inventory.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <form className="space-y-4 rounded-[28px] border border-white/10 bg-black/20 p-5" onSubmit={handleRequestSubmit}>
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
              <Input
                type="number"
                min="1"
                value={form.unitsNeeded}
                onChange={(event) => setForm((current) => ({ ...current, unitsNeeded: event.target.value }))}
                required
              />
            </div>
            <Input placeholder="Location" value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} required />
            <Input placeholder="Contact number" value={form.contactNumber} onChange={(event) => setForm((current) => ({ ...current, contactNumber: event.target.value }))} required />
            <textarea
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              placeholder="Clinical notes"
              className="glass-panel min-h-28 w-full rounded-2xl border-0 px-4 py-3 text-sm text-strong placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            />
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Launch emergency request"}
            </Button>
          </form>

          <div className="space-y-3">
            <p className="font-display text-xl font-bold text-strong">Matching Hospitals</p>
            {(matches.length ? matches : emergencyFeed[0]?.matches ?? []).length ? (
              (matches.length ? matches : emergencyFeed[0]?.matches ?? []).map((hospital) => (
                <div key={hospital.id} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-strong">{hospital.name}</p>
                    <Badge className={getStatusTone(hospital.status)}>{hospital.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted">
                    {hospital.city} | {hospital.availableUnits} units available
                    {hospital.distance !== null ? ` | ${hospital.distance} km` : ""}
                  </p>
                  <p className="mt-1 text-sm text-muted">{hospital.address}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 text-sm text-muted">
                Submit a request to see matching hospitals.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="interactive-surface">
        <CardHeader>
          <CardTitle>Request Timeline</CardTitle>
          <CardDescription>Every request stays connected to the live matching engine until a hospital accepts it.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 xl:grid-cols-2">
          {emergencyFeed.length ? (
            emergencyFeed.map((request) => (
              <div key={request.id} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-strong">
                    {request.bloodGroup} request in {request.location}
                  </p>
                  <Badge className={getStatusTone(request.status === "active" ? "critical" : request.status === "accepted" ? "low" : "safe")}>
                    {request.status}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted">{request.unitsNeeded} units requested</p>
                <p className="mt-2 text-sm text-muted">
                  {request.acceptedHospital
                    ? `Accepted by ${request.acceptedHospital}`
                    : `${request.matches.length} hospitals currently match this request.`}
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 text-sm text-muted">
              You have not created any emergency requests yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

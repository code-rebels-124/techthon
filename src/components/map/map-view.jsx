import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer, Circle, ZoomControl } from "react-leaflet";
import { divIcon } from "leaflet";
import { AnimatePresence, motion } from "framer-motion";
import { Crosshair, Droplets, LocateFixed, MapPin, Radar, TriangleAlert } from "lucide-react";
import { fetchNearbyHospitals } from "../../services/api";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { getStatusTone } from "../../lib/utils";

const INDIA_CENTER = [22.9734, 78.6569];
const BLOOD_GROUPS = ["all", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function getMarkerColor(status) {
  if (status === "critical") return "#ff516f";
  if (status === "low") return "#fbbf24";
  return "#34d399";
}

function createHospitalIcon(status, isNearby) {
  const color = getMarkerColor(status);
  const glow = isNearby ? "0 0 24px rgba(34,211,238,0.85)" : `0 0 20px ${color}88`;
  const ring = isNearby ? "rgba(34,211,238,0.26)" : `${color}33`;

  return divIcon({
    className: "lifeflow-marker",
    html: `
      <div style="
        width: 22px;
        height: 22px;
        border-radius: 999px;
        background: ${color};
        border: 2px solid rgba(255,255,255,0.95);
        box-shadow: ${glow}, 0 0 0 8px ${ring};
      "></div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
  });
}

function createUserIcon() {
  return divIcon({
    className: "lifeflow-user-marker",
    html: `
      <div style="
        width: 18px;
        height: 18px;
        border-radius: 999px;
        background: #22d3ee;
        border: 2px solid rgba(255,255,255,0.95);
        box-shadow: 0 0 22px rgba(34,211,238,0.9), 0 0 0 8px rgba(34,211,238,0.24);
      "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
  });
}

function getAvailabilityLabel(units) {
  if (units <= 0) return "empty";
  if (units <= 10) return "critical";
  if (units <= 25) return "limited";
  return "available";
}

function getPrimaryBloodSummary(hospital) {
  return (hospital.inventory ?? [])
    .slice()
    .sort((a, b) => b.units - a.units)
    .slice(0, 4);
}

export function MapView({ hospitals = [], isLoading = false }) {
  const navigate = useNavigate();
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("all");
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [locationState, setLocationState] = useState({ loading: false, error: "" });

  useEffect(() => {
    let active = true;

    if (!userLocation) {
      setNearbyHospitals([]);
      return undefined;
    }

    fetchNearbyHospitals({ lat: userLocation.lat, lng: userLocation.lng, limit: 6 })
      .then((payload) => {
        if (active) {
          setNearbyHospitals(payload.items ?? []);
        }
      })
      .catch((error) => {
        if (active) {
          setLocationState((current) => ({
            ...current,
            error: error.message || "Could not load nearby hospitals.",
          }));
        }
      });

    return () => {
      active = false;
    };
  }, [userLocation]);

  const filteredHospitals = useMemo(() => {
    return hospitals.filter((hospital) => {
      if (selectedBloodGroup === "all") return true;
      return (hospital.inventory ?? []).some(
        (item) => item.bloodGroup === selectedBloodGroup && Number(item.units) > 0,
      );
    });
  }, [hospitals, selectedBloodGroup]);

  const nearbyIds = useMemo(
    () => new Set((nearbyHospitals ?? []).map((hospital) => hospital.id)),
    [nearbyHospitals],
  );

  const totalVisibleUnits = useMemo(
    () =>
      filteredHospitals.reduce(
        (sum, hospital) =>
          sum +
          (selectedBloodGroup === "all"
            ? Number(hospital.totalUnits ?? 0)
            : Number(
                (hospital.inventory ?? []).find((item) => item.bloodGroup === selectedBloodGroup)?.units ?? 0,
              )),
        0,
      ),
    [filteredHospitals, selectedBloodGroup],
  );

  const emergencyHotspots = useMemo(
    () => filteredHospitals.filter((hospital) => hospital.status === "critical").slice(0, 3),
    [filteredHospitals],
  );

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationState({ loading: false, error: "Browser geolocation is not available on this device." });
      return;
    }

    setLocationState({ loading: true, error: "" });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationState({ loading: false, error: "" });
      },
      (error) => {
        setLocationState({
          loading: false,
          error:
            error.code === error.PERMISSION_DENIED
              ? "Location access was denied."
              : "Could not determine your location.",
        });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 120000 },
    );
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[1.5fr_0.7fr]">
      <Card className="interactive-surface min-w-0 overflow-hidden">
        <CardHeader className="flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Hospital map network</CardTitle>
            <CardDescription>
              Live OpenStreetMap view of registered hospitals, blood stock health, and nearest facilities.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-400/20">
              OpenStreetMap + Leaflet
            </Badge>
            <Button variant="secondary" onClick={requestLocation} disabled={locationState.loading}>
              <LocateFixed className="mr-2 h-4 w-4" />
              {locationState.loading ? "Locating..." : "Use my location"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
          <div className="flex flex-wrap gap-2">
            {BLOOD_GROUPS.map((group) => (
              <button
                key={group}
                type="button"
                onClick={() => setSelectedBloodGroup(group)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  selectedBloodGroup === group
                    ? "bg-rose-500 text-white shadow-[0_0_20px_rgba(255,102,143,0.35)]"
                    : "glass-panel text-muted"
                }`}
              >
                {group === "all" ? "All groups" : group}
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="glass-panel rounded-[24px] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted">Visible hospitals</p>
              <p className="mt-2 font-display text-3xl font-bold text-strong">{filteredHospitals.length}</p>
            </div>
            <div className="glass-panel rounded-[24px] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted">
                {selectedBloodGroup === "all" ? "Total mapped units" : `${selectedBloodGroup} units`}
              </p>
              <p className="mt-2 font-display text-3xl font-bold text-strong">{totalVisibleUnits}</p>
            </div>
            <div className="glass-panel rounded-[24px] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted">Nearest hospitals</p>
              <p className="mt-2 font-display text-3xl font-bold text-strong">{nearbyHospitals.length}</p>
            </div>
          </div>

          <div className="relative h-[660px] overflow-hidden rounded-[30px] border border-white/10 bg-[#05070d]">
            {isLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-muted">
                Loading hospital map...
              </div>
            ) : (
              <MapContainer
                center={INDIA_CENTER}
                zoom={5}
                zoomControl={false}
                scrollWheelZoom
                className="h-full w-full"
              >
                <ZoomControl position="bottomright" />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {filteredHospitals.map((hospital) => (
                  <Marker
                    key={hospital.id}
                    position={[hospital.latitude ?? hospital.coordinates?.lat ?? 0, hospital.longitude ?? hospital.coordinates?.lng ?? 0]}
                    icon={createHospitalIcon(hospital.status, nearbyIds.has(hospital.id))}
                  >
                    <Popup>
                      <div className="min-w-[240px] space-y-3">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{hospital.name}</p>
                          <p className="text-xs text-slate-500">
                            {hospital.city}, {hospital.state}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge className={getStatusTone(hospital.status)}>{hospital.status}</Badge>
                          <span className="text-xs font-semibold text-slate-500">
                            {hospital.totalUnits} units total
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {getPrimaryBloodSummary(hospital).map((item) => (
                            <div key={`${hospital.id}-${item.bloodGroup}`} className="rounded-xl bg-slate-100 px-3 py-2">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                {item.bloodGroup}
                              </p>
                              <p className="mt-1 text-sm font-bold text-slate-900">{item.units} units</p>
                            </div>
                          ))}
                        </div>

                        <Button className="w-full" onClick={() => navigate("/hospitals")}>
                          View Details
                        </Button>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {userLocation ? (
                  <>
                    <Circle
                      center={[userLocation.lat, userLocation.lng]}
                      radius={18000}
                      pathOptions={{ color: "#22d3ee", opacity: 0.9, fillColor: "#22d3ee", fillOpacity: 0.12 }}
                    />
                    <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserIcon()}>
                      <Popup>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-900">Your location</p>
                          <p className="text-xs text-slate-500">Nearest hospitals are highlighted in cyan glow.</p>
                        </div>
                      </Popup>
                    </Marker>
                  </>
                ) : null}
              </MapContainer>
            )}

            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#05070d] to-transparent" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-5">
        <Card className="interactive-surface">
          <CardHeader>
            <CardTitle>Nearest hospitals</CardTitle>
            <CardDescription>
              Browser geolocation keeps this list focused on the closest available hospitals.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {locationState.error ? (
              <div className="rounded-[24px] border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                {locationState.error}
              </div>
            ) : null}

            {!userLocation ? (
              <div className="glass-panel rounded-[24px] px-4 py-5 text-sm text-muted">
                Share your location to rank nearby hospitals by distance.
              </div>
            ) : null}

            <AnimatePresence initial={false}>
              {nearbyHospitals.map((hospital) => (
                <motion.div
                  key={hospital.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass-panel rounded-[24px] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-strong">{hospital.name}</p>
                      <p className="mt-1 text-sm text-muted">
                        {hospital.city}, {hospital.state}
                      </p>
                    </div>
                    <Badge className={getStatusTone(hospital.status)}>
                      {hospital.distanceKm ?? "--"} km
                    </Badge>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {getPrimaryBloodSummary(hospital).map((item) => (
                      <span key={`${hospital.id}-${item.bloodGroup}`} className="rounded-full bg-white/10 px-3 py-1 text-xs text-strong">
                        {item.bloodGroup}: {item.units}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </CardContent>
        </Card>

        <Card className="interactive-surface">
          <CardHeader>
            <CardTitle>Emergency resources active</CardTitle>
            <CardDescription>Critical hospitals stay surfaced so shortages are visible instantly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {emergencyHotspots.length ? (
              emergencyHotspots.map((hospital) => (
                <div
                  key={hospital.id}
                  className="rounded-[24px] border border-rose-500/20 bg-rose-500/10 px-4 py-4 shadow-[0_0_30px_rgba(255,81,111,0.12)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-strong">{hospital.name}</p>
                      <p className="mt-1 text-sm text-muted">
                        {hospital.city}, {hospital.state}
                      </p>
                    </div>
                    <TriangleAlert className="h-5 w-5 text-rose-300" />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {getPrimaryBloodSummary(hospital).map((item) => (
                      <span key={`${hospital.id}-critical-${item.bloodGroup}`} className="rounded-full bg-black/20 px-3 py-1 text-xs text-rose-50">
                        {item.bloodGroup}: {getAvailabilityLabel(item.units)}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-panel rounded-[24px] px-4 py-5 text-sm text-muted">
                No critical map hotspots right now.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="interactive-surface">
          <CardHeader>
            <CardTitle>Legend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-3 text-muted">
              <span className="h-3.5 w-3.5 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.7)]" />
              Green markers indicate healthy stock.
            </div>
            <div className="flex items-center gap-3 text-muted">
              <span className="h-3.5 w-3.5 rounded-full bg-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.7)]" />
              Yellow markers indicate medium or tightening reserves.
            </div>
            <div className="flex items-center gap-3 text-muted">
              <span className="h-3.5 w-3.5 rounded-full bg-rose-500 shadow-[0_0_18px_rgba(255,81,111,0.8)]" />
              Red markers indicate low stock and urgent attention.
            </div>
            <div className="flex items-center gap-3 text-muted">
              <span className="h-3.5 w-3.5 rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.85)]" />
              Cyan glow marks hospitals nearest to your location.
            </div>
            <div className="glass-panel rounded-[24px] p-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-cyan-300" />
                <Crosshair className="h-4 w-4 text-rose-300" />
                <Droplets className="h-4 w-4 text-emerald-300" />
                <Radar className="h-4 w-4 text-amber-300" />
              </div>
              <p className="mt-3 text-sm text-muted">
                This map uses only free technologies: browser geolocation, Leaflet, and OpenStreetMap tiles.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

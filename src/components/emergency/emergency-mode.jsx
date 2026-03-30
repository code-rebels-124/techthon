import { Clock3, MapPin, Siren, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { getNearestHospitals } from "../../utils/blood-logic";

const bloodOptions = ["O-", "O+", "A+", "A-", "B+", "B-", "AB+", "AB-"];

export function EmergencyMode({ hospitals }) {
  const [requestedGroup, setRequestedGroup] = useState("O-");
  const [active, setActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(180);

  useEffect(() => {
    if (!active) {
      setSecondsLeft(180);
      return undefined;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((value) => (value > 0 ? value - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [active]);

  const nearestHospitals = useMemo(
    () => getNearestHospitals(hospitals, requestedGroup).slice(0, 3),
    [hospitals, requestedGroup],
  );

  const bestOption = nearestHospitals[0];
  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardContent className="relative min-h-[460px] p-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_30%),linear-gradient(135deg,#7f0918_0%,#c81e3a_45%,#ff5a70_100%)]" />
          <div className="relative flex min-h-[460px] flex-col justify-between p-8 text-white md:p-10">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">Emergency mode</p>
                <h2 className="mt-4 max-w-2xl font-display text-4xl font-bold tracking-tight md:text-5xl">
                  REQUEST EMERGENCY BLOOD
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-white/80">
                  Trigger rapid hospital matching, rank the best responders, and surface the fastest compatible source instantly.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {bloodOptions.map((group) => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => setRequestedGroup(group)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      requestedGroup === group ? "bg-white text-rose-600" : "bg-white/12 text-white hover:bg-white/18"
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_0.72fr]">
              <div className="flex items-center justify-center">
                <motion.div
                  animate={{ scale: active ? [1, 1.06, 1] : 1 }}
                  transition={{ repeat: active ? Number.POSITIVE_INFINITY : 0, duration: 1.6 }}
                  className="rounded-full bg-white/10 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl"
                >
                  <Button
                    size="lg"
                    className="h-48 w-48 rounded-full bg-white text-red-600 hover:bg-white/90"
                    onClick={() => setActive(true)}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <Siren className="h-10 w-10" />
                      <span className="max-w-[10rem] text-center text-base font-extrabold leading-5">
                        REQUEST EMERGENCY BLOOD
                      </span>
                    </div>
                  </Button>
                </motion.div>
              </div>

              <div className="space-y-4 rounded-[30px] bg-white/12 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-white/65">Fastest response identified</p>
                    <p className="mt-2 font-display text-2xl font-bold">
                      {bestOption ? bestOption.name : "Awaiting trigger"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/10 px-4 py-3 text-right">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/60">Countdown</p>
                    <p className="mt-1 font-display text-2xl font-bold">{minutes}:{seconds}</p>
                  </div>
                </div>

                {bestOption ? (
                  <div className="rounded-[24px] bg-white/10 p-4">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <p className="text-sm font-semibold">Suggested best option</p>
                    </div>
                    <p className="mt-3 text-lg font-bold">{bestOption.name}</p>
                    <p className="mt-2 text-sm text-white/80">
                      {bestOption.requestedUnits} units of {requestedGroup} available • {bestOption.routeDistance} km away
                    </p>
                  </div>
                ) : null}

                <div className="space-y-3">
                  {nearestHospitals.map((hospital, index) => (
                    <div key={hospital.id} className="rounded-[24px] bg-white/10 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">#{index + 1} {hospital.name}</p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-white/75">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{hospital.city}</span>
                            <Clock3 className="ml-2 h-3.5 w-3.5" />
                            <span>{hospital.routeDistance} km</span>
                          </div>
                        </div>
                        <div className="rounded-2xl bg-white/12 px-4 py-2 text-right">
                          <p className="text-xs uppercase tracking-[0.18em] text-white/65">{requestedGroup}</p>
                          <p className="text-lg font-bold">{hospital.requestedUnits} units</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

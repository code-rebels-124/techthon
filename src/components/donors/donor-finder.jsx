import { Droplets, MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

const bloodOptions = ["All", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function DonorFinder({ donors }) {
  const [filter, setFilter] = useState("All");

  const filteredDonors = useMemo(() => {
    if (filter === "All") {
      return donors;
    }

    return donors.filter((donor) => donor.bloodGroup === filter);
  }, [donors, filter]);

  return (
    <Card>
      <CardHeader className="flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Donor finder</CardTitle>
          <CardDescription>Mock donor network filtered by blood group and response distance.</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          {bloodOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === option
                  ? "bg-rose-500 text-white"
                  : "glass-panel text-muted hover:bg-white/80 dark:hover:bg-white/10"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredDonors.map((donor, index) => (
          <motion.div
            key={donor.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="rounded-[26px] bg-white/60 p-5 transition hover:-translate-y-1 hover:bg-white/85 dark:bg-white/6 dark:hover:bg-white/10"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-display text-xl font-bold text-strong">{donor.name}</p>
                <div className="mt-2 flex items-center gap-2 text-sm text-muted">
                  <MapPin className="h-4 w-4 text-rose-500" />
                  {donor.city}
                </div>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-rose-500 to-red-500 px-4 py-3 text-center text-white shadow-lg shadow-rose-500/20">
                <Droplets className="mx-auto h-4 w-4" />
                <p className="mt-1 text-sm font-bold">{donor.bloodGroup}</p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-[22px] bg-white/70 px-4 py-3 text-sm dark:bg-white/8">
              <span className="text-muted">{donor.distance} km away</span>
              <span className="font-semibold text-strong">{donor.availability}</span>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}

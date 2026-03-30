import { useMemo, useState } from "react";
import { CheckCircle2, RefreshCcw } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

export function HospitalInventoryPanel({ inventory }) {
  const [selectedGroup, setSelectedGroup] = useState(inventory[0]?.group ?? "A+");
  const [newUnits, setNewUnits] = useState(inventory[0]?.units ?? 0);
  const [message, setMessage] = useState("");

  const selected = useMemo(
    () => inventory.find((item) => item.group === selectedGroup) ?? inventory[0],
    [inventory, selectedGroup],
  );

  function handleSave() {
    setMessage(`Updated ${selectedGroup} stock from ${selected.units} to ${newUnits} units in demo mode.`);
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Hospital inventory update</CardTitle>
          <CardDescription>Quick demo controls for hospital operators to simulate stock updates.</CardDescription>
        </div>
        <Button variant="secondary">
          <RefreshCcw className="h-4 w-4" />
          Live sync
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-[0.8fr_0.7fr_0.5fr]">
        <select
          value={selectedGroup}
          onChange={(event) => {
            setSelectedGroup(event.target.value);
            const next = inventory.find((item) => item.group === event.target.value);
            setNewUnits(next?.units ?? 0);
          }}
          className="glass-panel h-11 rounded-2xl border-0 px-4 text-sm text-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
        >
          {inventory.map((item) => (
            <option key={item.group} value={item.group}>
              {item.group}
            </option>
          ))}
        </select>

        <input
          type="number"
          value={newUnits}
          onChange={(event) => setNewUnits(Number(event.target.value))}
          className="glass-panel h-11 rounded-2xl border-0 px-4 text-sm text-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
        />

        <Button onClick={handleSave}>Save update</Button>

        <div className="xl:col-span-3 rounded-[24px] bg-white/60 p-4 dark:bg-white/6">
          <p className="text-sm font-semibold text-strong">
            Current stock for {selectedGroup}: {selected?.units ?? 0} units
          </p>
          <p className="mt-2 text-sm text-muted">
            This hackathon demo keeps inventory updates local to the interface for speed and reliability.
          </p>
          {message ? (
            <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              {message}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

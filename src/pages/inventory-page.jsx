import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Save, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { clearInventory, updateInventory } from "../services/api";
import { getStatusTone } from "../lib/utils";

export function InventoryPage() {
  const { dashboardData, isLoading, refetch } = useOutletContext();
  const [drafts, setDrafts] = useState({});
  const [savingId, setSavingId] = useState(null);

  const inventory = dashboardData?.inventory ?? [];

  const values = useMemo(() => {
    const map = {};

    for (const item of inventory) {
      map[item.id] = drafts[item.id] ?? String(item.units);
    }

    return map;
  }, [drafts, inventory]);

  if (isLoading || !dashboardData) {
    return <div className="rounded-[28px] bg-white/5 p-10 text-center text-muted">Loading inventory grid...</div>;
  }

  return (
    <div className="space-y-5">
      <Card className="interactive-surface">
        <CardHeader>
          <CardTitle>Blood Inventory Management</CardTitle>
          <CardDescription>Add, update, or clear stock by blood type. Changes flow through the dashboard and emergency matching automatically.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {inventory.map((item) => (
          <Card key={item.id} className="interactive-surface">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="font-display text-3xl font-bold text-strong">{item.bloodGroup}</p>
                <Badge className={getStatusTone(item.status)}>{item.status}</Badge>
              </div>

              <p className="mt-2 text-sm text-muted">Threshold {item.threshold} units</p>

              <Input
                type="number"
                min="0"
                className="mt-4"
                value={values[item.id] ?? ""}
                onChange={(event) => setDrafts((current) => ({ ...current, [item.id]: event.target.value }))}
              />

              <div className="mt-4 flex gap-3">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={async () => {
                    setSavingId(item.id);
                    try {
                      await updateInventory(item.id, Number(values[item.id] ?? item.units));
                      await refetch();
                    } finally {
                      setSavingId(null);
                    }
                  }}
                  disabled={savingId === item.id}
                >
                  <Save className="h-4 w-4" />
                  {savingId === item.id ? "Saving..." : "Save"}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-1"
                  onClick={async () => {
                    setSavingId(item.id);
                    try {
                      await clearInventory(item.id);
                      setDrafts((current) => ({ ...current, [item.id]: "0" }));
                      await refetch();
                    } finally {
                      setSavingId(null);
                    }
                  }}
                  disabled={savingId === item.id}
                >
                  <Trash2 className="h-4 w-4" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

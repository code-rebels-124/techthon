import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

const palette = ["#db3056", "#ee5a77", "#fb7185", "#fca5a5", "#fdba74", "#facc15", "#86efac", "#34d399"];

export function StockBarChart({ data }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Stock level comparison</CardTitle>
        <CardDescription>Current available units by blood type across the network.</CardDescription>
      </CardHeader>
      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(219, 48, 86, 0.12)" />
            <XAxis dataKey="group" tickLine={false} axisLine={false} tick={{ fill: "currentColor", fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "currentColor", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.25)",
                background: "rgba(24, 10, 15, 0.88)",
                color: "#fff",
              }}
            />
            <Bar dataKey="units" radius={[14, 14, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={entry.group} fill={palette[index % palette.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

export function DemandLineChart({ data }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Demand trend forecast</CardTitle>
        <CardDescription>Seven-day historical demand plus projected next-day movement.</CardDescription>
      </CardHeader>
      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(219, 48, 86, 0.12)" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "currentColor", fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "currentColor", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.25)",
                background: "rgba(24, 10, 15, 0.88)",
                color: "#fff",
              }}
            />
            <Line type="monotone" dataKey="demand" stroke="#db3056" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="projected" stroke="#ff9cb5" strokeWidth={2} strokeDasharray="5 6" dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

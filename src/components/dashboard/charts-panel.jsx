import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

export function ChartsPanel({ demandHistory, inventorySummary }) {
  return (
    <section className="grid min-w-0 gap-6 xl:grid-cols-[1.5fr_1fr]">
      <Card className="min-w-0">
        <CardHeader>
          <div>
            <CardDescription>Demand trends</CardDescription>
            <CardTitle className="mt-2">Weekly demand pulse</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="h-[320px] min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={320}>
            <LineChart data={demandHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
              <XAxis dataKey="day" stroke="currentColor" tick={{ fill: 'currentColor', opacity: 0.6 }} />
              <YAxis stroke="currentColor" tick={{ fill: 'currentColor', opacity: 0.6 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: '18px',
                  border: '1px solid rgba(255,255,255,0.16)',
                  background: 'rgba(15,23,42,0.9)',
                  color: '#fff',
                }}
              />
              <Line type="monotone" dataKey="OPlus" stroke="#e11d48" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="APlus" stroke="#fb7185" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="ONeg" stroke="#f97316" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="min-w-0">
        <CardHeader>
          <div>
            <CardDescription>Stock levels</CardDescription>
            <CardTitle className="mt-2">Network inventory</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="h-[320px] min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={320}>
            <BarChart data={inventorySummary}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
              <XAxis dataKey="group" stroke="currentColor" tick={{ fill: 'currentColor', opacity: 0.6 }} />
              <YAxis stroke="currentColor" tick={{ fill: 'currentColor', opacity: 0.6 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: '18px',
                  border: '1px solid rgba(255,255,255,0.16)',
                  background: 'rgba(15,23,42,0.9)',
                  color: '#fff',
                }}
              />
              <Bar dataKey="units" radius={[14, 14, 0, 0]} fill="url(#stockGradient)" />
              <defs>
                <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.95} />
                  <stop offset="95%" stopColor="#fb7185" stopOpacity={0.55} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </section>
  )
}

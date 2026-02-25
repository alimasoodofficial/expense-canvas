import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const monthlyData = [
  { month: "Sep", amount: 52000 },
  { month: "Oct", amount: 61000 },
  { month: "Nov", amount: 58000 },
  { month: "Dec", amount: 72000 },
  { month: "Jan", amount: 65000 },
  { month: "Feb", amount: 70300 },
];

const MonthlyChart = () => {
  return (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Monthly Spending</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{ fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} contentStyle={{ borderRadius: "0.75rem", border: "none", boxShadow: "var(--shadow-md)" }} />
              <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyChart;

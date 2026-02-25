import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Expense } from "@/lib/expense-data";
import { format, parseISO, subMonths } from "date-fns";
import { useCurrency } from "@/hooks/useCurrency";

interface MonthlyChartProps {
  expenses: Expense[];
}

const MonthlyChart = ({ expenses }: MonthlyChartProps) => {
  const { currency, formatAmount } = useCurrency();
  const monthlyData = useMemo(() => {
    const data: Record<string, number> = {};
    const result = [];

    // Initialize the last 6 months buckets
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(new Date(), i);
      const monthStr = format(d, "MMM");
      data[monthStr] = 0;
    }

    // Accumulate total expense amounts
    expenses.forEach((expense) => {
      if (!expense.date) return;

      try {
        const d = parseISO(expense.date);
        const monthStr = format(d, "MMM");

        // Only tally if it's within the last 6 months buckets we created
        if (data[monthStr] !== undefined) {
          data[monthStr] += expense.amount;
        }
      } catch (e) {
        // Safe wrap around date parsing
      }
    });

    for (const [month, amount] of Object.entries(data)) {
      result.push({ month, amount });
    }

    return result;
  }, [expenses]);

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
              <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{ fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => {
                if (currency === "PKR") return `Rs ${v / 1000}k`;
                if (currency === "USD") return `$${v / 1000}k`;
                if (currency === "EUR") return `€${v / 1000}k`;
                if (currency === "GBP") return `£${v / 1000}k`;
                return `${v / 1000}k`;
              }} />
              <Tooltip formatter={(value: number) => formatAmount(value)} contentStyle={{ borderRadius: "0.75rem", border: "none", boxShadow: "var(--shadow-md)" }} />
              <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyChart;

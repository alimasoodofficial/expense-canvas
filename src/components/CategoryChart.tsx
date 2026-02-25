import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Expense, CATEGORIES, CATEGORY_COLORS, CATEGORY_BG } from "@/lib/expense-data";

interface CategoryChartProps {
  expenses: Expense[];
}

const CategoryChart = ({ expenses }: CategoryChartProps) => {
  const data = CATEGORIES.map((cat) => ({
    name: cat,
    value: expenses.filter((e) => e.category === cat).reduce((sum, e) => sum + e.amount, 0),
  })).filter((d) => d.value > 0);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="w-40 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2">
            {data.slice(0, 5).map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full`} style={{ backgroundColor: CATEGORY_COLORS[item.name as keyof typeof CATEGORY_COLORS] }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-mono font-medium text-foreground">{((item.value / total) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryChart;

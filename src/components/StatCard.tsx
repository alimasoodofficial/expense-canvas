import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  gradient: string;
}

const StatCard = ({ title, value, icon: Icon, trend, trendUp, gradient }: StatCardProps) => {
  return (
    <Card className="relative overflow-hidden border-none shadow-md">
      <div className={`absolute inset-0 opacity-10 ${gradient}`} />
      <CardContent className="relative p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold mt-1 text-foreground">{value}</p>
            {trend && (
              <p className={`text-xs mt-1 font-medium ${trendUp ? "text-[hsl(160,84%,39%)]" : "text-destructive"}`}>
                {trend}
              </p>
            )}
          </div>
          <div className={`rounded-xl p-3 ${gradient}`}>
            <Icon className="h-5 w-5 text-primary-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;

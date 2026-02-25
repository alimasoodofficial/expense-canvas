import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Expense, CATEGORY_BG } from "@/lib/expense-data";

interface ExpenseTableProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

const statusConfig = {
  approved: { icon: CheckCircle2, label: "Approved", className: "bg-[hsl(160,84%,39%/0.12)] text-[hsl(160,84%,29%)] border-transparent" },
  pending: { icon: Clock, label: "Pending", className: "bg-[hsl(38,92%,50%/0.12)] text-[hsl(38,92%,35%)] border-transparent" },
  rejected: { icon: XCircle, label: "Rejected", className: "bg-destructive/10 text-destructive border-transparent" },
};

const ExpenseTable = ({ expenses, onDelete }: ExpenseTableProps) => {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="font-semibold text-foreground">Description</TableHead>
            <TableHead className="font-semibold text-foreground">Category</TableHead>
            <TableHead className="font-semibold text-foreground">Amount</TableHead>
            <TableHead className="font-semibold text-foreground">Date</TableHead>
            <TableHead className="font-semibold text-foreground">Paid By</TableHead>
            <TableHead className="font-semibold text-foreground">Status</TableHead>
            <TableHead className="font-semibold text-foreground text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => {
            const status = statusConfig[expense.status];
            const StatusIcon = status.icon;
            return (
              <TableRow key={expense.id} className="hover:bg-muted/10 transition-colors">
                <TableCell className="font-medium">{expense.description}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_BG[expense.category]}`}>
                    {expense.category}
                  </span>
                </TableCell>
                <TableCell className="font-mono font-semibold">
                  ${expense.amount.toLocaleString()}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(expense.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </TableCell>
                <TableCell className="text-muted-foreground">{expense.paidBy}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={status.className}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => onDelete(expense.id)} className="hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {expenses.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">No expenses found</div>
      )}
    </div>
  );
};

export default ExpenseTable;

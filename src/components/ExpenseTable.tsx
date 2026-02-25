import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle2, Clock, XCircle, Pencil } from "lucide-react";
import { Expense, CATEGORY_BG } from "@/lib/expense-data";
import { useCurrency } from "@/hooks/useCurrency";

interface ExpenseTableProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  onEdit: (expense: Expense) => void;
}

const statusConfig = {
  approved: { icon: CheckCircle2, label: "Approved", className: "bg-[hsl(160,84%,39%/0.12)] text-[hsl(160,84%,29%)] border-transparent" },
  pending: { icon: Clock, label: "Pending", className: "bg-[hsl(38,92%,50%/0.12)] text-[hsl(38,92%,35%)] border-transparent" },
  rejected: { icon: XCircle, label: "Rejected", className: "bg-destructive/10 text-destructive border-transparent" },
};

const ExpenseTable = ({ expenses, onDelete, onEdit }: ExpenseTableProps) => {
  const { formatAmount } = useCurrency();
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="font-semibold text-foreground">Description</TableHead>
            <TableHead className="font-semibold text-foreground">Category</TableHead>
            <TableHead className="font-semibold text-foreground">Amount</TableHead>
            <TableHead className="font-semibold text-foreground">Date</TableHead>
            <TableHead className="font-semibold text-foreground">Status</TableHead>
            <TableHead className="font-semibold text-foreground text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => {
            const status = statusConfig[expense.status];
            const StatusIcon = status.icon;
            return (
              <TableRow key={expense.id} className="hover:bg-muted/10 transition-colors group">
                <TableCell className="font-medium whitespace-nowrap" title={expense.description}>
                  <div className="max-w-[200px] sm:max-w-[150px] truncate">{expense.description}</div>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_BG[expense.category]}`}>
                    {expense.category}
                  </span>
                </TableCell>
                <TableCell className="font-mono font-semibold">
                  {formatAmount(expense.amount)}
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {new Date(expense.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={status.className}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(expense)} className="hover:text-primary hover:bg-primary/10 h-8 w-8">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(expense.id)} className="hover:text-destructive hover:bg-destructive/10 h-8 w-8">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle2, Clock, XCircle, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import { Expense, getCategoryBg } from "@/lib/expense-data";
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

const PAGE_SIZE = 10;

const ExpenseTable = ({ expenses, onDelete, onEdit }: ExpenseTableProps) => {
  const { formatAmount } = useCurrency();
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(expenses.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedExpenses = expenses.slice(startIndex, startIndex + PAGE_SIZE);

  // Reset to first page if expenses change (e.g. filtering)
  useEffect(() => {
    setCurrentPage(1);
  }, [expenses.length]);

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block rounded-xl border bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50 border-b">
              <TableHead className="font-semibold text-foreground py-4">Description</TableHead>
              <TableHead className="font-semibold text-foreground">Category</TableHead>
              <TableHead className="font-semibold text-foreground">Amount</TableHead>
              <TableHead className="font-semibold text-foreground">Date</TableHead>
              <TableHead className="font-semibold text-foreground">Status</TableHead>
              <TableHead className="font-semibold text-foreground text-right w-[120px] px-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedExpenses.map((expense) => {
              const status = statusConfig[expense.status];
              const StatusIcon = status.icon;
              return (
                <TableRow key={expense.id} className="hover:bg-muted/30 transition-all group border-b last:border-0">
                  <TableCell className="font-medium py-4">
                    <div className="flex flex-col">
                      <span className="truncate max-w-[200px]" title={expense.description}>{expense.description}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${getCategoryBg(expense.category)} shadow-sm`}>
                      {expense.category}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono font-bold text-base">
                    {formatAmount(expense.amount, expense.currency_code)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(expense.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`px-2 py-0.5 font-medium border-0 ${status.className} rounded-md`}>
                      <StatusIcon className="h-3 w-3 mr-1.5" />
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <div className="flex justify-end items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(expense)} className="h-8 w-8 rounded-lg hover:bg-primary/20 hover:text-primary transition-colors">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(expense.id)} className="h-8 w-8 rounded-lg hover:bg-destructive/20 hover:text-destructive transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Table (Cards) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {paginatedExpenses.map((expense) => {
          const status = statusConfig[expense.status];
          const StatusIcon = status.icon;
          return (
            <div key={expense.id} className="bg-card border rounded-2xl p-5 shadow-sm space-y-4 active:scale-[0.98] transition-all">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-bold text-foreground line-clamp-2 leading-tight">{expense.description}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${getCategoryBg(expense.category)}`}>
                      {expense.category}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(expense.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-lg font-black text-primary">
                    {formatAmount(expense.amount, expense.currency_code)}
                  </div>
                  <Badge variant="outline" className={`border-0 ${status.className} py-0.5`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {status.label}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-dashed">
                <Button variant="outline" size="sm" onClick={() => onEdit(expense)} className="h-8 flex-1 gap-2 rounded-xl text-xs font-semibold">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => onDelete(expense.id)} className="h-8 flex-1 gap-2 rounded-xl text-xs font-semibold hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {expenses.length === 0 && (
        <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed flex flex-col items-center gap-2">
          <Clock className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-muted-foreground font-medium">No expenses recorded yet.</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-t mt-4">
          <div className="text-sm text-muted-foreground font-medium order-2 sm:order-1">
            Displaying <span className="text-foreground">{startIndex + 1}-{Math.min(startIndex + PAGE_SIZE, expenses.length)}</span> of <span className="text-foreground">{expenses.length}</span>
          </div>
          <div className="flex items-center gap-1.5 order-1 sm:order-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-9 w-9 rounded-xl border-muted-foreground/20"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center px-4 font-bold text-sm">
              {currentPage} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-9 w-9 rounded-xl border-muted-foreground/20"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};


export default ExpenseTable;

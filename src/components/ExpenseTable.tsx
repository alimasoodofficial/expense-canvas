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
    <div className="space-y-6">
      {/* Desktop Table - Hidden on small screens */}
      <div className="hidden lg:block rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-blue-500/5 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b border-slate-200">
              <TableHead className="font-bold text-slate-800 py-5 pl-8">Transaction</TableHead>
              <TableHead className="font-bold text-slate-800">Category</TableHead>
              <TableHead className="font-bold text-slate-800 text-right pr-4">Amount</TableHead>
              <TableHead className="font-bold text-slate-800">Date</TableHead>
              <TableHead className="font-bold text-slate-800">Status</TableHead>
              <TableHead className="font-bold text-slate-800 text-right pr-8 w-[140px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedExpenses.map((expense) => {
              const status = statusConfig[expense.status];
              const StatusIcon = status.icon;
              return (
                <TableRow key={expense.id} className="hover:bg-slate-50/50 transition-all group border-b border-slate-100 last:border-0 h-20">
                  <TableCell className="font-semibold py-4 pl-8">
                    <div className="flex flex-col border-r border-slate-50 last:border-0">
                      <span className="text-slate-900 truncate max-w-[280px]" title={expense.description}>{expense.description}</span>
                    </div>
                  </TableCell>
                  <TableCell className="border-r border-slate-50 last:border-0">
                    <span className={`inline-flex items-center rounded-xl px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${getCategoryBg(expense.category)} border border-current/10 shadow-sm`}>
                      {expense.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-4 border-r border-slate-50 last:border-0">
                    <span className="font-bold text-base text-blue-600 font-mono">
                      {formatAmount(expense.amount, expense.currency_code)}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-500 font-medium text-sm border-r border-slate-50 last:border-0">
                    {new Date(expense.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </TableCell>
                  <TableCell className="border-r border-slate-50 last:border-0">
                    <Badge variant="outline" className={`px-3 py-1 font-bold border-0 ${status.className} rounded-xl`}>
                      <StatusIcon className="h-3.5 w-3.5 mr-2" />
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all duration-300">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(expense)} className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(expense.id)} className="h-9 w-9 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm">
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

      {/* Mobile/Tablet Card Layout - Better for responsiveness */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4 px-1">
        {paginatedExpenses.map((expense) => {
          const status = statusConfig[expense.status];
          const StatusIcon = status.icon;
          return (
            <div key={expense.id} className="relative group bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden border-b-4 border-b-slate-100">
              <div className="absolute top-0 right-0 p-2">
                <span className={`inline-flex rounded-xl px-2.5 py-1 text-[9px] font-black uppercase tracking-tighter ${getCategoryBg(expense.category)} border border-current/5`}>
                  {expense.category}
                </span>
              </div>

              <div className="space-y-4">
                <div className="pr-16">
                  <h3 className="font-bold text-slate-800 line-clamp-2 leading-snug text-lg">{expense.description}</h3>
                  <p className="text-xs text-slate-400 font-medium mt-1">
                    {new Date(expense.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                </div>

                <div className="flex items-end justify-between border-t border-slate-100 pt-4">
                  <div className="space-y-1">
                    <Badge variant="outline" className={`border-0 ${status.className} py-1 px-3 rounded-lg flex items-center w-fit`}>
                      <StatusIcon className="h-3 w-3 mr-1.5" />
                      <span className="text-[10px] font-bold">{status.label}</span>
                    </Badge>
                    <div className="text-2xl font-black text-blue-600 font-mono tracking-tight pt-1">
                      {formatAmount(expense.amount, expense.currency_code)}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => onEdit(expense)} className="h-10 w-10 rounded-2xl bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition-all">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => onDelete(expense.id)} className="h-10 w-10 rounded-2xl bg-red-50 border-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {expenses.length === 0 && (
        <div className="text-center py-24 bg-blue-50/30 rounded-[3rem] border-2 border-dashed border-blue-100 flex flex-col items-center gap-4 group">
          <div className="bg-white p-6 rounded-full shadow-inner group-hover:scale-110 transition-transform duration-500">
            <Clock className="h-12 w-12 text-blue-200" />
          </div>
          <p className="text-blue-400 font-bold text-lg">No expenses found matching your search</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-8 px-4 border-t border-blue-50">
          <div className="text-sm font-semibold text-slate-500 order-2 sm:order-1">
            Showing <span className="text-blue-600 font-bold">{startIndex + 1}-{Math.min(startIndex + PAGE_SIZE, expenses.length)}</span> of <span className="text-slate-900 font-black">{expenses.length}</span> entries
          </div>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-11 w-11 rounded-2xl border-blue-100 bg-white shadow-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 disabled:opacity-40 transition-all font-bold"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                // Only show current, first, last, and pages around current
                if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-11 min-w-[44px] rounded-2xl font-bold transition-all ${currentPage === pageNum
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "border-blue-100 bg-white text-blue-600 hover:bg-blue-50"
                        }`}
                    >
                      {pageNum}
                    </Button>
                  );
                }
                if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                  return <span key={pageNum} className="px-1 text-blue-200">...</span>;
                }
                return null;
              })}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-11 w-11 rounded-2xl border-blue-100 bg-white shadow-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 disabled:opacity-40 transition-all font-bold"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};


export default ExpenseTable;

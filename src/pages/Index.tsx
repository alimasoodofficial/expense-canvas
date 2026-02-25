import { useState } from "react";
import { Plus, DollarSign, TrendingUp, Receipt, Clock, Search, Filter, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import StatCard from "@/components/StatCard";
import ExpenseTable from "@/components/ExpenseTable";
import AddExpenseDialog from "@/components/AddExpenseDialog";
import CategoryChart from "@/components/CategoryChart";
import MonthlyChart from "@/components/MonthlyChart";
import { CATEGORIES, Expense } from "@/lib/expense-data";
import { useAuth } from "@/hooks/useAuth";
import { useExpenses } from "@/hooks/useExpenses";
import { useCurrency, Currency } from "@/hooks/useCurrency";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { isSameMonth, subMonths, parseISO } from "date-fns";

const Index = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { expenses, isLoading, addExpense, updateExpense, deleteExpense } = useExpenses();
  const { currency, setCurrency, formatAmount } = useCurrency();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

  // Map DB expenses to the UI Expense type
  const mappedExpenses: Expense[] = expenses.map((e) => ({
    id: e.id,
    description: e.description,
    amount: Number(e.amount),
    category: e.category as Expense["category"],
    date: e.date,
    status: e.status as Expense["status"],
  }));

  const now = new Date();
  const lastMonth = subMonths(now, 1);

  const thisMonthExpenses = mappedExpenses.filter(e => isSameMonth(parseISO(e.date), now));
  const lastMonthExpenses = mappedExpenses.filter(e => isSameMonth(parseISO(e.date), lastMonth));

  const totalThisMonth = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalLastMonth = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

  const percentageChange = totalLastMonth === 0
    ? (totalThisMonth > 0 ? 100 : 0)
    : ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100;

  const totalExpenses = mappedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const approvedTotal = mappedExpenses.filter((e) => e.status === "approved").reduce((sum, e) => sum + e.amount, 0);
  const pendingCount = mappedExpenses.filter((e) => e.status === "pending").length;

  const filtered = mappedExpenses.filter((e) => {
    const matchSearch = e.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === "all" || e.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const handleSaveExpense = (expenseData: Omit<Expense, "id">, editId?: string) => {
    if (editId) {
      updateExpense.mutate(
        { id: editId, ...expenseData },
        {
          onSuccess: () => toast.success("Expense updated!"),
          onError: (err) => toast.error(err.message),
        }
      );
    } else {
      addExpense.mutate(
        {
          description: expenseData.description,
          amount: expenseData.amount,
          category: expenseData.category,
          date: expenseData.date,
          status: expenseData.status,
        },
        {
          onSuccess: () => toast.success("Expense added!"),
          onError: (err) => toast.error(err.message),
        }
      );
    }
  };

  const handleEditClick = (expense: Expense) => {
    setExpenseToEdit(expense);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteExpense.mutate(id, {
      onSuccess: () => toast.success("Expense deleted!"),
      onError: (err) => toast.error(err.message),
    });
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">💰 ExpenseFlow</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <div className="flex gap-2 items-center">
            <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
              <SelectTrigger className="w-[80px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PKR">PKR</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => { setExpenseToEdit(null); setDialogOpen(true); }} className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Expense</span>
            </Button>
            <Button variant="ghost" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-8 space-y-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Expenses"
                value={formatAmount(totalExpenses)}
                icon={DollarSign}
                gradient="bg-primary"
                trend={`${percentageChange >= 0 ? "+" : ""}${Math.round(percentageChange)}% from last month`}
                trendUp={percentageChange >= 0}
              />
              <StatCard title="Approved" value={formatAmount(approvedTotal)} icon={TrendingUp} gradient="bg-[hsl(160,84%,39%)]" />
              <StatCard title="Pending Items" value={pendingCount.toString()} icon={Clock} gradient="bg-[hsl(38,92%,50%)]" />
              <StatCard title="Total Entries" value={mappedExpenses.length.toString()} icon={Receipt} gradient="bg-[hsl(var(--chart-3))]" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full overflow-hidden">
              <div className="w-full overflow-hidden">
                <CategoryChart expenses={mappedExpenses} />
              </div>
              <div className="w-full overflow-hidden">
                <MonthlyChart expenses={mappedExpenses} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search expenses..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full sm:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full overflow-x-auto pb-4">
                <div className="min-w-[800px]">
                  <ExpenseTable expenses={filtered} onDelete={handleDelete} onEdit={handleEditClick} />
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <AddExpenseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveExpense}
        expenseToEdit={expenseToEdit}
      />
    </div>
  );
};

export default Index;

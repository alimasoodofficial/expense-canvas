import { useState } from "react";
import { Plus, DollarSign, TrendingUp, Receipt, Clock, Search, Filter, LogOut, FileUp, Settings2, Folder, Download, Globe } from "lucide-react";
import { downloadExpensesCSV } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import StatCard from "@/components/StatCard";
import ExpenseTable from "@/components/ExpenseTable";
import AddExpenseDialog from "@/components/AddExpenseDialog";
import { BulkUploadDialog } from "@/components/BulkUploadDialog";
import { ManageCategoriesDialog } from "@/components/ManageCategoriesDialog";
import CategoryChart from "@/components/CategoryChart";
import MonthlyChart from "@/components/MonthlyChart";
import { Expense } from "@/lib/expense-data";
import { useAuth } from "@/hooks/useAuth";
import { useExpenses } from "@/hooks/useExpenses";
import { useCategories } from "@/hooks/useCategories";
import { useCurrency, Currency } from "@/hooks/useCurrency";
import { useProjects } from "@/hooks/useProjects";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { isSameMonth, subMonths, parseISO } from "date-fns";

const Index = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { expenses, isLoading, addExpense, bulkAddExpenses, updateExpense, deleteExpense } = useExpenses();
  const { projects } = useProjects();
  const { categories } = useCategories();
  const { currency, setCurrency, formatAmount, convertAmount, lastUpdated, exchangeRates } = useCurrency();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

  // Map DB expenses to the UI Expense type
  const mappedExpenses: Expense[] = expenses.map((e) => ({
    id: e.id,
    description: e.description,
    amount: Number(e.amount),
    currency_code: e.currency_code || "PKR",
    category: e.category as Expense["category"],
    date: e.date,
    status: e.status as Expense["status"],
    project_id: e.project_id,
  }));

  const now = new Date();
  const lastMonth = subMonths(now, 1);

  const thisMonthExpenses = mappedExpenses.filter(e => isSameMonth(parseISO(e.date), now));
  const lastMonthExpenses = mappedExpenses.filter(e => isSameMonth(parseISO(e.date), lastMonth));

  const totalThisMonth = thisMonthExpenses.reduce((sum, e) => sum + convertAmount(e.amount, e.currency_code, "PKR"), 0);
  const totalLastMonth = lastMonthExpenses.reduce((sum, e) => sum + convertAmount(e.amount, e.currency_code, "PKR"), 0);

  const percentageChange = totalLastMonth === 0
    ? (totalThisMonth > 0 ? 100 : 0)
    : ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100;

  const totalExpenses = mappedExpenses.reduce((sum, e) => sum + convertAmount(e.amount, e.currency_code, "PKR"), 0);
  const approvedTotal = mappedExpenses.filter((e) => e.status === "approved").reduce((sum, e) => sum + convertAmount(e.amount, e.currency_code, "PKR"), 0);
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
          currency_code: expenseData.currency_code,
          category: expenseData.category,
          date: expenseData.date,
          status: expenseData.status,
          project_id: expenseData.project_id
        },
        {
          onSuccess: () => toast.success("Expense added!"),
          onError: (err) => toast.error(err.message),
        }
      );
    }
  };

  const handleBulkSave = (newExpenses: Omit<Expense, "id">[]) => {
    bulkAddExpenses.mutate(
      newExpenses.map(expenseData => ({
        description: expenseData.description,
        amount: expenseData.amount,
        currency_code: expenseData.currency_code,
        category: expenseData.category,
        date: expenseData.date,
        status: expenseData.status,
        project_id: expenseData.project_id
      })),
      {
        onSuccess: () => toast.success(`Successfully added ${newExpenses.length} expenses!`),
        onError: (err) => toast.error(err.message),
      }
    );
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
        <div className="container mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center sm:items-start">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">💰 Expense 360</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center justify-center">
            <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
              <SelectTrigger className="w-[100px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PKR">PKR</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="SAR">SAR</SelectItem>
                <SelectItem value="AED">AED</SelectItem>
                <SelectItem value="AUD">AUD</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={() => setManageCategoriesOpen(true)} variant="outline" size="icon">
              <Settings2 className="h-4 w-4" />
            </Button>
            <Button onClick={() => navigate("/projects")} variant="outline" className="gap-2">
              <Folder className="h-4 w-4" />
              <span className="hidden sm:inline">Projects</span>
            </Button>
            <Button onClick={() => downloadExpensesCSV(mappedExpenses, "all-expenses")} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </Button>
            <Button onClick={() => setBulkDialogOpen(true)} variant="outline" className="gap-2">
              <FileUp className="h-4 w-4" />
              <span className="hidden sm:inline">Import</span>
            </Button>
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

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold tracking-tight">Active Projects</h3>
                <Button variant="ghost" onClick={() => navigate("/projects")} className="text-primary font-bold">
                  View All Projects
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.slice(0, 3).map((project) => (
                  <div
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="group relative bg-card border border-border/50 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer overflow-hidden border-b-4 border-b-primary/10"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-primary/10 p-3 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                        <Folder className="h-6 w-6 fill-primary/10" />
                      </div>
                      <h4 className="font-bold text-xl text-primary truncate">{project.name}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px] mb-4 italic">
                      {project.description || "No description provided"}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-dashed">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Budget: {formatAmount(project.budget || 0)}
                      </span>
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    </div>
                  </div>
                ))}
                <div
                  onClick={() => navigate("/projects")}
                  className="flex flex-col items-center justify-center border-2 border-dashed rounded-[2rem] p-6 hover:bg-muted/30 transition-all cursor-pointer text-muted-foreground hover:text-primary min-h-[160px] group"
                >
                  <div className="bg-muted p-3 rounded-full mb-2 group-hover:scale-110 transition-transform">
                    <Plus className="h-6 w-6" />
                  </div>
                  <p className="font-bold">Create New Project</p>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="text-2xl font-black tracking-tight text-slate-800">Recent Transactions</h3>
                  <p className="text-sm text-slate-500 font-medium">Monitoring your latest spending across all categories</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <div className="relative group flex-1 sm:min-w-[320px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400 group-focus-within:text-blue-600 transition-colors" />
                    <Input
                      placeholder="Search expenses..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-11 h-12 rounded-2xl border-blue-50 bg-blue-50/30 focus-visible:ring-blue-500/20 focus-visible:border-blue-200 transition-all font-medium"
                    />
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full sm:w-52 h-12 rounded-2xl border-blue-50 bg-blue-50/30 font-bold text-blue-900 focus:ring-blue-500/20 transition-all">
                      <Filter className="h-4 w-4 mr-2 text-blue-500" />
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-blue-50 shadow-xl">
                      <SelectItem value="all" className="font-bold text-blue-900">All Categories</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c} className="font-medium">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="w-full">
                <ExpenseTable expenses={filtered} onDelete={handleDelete} onEdit={handleEditClick} />
              </div>
            </div>
          </>
        )}
      </main>

      <AddExpenseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveExpense}
        expense={expenseToEdit}
      />
      <BulkUploadDialog
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        onSave={handleBulkSave}
      />
      <ManageCategoriesDialog
        open={manageCategoriesOpen}
        onOpenChange={setManageCategoriesOpen}
      />
    </div>
  );
};

export default Index;

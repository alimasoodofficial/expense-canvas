import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Folder, Filter, LogOut, Settings2, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/useProjects";
import { useExpenses } from "@/hooks/useExpenses";
import { useAuth } from "@/hooks/useAuth";
import AddExpenseDialog from "@/components/AddExpenseDialog";
import { BulkUploadDialog } from "@/components/BulkUploadDialog";
import ExpenseTable from "@/components/ExpenseTable";
import StatCard from "@/components/StatCard";
import { useCurrency, Currency } from "@/hooks/useCurrency";
import { isSameMonth, subMonths, parseISO } from "date-fns";
import { toast } from "sonner";
import { Expense } from "@/lib/expense-data";

const ProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const { projects } = useProjects();
    const { expenses, addExpense, deleteExpense, updateExpense, bulkAddExpenses } = useExpenses();
    const { currency, convertAmount, formatAmount } = useCurrency();

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isBulkOpen, setIsBulkOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [selectedCurrency, setSelectedCurrency] = useState<Currency>("PKR");

    const project = projects.find(p => p.id === id);

    const projectExpenses = useMemo(() => {
        return expenses.filter(e => e.project_id === id).map(e => ({
            ...e,
            date: new Date(e.date).toISOString().split('T')[0],
            status: e.status as "approved" | "pending" | "rejected",
        }));
    }, [expenses, id]);

    if (!user) return null;
    if (!project) return <div className="p-8 text-center text-muted-foreground">Project not found or loading...</div>;

    const totalThisMonth = projectExpenses.reduce((sum, e) => {
        if (e.date && isSameMonth(parseISO(e.date), new Date())) {
            return sum + convertAmount(e.amount, e.currency_code, currency);
        }
        return sum;
    }, 0);

    const totalLastMonth = projectExpenses.reduce((sum, e) => {
        if (e.date && isSameMonth(parseISO(e.date), subMonths(new Date(), 1))) {
            return sum + convertAmount(e.amount, e.currency_code, currency);
        }
        return sum;
    }, 0);

    const handleSaveExpense = async (expenseData: Omit<Expense, "id">, editId?: string) => {
        try {
            if (editId) {
                await updateExpense.mutateAsync({ ...expenseData, id: editId });
                toast.success("Expense updated successfully");
            } else {
                await addExpense.mutateAsync({ ...expenseData, project_id: project.id });
                toast.success("Expense added successfully");
            }
            setIsAddOpen(false);
            setEditingExpense(undefined);
        } catch (err) {
            toast.error("Failed to save expense");
        }
    };

    const handleBulkSave = async (newExpenses: Omit<Expense, "id">[]) => {
        try {
            await bulkAddExpenses.mutateAsync(
                newExpenses.map(expenseData => ({ ...expenseData, project_id: project.id }))
            );
            toast.success(`${newExpenses.length} expenses imported successfully`);
            setIsBulkOpen(false);
        } catch (err) {
            toast.error("Failed to import expenses");
        }
    };

    const handleEditClick = (expense: Expense) => {
        setEditingExpense(expense);
        setIsAddOpen(true);
    };

    const handleDelete = async (deleteId: string) => {
        try {
            await deleteExpense.mutateAsync(deleteId);
            toast.success("Expense deleted successfully");
        } catch (err) {
            toast.error("Failed to delete expense");
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground pb-20 sm:pb-8 flex flex-col">
            <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 bg-background/80 backdrop-blur-md border-b">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/projects")} className="hidden sm:flex shrink-0">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <Folder className="h-5 w-5 text-primary" />
                            {project.name}
                        </h1>
                        <p className="text-sm text-muted-foreground hidden sm:block">
                            {project.description || "Project Details"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsBulkOpen(true)} className="hidden sm:flex gap-2">
                        <FileUp className="h-4 w-4" />
                        Import CSV/XLS
                    </Button>
                    <Button onClick={() => setIsAddOpen(true)} size="sm" className="gap-2 shadow-sm font-medium">
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Add Expense</span>
                    </Button>
                </div>
            </header>

            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Project Total"
                        value={formatAmount(projectExpenses.reduce((sum, e) => sum + convertAmount(e.amount, e.currency_code, currency), 0))}
                        trend={`${((totalThisMonth - totalLastMonth) / (totalLastMonth || 1)) * 100 >= 0 ? "+" : ""}${(((totalThisMonth - totalLastMonth) / (totalLastMonth || 1)) * 100).toFixed(1)}% vs last month`}
                        trendUp={((totalThisMonth - totalLastMonth) / (totalLastMonth || 1)) * 100 >= 0}
                        icon={Folder}
                        gradient="bg-gradient-to-br from-indigo-500 to-purple-500"
                    />
                    <StatCard
                        title="This Month"
                        value={formatAmount(totalThisMonth)}
                        trend={`${((totalThisMonth - totalLastMonth) / (totalLastMonth || 1)) * 100 >= 0 ? "+" : ""}${(((totalThisMonth - totalLastMonth) / (totalLastMonth || 1)) * 100).toFixed(1)}% vs last month`}
                        trendUp={((totalThisMonth - totalLastMonth) / (totalLastMonth || 1)) * 100 >= 0}
                        icon={FileUp}
                        gradient="bg-gradient-to-br from-indigo-500 to-purple-500"
                    />
                </div>

                <div className="bg-card rounded-2xl shadow-sm border overflow-hidden">
                    <div className="px-6 py-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20">
                        <h2 className="text-lg font-semibold text-foreground">Project Expenses</h2>
                    </div>
                    <ExpenseTable
                        expenses={projectExpenses}
                        onEdit={handleEditClick}
                        onDelete={handleDelete}
                    />
                </div>
            </main>

            <AddExpenseDialog
                open={isAddOpen}
                onOpenChange={(open) => {
                    setIsAddOpen(open);
                    if (!open) { setEditingExpense(undefined); }
                }}
                onSave={handleSaveExpense}
                expense={editingExpense}
                defaultProjectId={project.id}
            />

            <BulkUploadDialog
                open={isBulkOpen}
                onOpenChange={setIsBulkOpen}
                onSave={handleBulkSave}
            />
        </div>
    );
};

export default ProjectDetail;

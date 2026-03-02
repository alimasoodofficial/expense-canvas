import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Folder, Filter, LogOut, Settings2, FileUp, Download, Edit, CreditCard, Wallet, Banknote, Globe } from "lucide-react";
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
import { downloadExpensesCSV } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const { projects, updateProject } = useProjects();
    const { expenses, addExpense, deleteExpense, updateExpense, bulkAddExpenses } = useExpenses();
    const { currency, setCurrency, convertAmount, formatAmount, lastUpdated } = useCurrency();

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isBulkOpen, setIsBulkOpen] = useState(false);
    const [isStatsEditOpen, setIsStatsEditOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");

    const project = projects.find(p => p.id === id);

    const [editBudget, setEditBudget] = useState<string>("");
    const [editPaymentReceived, setEditPaymentReceived] = useState<string>("");

    const projectExpenses = useMemo(() => {
        return expenses.filter(e => e.project_id === id).map(e => ({
            ...e,
            date: new Date(e.date).toISOString().split('T')[0],
            status: e.status as "approved" | "pending" | "rejected",
        }));
    }, [expenses, id]);

    if (!user) return null;
    if (!project) return <div className="p-8 text-center text-muted-foreground">Project not found or loading...</div>;

    const totalProjectExpense = projectExpenses.reduce((sum, e) => sum + convertAmount(e.amount, e.currency_code, "PKR"), 0);
    const budget = project.budget || 0;
    const paymentReceived = project.payment_received || 0;
    const currentBalance = totalProjectExpense - paymentReceived;

    const totalThisMonth = projectExpenses.reduce((sum, e) => {
        if (e.date && isSameMonth(parseISO(e.date), new Date())) {
            return sum + convertAmount(e.amount, e.currency_code, "PKR");
        }
        return sum;
    }, 0);

    const totalLastMonth = projectExpenses.reduce((sum, e) => {
        if (e.date && isSameMonth(parseISO(e.date), subMonths(new Date(), 1))) {
            return sum + convertAmount(e.amount, e.currency_code, "PKR");
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

    const handleUpdateStats = async () => {
        try {
            await updateProject.mutateAsync({
                id: project.id,
                budget: convertAmount(parseFloat(editBudget) || 0, currency, "PKR"),
                payment_received: convertAmount(parseFloat(editPaymentReceived) || 0, currency, "PKR"),
            });
            toast.success("Stats updated successfully");
            setIsStatsEditOpen(false);
        } catch (err) {
            toast.error("Failed to update stats");
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

    const openStatsEdit = () => {
        setEditBudget(convertAmount(budget, "PKR", currency).toFixed(2));
        setEditPaymentReceived(convertAmount(paymentReceived, "PKR", currency).toFixed(2));
        setIsStatsEditOpen(true);
    };

    return (
        <div className="min-h-screen bg-background text-foreground pb-20 sm:pb-8 flex flex-col">
            <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 bg-background/80 backdrop-blur-md border-b">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/projects")} className="shrink-0">
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

                    <Button variant="outline" size="sm" onClick={() => downloadExpensesCSV(projectExpenses, `${project.name}-expenses`)} className="gap-2">
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Download</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setIsBulkOpen(true)} className="hidden sm:flex gap-2">
                        <FileUp className="h-4 w-4" />
                        Import
                    </Button>
                    <Button onClick={() => setIsAddOpen(true)} size="sm" className="gap-2 shadow-sm font-medium">
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Add Expense</span>
                    </Button>
                </div>
            </header>

            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="relative group cursor-pointer" onClick={openStatsEdit}>
                        <StatCard
                            title="Project Budget"
                            value={formatAmount(budget)}
                            icon={Banknote}
                            gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
                        />
                        <div className="absolute top-4 right-14 p-1 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Edit className="h-4 w-4 text-white" />
                        </div>
                    </div>
                    <StatCard
                        title="Project Total Expense"
                        value={formatAmount(totalProjectExpense)}
                        icon={CreditCard}
                        gradient="bg-gradient-to-br from-rose-500 to-orange-500"
                    />
                    <div className="relative group cursor-pointer" onClick={openStatsEdit}>
                        <StatCard
                            title="Payment Received"
                            value={formatAmount(paymentReceived)}
                            icon={Banknote}
                            gradient="bg-gradient-to-br from-emerald-500 to-teal-500"
                        />
                        <div className="absolute top-4 right-14 p-1 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Edit className="h-4 w-4 text-white" />
                        </div>
                    </div>
                    <StatCard
                        title="Current Balance"
                        value={formatAmount(Math.abs(currentBalance))}
                        icon={Wallet}
                        gradient="bg-gradient-to-br from-indigo-500 to-purple-500"
                        trend={currentBalance > 0 ? "Outstanding" : "Paid"}
                        trendUp={currentBalance <= 0}
                    />
                </div>

                <div className="bg-card rounded-2xl shadow-sm border overflow-hidden">
                    <div className="px-6 py-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20">
                        <h2 className="text-lg font-semibold text-foreground">Project Expenses</h2>
                    </div>
                    <div className="w-full overflow-x-auto">
                        <ExpenseTable
                            expenses={projectExpenses}
                            onEdit={handleEditClick}
                            onDelete={handleDelete}
                        />
                    </div>
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

            <Dialog open={isStatsEditOpen} onOpenChange={setIsStatsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Project Financials</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="budget">Project Budget ({currency})</Label>
                            <Input
                                id="budget"
                                type="number"
                                value={editBudget}
                                onChange={(e) => setEditBudget(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="payment_received">Payment Received ({currency})</Label>
                            <Input
                                id="payment_received"
                                type="number"
                                value={editPaymentReceived}
                                onChange={(e) => setEditPaymentReceived(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsStatsEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdateStats}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProjectDetail;

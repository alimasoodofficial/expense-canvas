import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExpenseCategory, Expense } from "@/lib/expense-data";
import { useCurrency, Currency } from "@/hooks/useCurrency";
import { useCategories } from "@/hooks/useCategories";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (expense: Omit<Expense, "id">, editId?: string) => void;
  expense?: Expense | null;
  defaultProjectId?: string | null;
}

const AddExpenseDialog = ({ open, onOpenChange, onSave, expense: expenseToEdit, defaultProjectId }: AddExpenseDialogProps) => {
  const { currency } = useCurrency();
  const { categories } = useCategories();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory | "">("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState<Expense["status"]>("pending");

  const [inputCurrency, setInputCurrency] = useState<Currency>(currency);

  // Populate data when dialog opens for editing
  useEffect(() => {
    if (open && expenseToEdit) {
      setDescription(expenseToEdit.description);
      setAmount(expenseToEdit.amount.toString());
      setCategory(expenseToEdit.category);
      setDate(expenseToEdit.date);
      setStatus(expenseToEdit.status);
      setInputCurrency((expenseToEdit.currency_code as Currency) || currency);
    } else if (open && !expenseToEdit) {
      // Reset when opening for new item
      setDescription("");
      setAmount("");
      setCategory("");
      setDate(new Date().toISOString().split("T")[0]);
      setStatus("pending");
      setInputCurrency(currency);
    }
  }, [open, expenseToEdit, currency]);

  const handleSubmit = () => {
    if (!description || !amount || !category || !date) return;
    onSave({
      description,
      amount: parseFloat(amount),
      currency_code: inputCurrency,
      category: category as ExpenseCategory,
      date,
      status,
    }, expenseToEdit?.id);

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{expenseToEdit ? "Edit Expense" : "Add New Expense"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2 text-start">
            <Label htmlFor="description">Description</Label>
            <Input id="description" placeholder="e.g. AWS hosting" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2 text-start">
              <Label htmlFor="amount">Amount</Label>
              <div className="flex gap-2">
                <Input id="amount" className="flex-1" type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
                <Select value={inputCurrency} onValueChange={(v) => setInputCurrency(v as Currency)}>
                  <SelectTrigger className="w-[100px]">
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
              </div>
            </div>
            <div className="grid gap-2 text-start">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2 text-start">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2 text-start">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Expense["status"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>{expenseToEdit ? "Save" : "Add Expense"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseDialog;

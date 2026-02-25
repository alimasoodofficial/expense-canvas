import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, ExpenseCategory, Expense } from "@/lib/expense-data";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (expense: Omit<Expense, "id">) => void;
}

const AddExpenseDialog = ({ open, onOpenChange, onAdd }: AddExpenseDialogProps) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory | "">("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [paidBy, setPaidBy] = useState("");
  const [status, setStatus] = useState<Expense["status"]>("pending");

  const handleSubmit = () => {
    if (!description || !amount || !category || !date || !paidBy) return;
    onAdd({
      description,
      amount: parseFloat(amount),
      category: category as ExpenseCategory,
      date,
      paidBy,
      status,
    });
    setDescription("");
    setAmount("");
    setCategory("");
    setPaidBy("");
    setStatus("pending");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" placeholder="e.g. AWS hosting" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input id="amount" type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
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
          <div className="grid gap-2">
            <Label htmlFor="paidBy">Paid By</Label>
            <Input id="paidBy" placeholder="e.g. DevOps Team" value={paidBy} onChange={(e) => setPaidBy(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Add Expense</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseDialog;

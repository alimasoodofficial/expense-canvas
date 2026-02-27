import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCategories } from "@/hooks/useCategories";
import { useExpenses } from "@/hooks/useExpenses";
import { Trash2, Pencil, Check, X, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getCategoryBg } from "@/lib/expense-data";
import { toast } from "sonner";

interface ManageCategoriesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const ManageCategoriesDialog = ({ open, onOpenChange }: ManageCategoriesDialogProps) => {
    const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
    const { bulkUpdateCategory } = useExpenses();
    const [newCatName, setNewCatName] = useState("");
    const [editingCat, setEditingCat] = useState<string | null>(null);
    const [editCatName, setEditCatName] = useState("");

    const handleAdd = () => {
        const trimmed = newCatName.trim();
        if (!trimmed) return;
        if (categories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
            toast.error("Category already exists");
            return;
        }
        addCategory(trimmed);
        setNewCatName("");
        toast.success("Category added");
    };

    const startEdit = (cat: string) => {
        setEditingCat(cat);
        setEditCatName(cat);
    };

    const handleSaveEdit = () => {
        const trimmed = editCatName.trim();
        if (!trimmed) {
            toast.error("Category name cannot be empty");
            return;
        }

        if (editingCat && editingCat !== trimmed) {
            if (categories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
                toast.error("Category already exists");
                return;
            }

            updateCategory(editingCat, trimmed);
            bulkUpdateCategory.mutate({
                oldCategory: editingCat,
                newCategory: trimmed
            });
            toast.success("Category updated");
        }

        setEditingCat(null);
    };

    const handleDelete = (cat: string) => {
        if (categories.length <= 1) {
            toast.error("You must have at least one category");
            return;
        }
        deleteCategory(cat);
        toast.success("Category deleted");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Manage Categories</DialogTitle>
                </DialogHeader>

                <div className="flex gap-2 mb-4">
                    <Input
                        placeholder="New Category Name..."
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
                    />
                    <Button onClick={handleAdd} size="icon" className="shrink-0"><Plus className="h-4 w-4" /></Button>
                </div>

                <ScrollArea className="flex-1 max-h-[400px]">
                    <div className="space-y-2 pr-4">
                        {categories.map((cat, i) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded-md border group hover:bg-muted/50 transition-colors">
                                {editingCat === cat ? (
                                    <div className="flex-1 flex gap-2">
                                        <Input
                                            value={editCatName}
                                            onChange={(e) => setEditCatName(e.target.value)}
                                            autoFocus
                                            className="h-8"
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(); }}
                                        />
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50" onClick={handleSaveEdit}>
                                            <Check className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:bg-muted" onClick={() => setEditingCat(null)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getCategoryBg(cat)}`}>
                                                {cat}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={() => startEdit(cat)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(cat)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

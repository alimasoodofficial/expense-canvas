import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { ExpenseCategory, Expense } from "@/lib/expense-data";
import { useCurrency } from "@/hooks/useCurrency";
import { useCategories } from "@/hooks/useCategories";
import * as XLSX from "xlsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BulkUploadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (expenses: Omit<Expense, "id">[]) => void;
}

export const BulkUploadDialog = ({ open, onOpenChange, onSave }: BulkUploadDialogProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [parsedData, setParsedData] = useState<Omit<Expense, "id">[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const { currency, formatAmount } = useCurrency();
    const { categories } = useCategories();

    // Reset state when dialog opens/closes
    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setParsedData([]);
            setError(null);
        }
        onOpenChange(newOpen);
    };

    const processFile = (file: File) => {
        setError(null);
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: "array" });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Convert to array of objects
                const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet);

                if (rawJson.length === 0) {
                    setError("The uploaded file is empty or has no recognizable data.");
                    return;
                }

                const validExpenses: Omit<Expense, "id">[] = [];
                const errors: string[] = [];

                rawJson.forEach((row, index) => {
                    // Flexible column matching
                    const description = row.description || row.Description || row.Desc || row.Title || row.title || "";

                    // Parse amount (handle string amounts with currency symbols like $1,000)
                    let amountStr = String(row.amount || row.Amount || row.Cost || "0");
                    amountStr = amountStr.replace(/[^0-9.-]+/g, "");
                    const amount = parseFloat(amountStr);

                    // Parse currency
                    let currency_code = String(row.currency || row.Currency || row.currency_code || currency).toUpperCase().trim();
                    if (!["PKR", "USD", "EUR", "GBP", "SAR", "AED", "AUD"].includes(currency_code)) {
                        currency_code = currency;
                    }

                    // Find partial/case-insensitive category match
                    const rowCategory = String(row.category || row.Category || "Miscellaneous").trim();
                    let category = categories.find(
                        c => c.toLowerCase() === rowCategory.toLowerCase()
                    ) as ExpenseCategory;

                    if (!category) {
                        category = "Miscellaneous"; // Default fallback
                    }

                    // Parse date
                    let rawDate = row.date || row.Date;
                    let date = new Date().toISOString().split("T")[0]; // default today

                    if (rawDate) {
                        // Check if excel serial date
                        if (typeof rawDate === "number") {
                            const parsedExcel = new Date(Math.round((rawDate - 25569) * 86400 * 1000));
                            if (!isNaN(parsedExcel.getTime())) {
                                date = parsedExcel.toISOString().split("T")[0];
                            }
                        } else {
                            const checkDate = new Date(rawDate);
                            if (!isNaN(checkDate.getTime())) {
                                date = checkDate.toISOString().split("T")[0];
                            }
                        }
                    }

                    const status = (String(row.status || row.Status || "pending").toLowerCase() === "approved") ? "approved" : "pending";

                    if (!description) {
                        errors.push(`Row ${index + 2}: Missing description`);
                        return;
                    }

                    if (isNaN(amount) || amount <= 0) {
                        errors.push(`Row ${index + 2}: Invalid amount`);
                        return;
                    }

                    validExpenses.push({
                        description: String(description),
                        amount,
                        currency_code,
                        category,
                        date,
                        status: status as Expense["status"]
                    });
                });

                if (validExpenses.length === 0) {
                    setError(`No valid expenses found. Errors: ${errors.slice(0, 3).join(", ")}${errors.length > 3 ? "..." : ""}`);
                } else {
                    setParsedData(validExpenses);
                    if (errors.length > 0) {
                        // We have some valid but also some errors
                        setError(`Warning: Skipped ${errors.length} invalid rows.`);
                    }
                }
            } catch (err: any) {
                setError("Failed to parse the file. Please ensure it is a valid CSV or Excel file.");
            }
        };

        reader.onerror = () => {
            setError("Failed to read the file.");
        };

        reader.readAsArrayBuffer(file);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            if (file.type === "text/csv" || file.name.endsWith(".csv") || file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
                processFile(file);
            } else {
                setError("Please upload a valid CSV or Excel file.");
            }
        }
    };

    const PAGE_SIZE = 10;
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(parsedData.length / PAGE_SIZE);
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const paginatedData = parsedData.slice(startIndex, startIndex + PAGE_SIZE);

    // Reset page when data changes
    useEffect(() => {
        setCurrentPage(1);
    }, [parsedData.length]);

    const handleSave = () => {
        if (parsedData.length > 0) {
            onSave(parsedData);
            handleOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Bulk Upload Expenses</DialogTitle>
                    <DialogDescription>
                        Upload a CSV or Excel file to import multiple expenses at once.
                        Expected columns: <span className="font-semibold">Description, Amount, Category, Date, Status</span>.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col gap-4 py-4 min-h-[300px]">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {parsedData.length === 0 ? (
                        <div
                            className={`flex-1 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-12 transition-colors duration-200 cursor-pointer ${isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:bg-muted/50"}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="rounded-full bg-primary/10 p-4 mb-4">
                                <FileUp className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold mb-1">Click or drag file to this area to upload</h3>
                            <p className="text-sm text-muted-foreground mb-4 block">Supports .csv, .xlsx, .xls</p>
                            <Button type="button" variant="outline">
                                <Upload className="h-4 w-4 mr-2" />
                                Select File
                            </Button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                className="hidden"
                            />
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-center px-1">
                                <div className="flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-500">
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Successfully parsed {parsedData.length} expense{parsedData.length > 1 ? 's' : ''}
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setParsedData([])}>
                                    Upload different file
                                </Button>
                            </div>

                            <div className="flex-1 overflow-hidden border rounded-md flex flex-col bg-card">
                                <Table>
                                    <TableHeader className="sticky top-0 bg-background z-10">
                                        <TableRow>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedData.map((expense, i) => (
                                            <TableRow key={i}>
                                                <TableCell className="font-medium">{expense.description}</TableCell>
                                                <TableCell>{expense.category}</TableCell>
                                                <TableCell>{formatAmount(expense.amount)}</TableCell>
                                                <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                                                <TableCell className="capitalize">{expense.status}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {parsedData.length === 0 && (
                                    <div className="text-center py-12 text-muted-foreground">No data to display</div>
                                )}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-2 pt-2 pb-1 border-t">
                                    <div className="text-xs text-muted-foreground">
                                        Showing {startIndex + 1}-{Math.min(startIndex + PAGE_SIZE, parsedData.length)} of {parsedData.length}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="h-7 px-2"
                                        >
                                            Previous
                                        </Button>
                                        <span className="text-xs font-medium">
                                            {currentPage} / {totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="h-7 px-2"
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={parsedData.length === 0}>
                        Import {parsedData.length > 0 ? `${parsedData.length} Expenses` : ''}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function downloadExpensesCSV(expenses: any[], filename: string) {
  const headers = ["Description", "Amount", "Currency", "Category", "Date", "Status"];
  const csvRows = [headers.join(",")];

  expenses.forEach(e => {
    const row = [
      `"${e.description.replace(/"/g, '""')}"`,
      e.amount,
      e.currency_code,
      `"${e.category}"`,
      e.date,
      e.status
    ];
    csvRows.push(row.join(","));
  });

  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

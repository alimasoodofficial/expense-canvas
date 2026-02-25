export type ExpenseCategory =
  | "Salaries"
  | "Software"
  | "Hardware"
  | "Office"
  | "Marketing"
  | "Travel"
  | "Utilities"
  | "Miscellaneous";

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  status: "approved" | "pending" | "rejected";
}

export const CATEGORIES: ExpenseCategory[] = [
  "Salaries",
  "Software",
  "Hardware",
  "Office",
  "Marketing",
  "Travel",
  "Utilities",
  "Miscellaneous",
];

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Salaries: "hsl(var(--chart-1))",
  Software: "hsl(var(--chart-2))",
  Hardware: "hsl(var(--chart-3))",
  Office: "hsl(var(--chart-4))",
  Marketing: "hsl(var(--destructive))",
  Travel: "hsl(160, 84%, 39%)",
  Utilities: "hsl(38, 92%, 50%)",
  Miscellaneous: "hsl(var(--chart-5))",
};

export const CATEGORY_BG: Record<ExpenseCategory, string> = {
  Salaries: "bg-[hsl(234,89%,73%/0.15)] text-[hsl(234,89%,53%)]",
  Software: "bg-[hsl(255,91%,76%/0.15)] text-[hsl(255,91%,56%)]",
  Hardware: "bg-[hsl(270,95%,75%/0.15)] text-[hsl(270,95%,55%)]",
  Office: "bg-[hsl(238,83%,66%/0.15)] text-[hsl(238,83%,46%)]",
  Marketing: "bg-[hsl(0,72%,50%/0.12)] text-[hsl(0,72%,40%)]",
  Travel: "bg-[hsl(160,84%,39%/0.12)] text-[hsl(160,84%,29%)]",
  Utilities: "bg-[hsl(38,92%,50%/0.12)] text-[hsl(38,92%,35%)]",
  Miscellaneous: "bg-secondary/20 text-secondary",
};

export const MOCK_EXPENSES: Expense[] = [
  { id: "1", description: "Developer salaries - Feb", amount: 45000, category: "Salaries", date: "2026-02-01", status: "approved" },
  { id: "2", description: "AWS hosting & services", amount: 2800, category: "Software", date: "2026-02-03", status: "approved" },
  { id: "3", description: "Figma Enterprise license", amount: 450, category: "Software", date: "2026-02-05", status: "approved" },
  { id: "4", description: "MacBook Pro M4 x2", amount: 6400, category: "Hardware", date: "2026-02-07", status: "pending" },
  { id: "5", description: "Office rent - Feb", amount: 5500, category: "Office", date: "2026-02-01", status: "approved" },
  { id: "6", description: "Google Ads campaign", amount: 3200, category: "Marketing", date: "2026-02-10", status: "approved" },
  { id: "7", description: "Team offsite - Islamabad", amount: 1800, category: "Travel", date: "2026-02-12", status: "pending" },
  { id: "8", description: "Internet & phone bills", amount: 350, category: "Utilities", date: "2026-02-01", status: "approved" },
  { id: "9", description: "Standing desks x4", amount: 2200, category: "Office", date: "2026-02-15", status: "rejected" },
  { id: "10", description: "GitHub Enterprise", amount: 1200, category: "Software", date: "2026-02-08", status: "approved" },
  { id: "11", description: "LinkedIn job postings", amount: 800, category: "Marketing", date: "2026-02-18", status: "pending" },
  { id: "12", description: "Electricity bill", amount: 600, category: "Utilities", date: "2026-02-20", status: "approved" },
];

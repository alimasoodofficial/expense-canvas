export type ExpenseCategory = string;

export interface Expense {
  id: string;
  description: string;
  amount: number;
  currency_code: string;
  category: ExpenseCategory;
  date: string;
  status: "approved" | "pending" | "rejected";
  project_id?: string | null;
}

export const CATEGORIES: string[] = [
  "Salaries",
  "Software",
  "Hardware",
  "Office",
  "Marketing",
  "Travel",
  "Utilities",
  "Miscellaneous",
];

export const CATEGORY_COLORS: Record<string, string> = {
  Salaries: "hsl(217, 91%, 60%)",
  Software: "hsl(221, 83%, 53%)",
  Hardware: "hsl(214, 94%, 48%)",
  Office: "hsl(201, 96%, 32%)",
  Marketing: "hsl(199, 89%, 48%)",
  Travel: "hsl(210, 100%, 66%)",
  Utilities: "hsl(213, 94%, 68%)",
  Miscellaneous: "hsl(215, 25%, 27%)",
};

export const CATEGORY_BG: Record<string, string> = {
  Salaries: "bg-blue-50 text-blue-600",
  Software: "bg-indigo-50 text-indigo-600",
  Hardware: "bg-sky-50 text-sky-600",
  Office: "bg-cyan-50 text-cyan-700",
  Marketing: "bg-emerald-50 text-emerald-600",
  Travel: "bg-violet-50 text-violet-600",
  Utilities: "bg-amber-50 text-amber-700",
  Miscellaneous: "bg-slate-50 text-slate-600",
};

export const getCategoryColor = (category: string) => {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.Miscellaneous;
};

export const getCategoryBg = (category: string | undefined | null) => {
  if (!category) return CATEGORY_BG.Miscellaneous;
  return CATEGORY_BG[category] || "bg-blue-50 text-blue-600";
};

export const MOCK_EXPENSES: Expense[] = [
  { id: "1", description: "Developer salaries - Feb", amount: 45000, currency_code: "PKR", category: "Salaries", date: "2026-02-01", status: "approved" },
  { id: "2", description: "AWS hosting & services", amount: 2800, currency_code: "PKR", category: "Software", date: "2026-02-03", status: "approved" },
  { id: "3", description: "Figma Enterprise license", amount: 450, currency_code: "PKR", category: "Software", date: "2026-02-05", status: "approved" },
  { id: "4", description: "MacBook Pro M4 x2", amount: 6400, currency_code: "PKR", category: "Hardware", date: "2026-02-07", status: "pending" },
  { id: "5", description: "Office rent - Feb", amount: 5500, currency_code: "PKR", category: "Office", date: "2026-02-01", status: "approved" },
  { id: "6", description: "Google Ads campaign", amount: 3200, currency_code: "PKR", category: "Marketing", date: "2026-02-10", status: "approved" },
  { id: "7", description: "Team offsite - Islamabad", amount: 1800, currency_code: "PKR", category: "Travel", date: "2026-02-12", status: "pending" },
  { id: "8", description: "Internet & phone bills", amount: 350, currency_code: "PKR", category: "Utilities", date: "2026-02-01", status: "approved" },
  { id: "9", description: "Standing desks x4", amount: 2200, currency_code: "PKR", category: "Office", date: "2026-02-15", status: "rejected" },
  { id: "10", description: "GitHub Enterprise", amount: 1200, currency_code: "PKR", category: "Software", date: "2026-02-08", status: "approved" },
  { id: "11", description: "LinkedIn job postings", amount: 800, currency_code: "PKR", category: "Marketing", date: "2026-02-18", status: "pending" },
  { id: "12", description: "Electricity bill", amount: 600, currency_code: "PKR", category: "Utilities", date: "2026-02-20", status: "approved" },
];

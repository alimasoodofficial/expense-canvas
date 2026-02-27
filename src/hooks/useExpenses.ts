import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { ExpenseCategory } from "@/lib/expense-data";

export interface DbExpense {
  id: string;
  description: string;
  amount: number;
  currency_code: string;
  category: string;
  date: string;
  status: string;
  user_id: string;
  project_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useExpenses = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const expensesQuery = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return (data as DbExpense[]).map(d => ({
        ...d,
        amount: d.amount / 100,
        currency_code: d.currency_code || 'PKR'
      }));
    },
    enabled: !!user,
  });

  const addExpense = useMutation({
    mutationFn: async (expense: {
      description: string;
      amount: number;
      currency_code: string;
      category: string;
      date: string;
      status: string;
      project_id?: string | null;
    }) => {
      const { error } = await supabase.from("expenses").insert({
        ...expense,
        amount: Math.round(expense.amount * 100),
        user_id: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
  });

  const bulkAddExpenses = useMutation({
    mutationFn: async (expenses: {
      description: string;
      amount: number;
      currency_code: string;
      category: string;
      date: string;
      status: string;
      project_id?: string | null;
    }[]) => {
      const { error } = await supabase.from("expenses").insert(
        expenses.map(expense => ({
          ...expense,
          amount: Math.round(expense.amount * 100),
          user_id: user!.id,
        }))
      );
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
  });

  const deleteExpense = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
  });

  const updateExpenseStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("expenses")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
  });

  const updateExpense = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DbExpense> & { id: string }) => {
      const payload: Partial<DbExpense> = { ...updates };
      if (payload.amount !== undefined) {
        payload.amount = Math.round(payload.amount * 100);
      }
      const { error } = await supabase
        .from("expenses")
        .update(payload)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
  });

  const bulkUpdateCategory = useMutation({
    mutationFn: async ({ oldCategory, newCategory }: { oldCategory: string; newCategory: string; }) => {
      const { error } = await supabase
        .from("expenses")
        .update({ category: newCategory })
        .eq("category", oldCategory)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
  });

  return {
    expenses: expensesQuery.data ?? [],
    isLoading: expensesQuery.isLoading,
    error: expensesQuery.error,
    addExpense,
    bulkAddExpenses,
    deleteExpense,
    updateExpenseStatus,
    updateExpense,
    bulkUpdateCategory,
  };
};

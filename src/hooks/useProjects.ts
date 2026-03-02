import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Project {
    id: string;
    name: string;
    user_id: string;
    description?: string;
    budget?: number;
    payment_received?: number;
    created_at: string;
}

export const useProjects = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const projectsQuery = useQuery({
        queryKey: ["projects"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("projects")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return (data as any[]).map(p => ({
                ...p,
                budget: p.budget ? p.budget / 100 : 0,
                payment_received: p.payment_received ? p.payment_received / 100 : 0,
            })) as Project[];
        },
        enabled: !!user,
    });

    const addProject = useMutation({
        mutationFn: async (project: { name: string; description?: string; budget?: number; payment_received?: number }) => {
            const { error } = await supabase.from("projects").insert({
                ...project,
                budget: project.budget ? Math.round(project.budget * 100) : 0,
                payment_received: project.payment_received ? Math.round(project.payment_received * 100) : 0,
                user_id: user!.id,
            });
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
    });

    const updateProject = useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Project> & { id: string }) => {
            const payload: any = { ...updates };
            if (updates.budget !== undefined) payload.budget = Math.round(updates.budget * 100);
            if (updates.payment_received !== undefined) payload.payment_received = Math.round(updates.payment_received * 100);

            const { error } = await supabase
                .from("projects")
                .update(payload)
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
    });

    const deleteProject = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("projects").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
    });

    return {
        projects: projectsQuery.data ?? [],
        isLoading: projectsQuery.isLoading,
        addProject,
        updateProject,
        deleteProject,
    };
};

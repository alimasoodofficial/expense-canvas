import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Project {
    id: string;
    name: string;
    user_id: string;
    description?: string;
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
            return data as Project[];
        },
        enabled: !!user,
    });

    const addProject = useMutation({
        mutationFn: async (project: { name: string; description?: string }) => {
            const { error } = await supabase.from("projects").insert({
                ...project,
                user_id: user!.id,
            });
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
    });

    const updateProject = useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Project> & { id: string }) => {
            const { error } = await supabase
                .from("projects")
                .update(updates)
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

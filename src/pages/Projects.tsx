import { useState } from "react";
import { Plus, ArrowLeft, Folder, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useProjects } from "@/hooks/useProjects";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

const Projects = () => {
    const { user } = useAuth();
    const { projects, addProject, deleteProject } = useProjects();
    const navigate = useNavigate();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectDesc, setNewProjectDesc] = useState("");

    if (!user) return null;

    const handleAddProject = () => {
        if (!newProjectName.trim()) {
            toast.error("Project name is required");
            return;
        }
        addProject.mutate(
            { name: newProjectName.trim(), description: newProjectDesc.trim() },
            {
                onSuccess: () => {
                    toast.success("Project added successfully");
                    setIsAddOpen(false);
                    setNewProjectName("");
                    setNewProjectDesc("");
                },
                onError: () => toast.error("Failed to add project"),
            }
        );
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center py-6 px-4">
            <div className="w-full max-w-5xl space-y-6">
                <header className="flex justify-between items-center bg-card p-6 rounded-2xl shadow-sm border">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="shrink-0 text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Your Projects</h1>
                            <p className="text-sm text-muted-foreground">Manage your expense projects</p>
                        </div>
                    </div>

                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 shadow-sm">
                                <Plus className="h-4 w-4" /> Add Project
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Create New Project</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Project Name</label>
                                    <Input
                                        placeholder="E.g., Website Redesign"
                                        value={newProjectName}
                                        onChange={(e) => setNewProjectName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Description (Optional)</label>
                                    <Input
                                        placeholder="Brief details about the project"
                                        value={newProjectDesc}
                                        onChange={(e) => setNewProjectDesc(e.target.value)}
                                    />
                                </div>
                                <div className="pt-2 flex justify-end">
                                    <Button onClick={handleAddProject} className="w-full">Create Project</Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="bg-card border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                            onClick={() => navigate(`/projects/${project.id}`)}
                        >
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-primary">
                                    <Folder className="h-5 w-5" />
                                    <h3 className="font-semibold text-lg line-clamp-1">{project.name}</h3>
                                </div>
                                {project.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                                )}
                            </div>
                            <div className="pt-6 mt-auto flex items-center justify-between text-xs text-muted-foreground border-t">
                                <span>Created {format(parseISO(project.created_at), "MMM d, yyyy")}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 hover:text-destructive hover:bg-destructive/10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm('Are you certain? This will delete all expenses associated with this project.')) {
                                            deleteProject.mutate(project.id);
                                        }
                                    }}
                                >
                                    <Settings2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    ))}

                    {projects.length === 0 && (
                        <div className="col-span-full py-16 text-center bg-card rounded-2xl border shadow-sm">
                            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <Folder className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold mb-1">No Projects Found</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto mb-6">Create your first project to organize your expenses effectively.</p>
                            <Button onClick={() => setIsAddOpen(true)} className="gap-2">
                                <Plus className="h-4 w-4" /> Create Project
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Projects;

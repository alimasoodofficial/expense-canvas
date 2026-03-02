import { useState } from "react";
import { Plus, ArrowLeft, Folder, Trash2, Calendar, FileText } from "lucide-react";
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
        <div className="min-h-screen bg-background/50 flex flex-col items-center py-8 sm:py-12 px-4">
            <div className="w-full max-w-6xl space-y-8">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-card p-8 rounded-3xl shadow-sm border border-border/50 backdrop-blur-sm">
                    <div className="flex items-center gap-5">
                        <Button
                            variant="secondary"
                            size="icon"
                            onClick={() => navigate("/")}
                            className="shrink-0 h-12 w-12 rounded-2xl shadow-sm transition-transform hover:-translate-x-1"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Projects</h1>
                            <p className="text-muted-foreground font-medium">Manage and organize your business expenses</p>
                        </div>
                    </div>

                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 h-12 px-6 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                                <Plus className="h-5 w-5" /> Add New Project
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md rounded-[2rem]">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold">Create New Project</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-5 py-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Project Name</label>
                                    <Input
                                        placeholder="E.g., Website Redesign"
                                        value={newProjectName}
                                        onChange={(e) => setNewProjectName(e.target.value)}
                                        className="h-12 rounded-xl focus-visible:ring-primary/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Description</label>
                                    <Input
                                        placeholder="Add some details..."
                                        value={newProjectDesc}
                                        onChange={(e) => setNewProjectDesc(e.target.value)}
                                        className="h-12 rounded-xl focus-visible:ring-primary/20"
                                    />
                                </div>
                                <div className="pt-4">
                                    <Button onClick={handleAddProject} className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20">
                                        Create Project
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="group relative bg-card border border-border/50 rounded-[2rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 cursor-pointer flex flex-col h-full overflow-hidden border-b-4 border-b-primary/20"
                            onClick={() => navigate(`/projects/${project.id}`)}
                        >
                            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-primary/10 transition-colors" />

                            <div className="relative flex-1">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-primary/10 p-4 rounded-2xl text-primary transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                            <Folder className="h-8 w-8 fill-primary/10" />
                                        </div>
                                        <h3 className="text-2xl sm:text-3xl font-black text-primary tracking-tight leading-tight group-hover:translate-x-1 transition-transform">
                                            {project.name}
                                        </h3>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-12 w-12 rounded-2xl hover:text-white hover:bg-destructive shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 translate-x-4"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.confirm('Are you certain? This will delete all expenses associated with this project.')) {
                                                deleteProject.mutate(project.id);
                                            }
                                        }}
                                    >
                                        <Trash2 className="h-6 w-6" />
                                    </Button>
                                </div>

                                <div className="pb-6 mb-8 border-b-2 border-primary/10 relative">
                                    <p className="text-xl text-foreground/80 font-semibold tracking-tight line-clamp-2">
                                        {project.description || "No description provided"}
                                    </p>
                                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-500" />
                                </div>
                            </div>

                            <div className="relative pt-4 flex items-center justify-between">
                                <div className="flex items-center gap-2.5 text-muted-foreground/60 font-bold group-hover:text-foreground transition-colors">
                                    <Calendar className="h-5 w-5 text-primary/40" />
                                    <span className="text-sm uppercase tracking-[0.2em] leading-none">
                                        {format(parseISO(project.created_at), "MMM d, yyyy")}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                                        Active
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {projects.length === 0 && (
                        <div className="col-span-full py-24 text-center bg-card rounded-[3rem] border-2 border-dashed border-muted-foreground/20 shadow-inner">
                            <div className="mx-auto w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mb-8">
                                <Folder className="h-10 w-10 text-primary/40" />
                            </div>
                            <h3 className="text-2xl font-black mb-3 text-foreground/80 tracking-tight">Your Portfolio is Empty</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto mb-10 text-lg leading-relaxed">Organize your expenses by creating your first business project.</p>
                            <Button
                                onClick={() => setIsAddOpen(true)}
                                className="gap-3 h-16 px-10 rounded-[1.5rem] font-black text-xl shadow-xl shadow-primary/25 hover:scale-105 transition-transform"
                            >
                                <Plus className="h-6 w-6" /> Create Project
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Projects;

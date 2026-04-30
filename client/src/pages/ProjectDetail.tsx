import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Upload, Trash2, ArrowLeft, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ProjectDetail() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { projectId } = useParams<{ projectId: string }>();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [progressData, setProgressData] = useState({
    overall: "0",
    structure: "0",
    systems: "0",
    interior: "0",
  });
  const [editingProgress, setEditingProgress] = useState(false);
  const [uploadData, setUploadData] = useState({
    category: "Structure" as "Structure" | "Systems" | "Interior Finishing",
    description: "",
    images: [] as File[],
    isUploading: false,
  });

  if (!user || user.role !== "admin") {
    setLocation("/");
    return null;
  }

  const id = parseInt(projectId || "0");
  const { data, isLoading, refetch } = trpc.projects.getDetail.useQuery({ projectId: id });

  const uploadMutation = trpc.projects.uploadUpdate.useMutation({
    onSuccess: () => {
      toast.success("Update uploaded successfully");
      setUploadData({ category: "Structure", description: "", images: [], isUploading: false });
      setIsUploadOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
      setUploadData((prev) => ({ ...prev, isUploading: false }));
    },
  });

  const deleteMutation = trpc.projects.deleteUpdate.useMutation({
    onSuccess: () => {
      toast.success("Update deleted successfully");
      setDeleteId(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const regenerateCodeMutation = trpc.projects.regenerateAccessCode.useMutation({
    onSuccess: (result) => {
      toast.success("Access code regenerated");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateProgressMutation = trpc.projects.update.useMutation({
    onSuccess: () => {
      toast.success("Progress updated successfully");
      setIsProgressOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleUpdateProgress = () => {
    updateProgressMutation.mutate({
      projectId: id,
      progressPercentage: progressData.overall,
      structureProgress: progressData.structure,
      systemsProgress: progressData.systems,
      interiorProgress: progressData.interior,
    });
  };

  const handleUpload = async () => {
    if (!uploadData.description.trim()) {
      toast.error("Description is required");
      return;
    }
    if (uploadData.images.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    setUploadData((prev) => ({ ...prev, isUploading: true }));

    // For now, we'll use placeholder URLs since we need a proper file upload endpoint
    // In production, you would upload to storage first and get URLs back
    const imageUrls = uploadData.images.map((file, idx) => `/manus-storage/project-${id}-${Date.now()}-${idx}`);

    uploadMutation.mutate({
      projectId: id,
      category: uploadData.category,
      description: uploadData.description,
      imageUrls,
    });
  };

  const copyAccessCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-64 bg-slate-200 rounded animate-pulse"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-slate-600">Project not found</p>
          <Button onClick={() => setLocation("/admin")} className="mt-4">
            Back to Projects
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const { project, updates } = data;
  const categoryGroups = {
    Structure: updates.filter((u) => u.category === "Structure"),
    Systems: updates.filter((u) => u.category === "Systems"),
    "Interior Finishing": updates.filter((u) => u.category === "Interior Finishing"),
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setLocation("/admin")}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
            <p className="text-slate-600 mt-1">{project.description}</p>
          </div>
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Upload className="w-4 h-4" /> Add Update
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Project Update</DialogTitle>
                <DialogDescription>
                  Upload photos and details for a construction phase
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Work Category *</label>
                  <Select value={uploadData.category} onValueChange={(value) => setUploadData({ ...uploadData, category: value as any })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Structure">โครงสร้าง (Structure)</SelectItem>
                      <SelectItem value="Systems">งานระบบ (Systems)</SelectItem>
                      <SelectItem value="Interior Finishing">งานตกแต่ง (Interior Finishing)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Description *</label>
                  <Textarea
                    placeholder="Describe the work done in this update"
                    value={uploadData.description}
                    onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Photos *</label>
                  <div className="mt-2 border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setUploadData({ ...uploadData, images: Array.from(e.target.files || []) })}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      <p className="text-sm text-slate-600">
                        {uploadData.images.length > 0
                          ? `${uploadData.images.length} file(s) selected`
                          : "Click to select photos"}
                      </p>
                    </label>
                  </div>
                </div>
                <Button
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending || uploadData.isUploading}
                  className="w-full"
                >
                  {uploadData.isUploading ? "Uploading..." : "Upload Update"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Project Info */}
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-slate-600">Start Date</p>
                <p className="text-lg font-semibold text-slate-900">
                  {project.startDate ? format(new Date(project.startDate), "MMM d, yyyy") : "Not set"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">End Date</p>
                <p className="text-lg font-semibold text-slate-900">
                  {project.endDate ? format(new Date(project.endDate), "MMM d, yyyy") : "Not set"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Progress</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-lg font-semibold text-slate-900">{project.progressPercentage}%</p>
                  <Dialog open={isProgressOpen} onOpenChange={setIsProgressOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" onClick={() => setProgressData({ overall: project.progressPercentage, structure: project.structureProgress || "0", systems: project.systemsProgress || "0", interior: project.interiorProgress || "0" })}>
                        Update
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Update Progress</DialogTitle>
                        <DialogDescription>
                          Update overall project completion percentage
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-slate-700">Overall Progress (%)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={progressData.overall}
                            onChange={(e) => setProgressData({ ...progressData, overall: e.target.value })}
                            className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="border-t pt-4">
                          <label className="text-sm font-medium text-slate-700 block mb-3">Category Progress (%)</label>
                          <div className="space-y-3">
                            <div>
                              <label className="text-xs text-slate-600">โครงสร้าง (Structure)</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={progressData.structure}
                                onChange={(e) => setProgressData({ ...progressData, structure: e.target.value })}
                                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-slate-600">งานระบบ (Systems)</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={progressData.systems}
                                onChange={(e) => setProgressData({ ...progressData, systems: e.target.value })}
                                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-slate-600">งานตกแต่ง (Interior Finishing)</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={progressData.interior}
                                onChange={(e) => setProgressData({ ...progressData, interior: e.target.value })}
                                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={handleUpdateProgress}
                          disabled={updateProgressMutation.isPending}
                          className="w-full"
                        >
                          {updateProgressMutation.isPending ? "Updating..." : "Update Progress"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600">Access Code</p>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-lg font-mono font-bold text-slate-900">{project.accessCode}</code>
                  <button
                    onClick={() => copyAccessCode(project.accessCode)}
                    className="p-1 hover:bg-slate-100 rounded transition"
                  >
                    {copiedCode ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-600" />
                    )}
                  </button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => regenerateCodeMutation.mutate({ projectId: id })}
                    disabled={regenerateCodeMutation.isPending}
                  >
                    Regenerate
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Updates by Category */}
        <div className="space-y-6">
          {Object.entries(categoryGroups).map(([category, categoryUpdates]) => (
            <div key={category}>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                {category === "Structure" && "โครงสร้าง (Structure)"}
                {category === "Systems" && "งานระบบ (Systems)"}
                {category === "Interior Finishing" && "งานตกแต่ง (Interior Finishing)"}
              </h2>
              {categoryUpdates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {categoryUpdates.map((update) => (
                    <Card key={update.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-base">{update.description}</CardTitle>
                            <CardDescription>
                              {format(new Date(update.uploadedAt), "MMM d, yyyy HH:mm")}
                            </CardDescription>
                          </div>
                          <AlertDialog open={deleteId === update.id} onOpenChange={(open) => !open && setDeleteId(null)}>
                            <button
                              onClick={() => setDeleteId(update.id)}
                              className="p-2 hover:bg-red-50 text-red-600 rounded transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Update</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this update? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="flex gap-3">
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate({ updateId: update.id })}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </div>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardHeader>
                      {update.images && update.images.length > 0 && (
                        <CardContent>
                          <div className="grid grid-cols-2 gap-2">
                            {update.images.map((img) => (
                              <img
                                key={img.id}
                                src={img.imageUrl}
                                alt="Update"
                                className="w-full h-24 object-cover rounded"
                              />
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="text-center py-8">
                  <p className="text-slate-600">No updates yet for this category</p>
                </Card>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

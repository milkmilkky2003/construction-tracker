import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ClipboardCopy,
  Copy,
  Edit2,
  ImagePlus,
  Layers3,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type WorkCategory = "Structure" | "Systems" | "Interior Finishing";

const categoryMeta: Record<
  WorkCategory,
  { thai: string; subtitle: string; tone: string }
> = {
  Structure: {
    thai: "โครงสร้าง",
    subtitle: "งานฐานราก เสา คาน พื้น และโครงสร้างหลัก",
    tone: "bg-orange-50 text-orange-700 border-orange-200",
  },
  Systems: {
    thai: "งานระบบ",
    subtitle: "ไฟฟ้า ประปา สุขาภิบาล และระบบประกอบอาคาร",
    tone: "bg-sky-50 text-sky-700 border-sky-200",
  },
  "Interior Finishing": {
    thai: "งานตกแต่ง",
    subtitle: "ฝ้า ผนัง พื้น สี เฟอร์นิเจอร์ และเก็บงาน",
    tone: "bg-stone-100 text-stone-700 border-stone-200",
  },
};

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () =>
      reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export default function ProjectDetail() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { projectId } = useParams<{ projectId: string }>();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditUpdateOpen, setIsEditUpdateOpen] = useState(false);
  const [editingUpdateId, setEditingUpdateId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [progressData, setProgressData] = useState({
    overall: "0",
    structure: "0",
    systems: "0",
    interior: "0",
    structureStatus: "ยังไม่เริ่ม",
    systemsStatus: "ยังไม่เริ่ม",
    interiorStatus: "ยังไม่เริ่ม",
  });
  const [uploadData, setUploadData] = useState({
    category: "Structure" as WorkCategory,
    description: "",
    images: [] as File[],
    isUploading: false,
  });
  const [editUpdateData, setEditUpdateData] = useState({
    category: "Structure" as WorkCategory,
    description: "",
    existingImages: [] as { id: number; imageUrl: string }[],
    newImages: [] as File[],
    deleteImageIds: [] as number[],
    isUpdating: false,
  });

  const id = parseInt(projectId || "0");
  const { data, isLoading, refetch } = trpc.projects.getDetail.useQuery({
    projectId: id,
  }, {
    enabled: !!user && user.role === "admin" && id > 0,
  });

  const uploadMutation = trpc.projects.uploadUpdate.useMutation({
    onSuccess: () => {
      toast.success("อัปโหลด update สำเร็จ");
      setUploadData({
        category: "Structure",
        description: "",
        images: [],
        isUploading: false,
      });
      setIsUploadOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
      setUploadData((prev) => ({ ...prev, isUploading: false }));
    },
  });

  const updateUpdateMutation = trpc.projects.updateUpdate.useMutation({
    onSuccess: () => {
      toast.success("แก้ไข update สำเร็จ");
      setEditUpdateData({
        category: "Structure",
        description: "",
        existingImages: [],
        newImages: [],
        deleteImageIds: [],
        isUpdating: false,
      });
      setIsEditUpdateOpen(false);
      setEditingUpdateId(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
      setEditUpdateData((prev) => ({ ...prev, isUpdating: false }));
    },
  });

  const deleteMutation = trpc.projects.deleteUpdate.useMutation({
    onSuccess: () => {
      toast.success("ลบ update สำเร็จ");
      setDeleteId(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const regenerateCodeMutation = trpc.projects.regenerateAccessCode.useMutation({
    onSuccess: () => {
      toast.success("สร้างรหัสใหม่แล้ว");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateProgressMutation = trpc.projects.update.useMutation({
    onSuccess: () => {
      toast.success("อัปเดตความคืบหน้าสำเร็จ");
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
      structureStatus: progressData.structureStatus,
      systemsStatus: progressData.systemsStatus,
      interiorStatus: progressData.interiorStatus,
    });
  };

  const handleUpload = async () => {
    if (!uploadData.description.trim()) {
      toast.error("กรุณากรอกรายละเอียดงาน");
      return;
    }
    if (uploadData.images.length === 0) {
      toast.error("กรุณาเลือกรูปอย่างน้อย 1 รูป");
      return;
    }

    setUploadData((prev) => ({ ...prev, isUploading: true }));

    try {
      const images = await Promise.all(
        uploadData.images.map(async (file) => ({
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
          dataUrl: await readFileAsDataUrl(file),
        }))
      );

      uploadMutation.mutate({
        projectId: id,
        category: uploadData.category,
        description: uploadData.description,
        images,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เตรียมรูปไม่สำเร็จ");
      setUploadData((prev) => ({ ...prev, isUploading: false }));
    }
  };

  const openEditUpdate = (update: any) => {
    setEditingUpdateId(update.id);
    setEditUpdateData({
      category: update.category as WorkCategory,
      description: update.description || "",
      existingImages: update.images || [],
      newImages: [],
      deleteImageIds: [],
      isUpdating: false,
    });
    setIsEditUpdateOpen(true);
  };

  const handleEditUpdate = async () => {
    if (!editUpdateData.description.trim()) {
      toast.error("กรุณากรอกรายละเอียดงาน");
      return;
    }
    if (!editingUpdateId) return;

    setEditUpdateData((prev) => ({ ...prev, isUpdating: true }));

    try {
      const images = await Promise.all(
        editUpdateData.newImages.map(async (file) => ({
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
          dataUrl: await readFileAsDataUrl(file),
        }))
      );

      updateUpdateMutation.mutate({
        updateId: editingUpdateId,
        category: editUpdateData.category,
        description: editUpdateData.description,
        deleteImageIds: editUpdateData.deleteImageIds,
        images: images.length > 0 ? images : undefined,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เตรียมรูปไม่สำเร็จ");
      setEditUpdateData((prev) => ({ ...prev, isUpdating: false }));
    }
  };

  const copyAccessCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success("คัดลอกรหัสแล้ว");
    setTimeout(() => setCopiedCode(false), 1800);
  };

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "admin") {
      setLocation("/");
    }
  }, [loading, setLocation, user]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-7xl space-y-4">
          <div className="h-20 animate-pulse rounded-lg bg-white" />
          <div className="h-64 animate-pulse rounded-lg bg-white" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-7xl space-y-4">
          <div className="h-20 animate-pulse rounded-lg bg-white" />
          <div className="h-64 animate-pulse rounded-lg bg-white" />
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="rounded-lg border border-stone-200 bg-white py-12 text-center">
          <p className="text-stone-600">ไม่พบโครงการ</p>
          <Button onClick={() => setLocation("/admin")} className="mt-4">
            กลับไปหน้าโครงการ
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const { project, updates } = data;
  
  // Calculate weighted progress
  const totalWeight = 
    (project.hasStructure ? Number(project.structureWeight) : 0) +
    (project.hasSystems ? Number(project.systemsWeight) : 0) +
    (project.hasInterior ? Number(project.interiorWeight) : 0);
  
  const weightedProgress = totalWeight > 0 
    ? Math.round(
        ((project.hasStructure ? Number(project.structureProgress) * Number(project.structureWeight) : 0) +
        (project.hasSystems ? Number(project.systemsProgress) * Number(project.systemsWeight) : 0) +
        (project.hasInterior ? Number(project.interiorProgress) * Number(project.interiorWeight) : 0)) / totalWeight
      )
    : 0;

  const categoryGroups: Record<WorkCategory, typeof updates> = {
    Structure: updates.filter((u) => u.category === "Structure"),
    Systems: updates.filter((u) => u.category === "Systems"),
    "Interior Finishing": updates.filter(
      (u) => u.category === "Interior Finishing"
    ),
  };
  
  // Conditionally filter categories based on scope
  const activeCategories: WorkCategory[] = [];
  if (project.hasStructure) activeCategories.push("Structure");
  if (project.hasSystems) activeCategories.push("Systems");
  if (project.hasInterior) activeCategories.push("Interior Finishing");

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 gap-4">
              <button
                onClick={() => setLocation("/admin")}
                className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-stone-200 text-stone-500 transition hover:bg-stone-50 hover:text-stone-950"
                aria-label="กลับ"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <p className="text-sm font-medium text-orange-700">
                  รายละเอียดโครงการ
                </p>
                <h1 className="mt-1 text-3xl font-semibold leading-[1.3] text-stone-950">
                  {project.name}
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-500">
                  {project.description || "ยังไม่มีรายละเอียดโครงการ"}
                </p>
              </div>
            </div>

            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button className="h-11 gap-2 bg-orange-600 text-white hover:bg-orange-700">
                  <Upload className="h-4 w-4" />
                  เพิ่ม update
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>เพิ่ม update หน้างาน</DialogTitle>
                  <DialogDescription>
                    เลือกหมวดงาน ใส่รายละเอียด และอัปโหลดรูปภาพประกอบ
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-sm font-medium text-stone-700">
                      หมวดงาน *
                    </span>
                    <Select
                      value={uploadData.category}
                      onValueChange={(value) =>
                        setUploadData({
                          ...uploadData,
                          category: value as WorkCategory,
                        })
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {project.hasStructure && <SelectItem value="Structure">โครงสร้าง</SelectItem>}
                        {project.hasSystems && <SelectItem value="Systems">งานระบบ</SelectItem>}
                        {project.hasInterior && <SelectItem value="Interior Finishing">งานตกแต่ง</SelectItem>}
                      </SelectContent>
                    </Select>                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-stone-700">
                      รายละเอียดงาน *
                    </span>
                    <Textarea
                      placeholder="เช่น ติดตั้งวงกบชั้น 2 แล้วเสร็จ เตรียมงานฉาบผนัง"
                      value={uploadData.description}
                      onChange={(e) =>
                        setUploadData({
                          ...uploadData,
                          description: e.target.value,
                        })
                      }
                      className="mt-2"
                      rows={4}
                    />
                  </label>
                  <div>
                    <span className="text-sm font-medium text-stone-700">
                      รูปภาพ *
                    </span>
                    <label
                      htmlFor="photo-upload"
                      className="mt-2 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-center transition hover:border-orange-300 hover:bg-orange-50"
                    >
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) =>
                          setUploadData({
                            ...uploadData,
                            images: Array.from(e.target.files || []),
                          })
                        }
                        className="hidden"
                        id="photo-upload"
                      />
                      <ImagePlus className="mb-2 h-7 w-7 text-stone-400" />
                      <p className="text-sm font-medium text-stone-700">
                        {uploadData.images.length > 0
                          ? `เลือกแล้ว ${uploadData.images.length} รูป`
                          : "คลิกเพื่อเลือกรูปหน้างาน"}
                      </p>
                      <p className="mt-1 text-xs text-stone-500">
                        รองรับรูปหลายไฟล์พร้อมกัน
                      </p>
                    </label>
                  </div>
                  <Button
                    onClick={handleUpload}
                    disabled={uploadMutation.isPending || uploadData.isUploading}
                    className="h-11 w-full bg-orange-600 text-white hover:bg-orange-700"
                  >
                    {uploadData.isUploading ? "กำลังอัปโหลด..." : "อัปโหลด update"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isEditUpdateOpen} onOpenChange={setIsEditUpdateOpen}>
              <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>แก้ไข update</DialogTitle>
                  <DialogDescription>
                    แก้ไขรายละเอียด หมวดงาน หรือจัดการรูปภาพประกอบ
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-sm font-medium text-stone-700">
                      หมวดงาน *
                    </span>
                    <Select
                      value={editUpdateData.category}
                      onValueChange={(value) =>
                        setEditUpdateData({
                          ...editUpdateData,
                          category: value as WorkCategory,
                        })
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {project.hasStructure && <SelectItem value="Structure">โครงสร้าง</SelectItem>}
                        {project.hasSystems && <SelectItem value="Systems">งานระบบ</SelectItem>}
                        {project.hasInterior && <SelectItem value="Interior Finishing">งานตกแต่ง</SelectItem>}
                      </SelectContent>
                    </Select>
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-stone-700">
                      รายละเอียดงาน *
                    </span>
                    <Textarea
                      placeholder="ใส่รายละเอียดที่ต้องการแก้ไข"
                      value={editUpdateData.description}
                      onChange={(e) =>
                        setEditUpdateData({
                          ...editUpdateData,
                          description: e.target.value,
                        })
                      }
                      className="mt-2"
                      rows={4}
                    />
                  </label>
                  
                  <div>
                    <span className="text-sm font-medium text-stone-700">
                      รูปภาพเดิม
                    </span>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {editUpdateData.existingImages.filter(img => !editUpdateData.deleteImageIds.includes(img.id)).map((img) => (
                        <div key={img.id} className="relative group">
                          <img
                            src={img.imageUrl}
                            alt="รูปเดิม"
                            className="aspect-square w-full rounded-md object-cover border border-stone-200"
                          />
                          <button
                            onClick={() => setEditUpdateData({
                              ...editUpdateData,
                              deleteImageIds: [...editUpdateData.deleteImageIds, img.id]
                            })}
                            className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-sm"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      {editUpdateData.existingImages.filter(img => !editUpdateData.deleteImageIds.includes(img.id)).length === 0 && (
                        <p className="col-span-3 text-xs text-stone-500 italic">ไม่มีรูปภาพ (หรือลบออกหมดแล้ว)</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-stone-700">
                      เพิ่มรูปภาพใหม่
                    </span>
                    <label
                      htmlFor="photo-edit-upload"
                      className="mt-2 flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 px-4 py-4 text-center transition hover:border-orange-300 hover:bg-orange-50"
                    >
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) =>
                          setEditUpdateData({
                            ...editUpdateData,
                            newImages: Array.from(e.target.files || []),
                          })
                        }
                        className="hidden"
                        id="photo-edit-upload"
                      />
                      <ImagePlus className="mb-1 h-5 w-5 text-stone-400" />
                      <p className="text-xs font-medium text-stone-700">
                        {editUpdateData.newImages.length > 0
                          ? `เลือกแล้ว ${editUpdateData.newImages.length} รูป`
                          : "คลิกเพื่อเพิ่มรูปใหม่"}
                      </p>
                    </label>
                  </div>

                  <Button
                    onClick={handleEditUpdate}
                    disabled={updateUpdateMutation.isPending || editUpdateData.isUpdating}
                    className="h-11 w-full bg-orange-600 text-white hover:bg-orange-700"
                  >
                    {editUpdateData.isUpdating ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-stone-200 bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-500">
                    ความคืบหน้ารวม
                  </p>
                  <p className="mt-1 text-4xl font-semibold text-stone-950">
                    {weightedProgress}%
                  </p>
                </div>
                {/* ... existing code ... */}
                <Dialog open={isProgressOpen} onOpenChange={setIsProgressOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setProgressData({
                          overall: weightedProgress.toString(),
                          structure: project.structureProgress || "0",
                          systems: project.systemsProgress || "0",
                          interior: project.interiorProgress || "0",
                          structureStatus: project.structureStatus || "ยังไม่เริ่ม",
                          systemsStatus: project.systemsStatus || "ยังไม่เริ่ม",
                          interiorStatus: project.interiorStatus || "ยังไม่เริ่ม",
                        })
                      }
                    >
                      อัปเดต %
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>อัปเดตความคืบหน้าและสถานะ</DialogTitle>
                      <DialogDescription>
                        ใส่เปอร์เซ็นต์ สถานะของหมวดงานที่เลือกไว้
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <div className="rounded-md bg-orange-50 p-3 text-xs text-orange-800">
                        <p className="font-semibold">💡 ระบบคำนวณอัตโนมัติ:</p>
                        <p className="mt-1">ภาพรวมโครงการจะถูกคำนวณตามน้ำหนัก (%) ของหมวดงานที่คุณเลือกไว้</p>
                      </div>

                      {project.hasStructure && (
                          <div className="grid grid-cols-[1fr_1.5fr] items-end gap-4">
                            <ProgressInput
                              label="โครงสร้าง"
                              value={progressData.structure}
                              onChange={(value) => {
                                const numValue = Math.min(100, Math.max(0, parseInt(value) || 0));
                                const status = numValue >= 100 ? "เสร็จแล้ว" : numValue > 0 ? "ปฏิบัติงาน" : "ยังไม่เริ่ม";
                                setProgressData({ ...progressData, structure: numValue.toString(), structureStatus: status });
                              }}
                            />
                            <StatusSelect
                              label="สถานะโครงสร้าง"
                              value={progressData.structureStatus}
                              onChange={(value) => setProgressData({...progressData, structureStatus: value})}
                            />
                          </div>
                      )}
                      
                      {project.hasSystems && (
                        <div className="grid grid-cols-[1fr_1.5fr] items-end gap-4">
                            <ProgressInput
                              label="งานระบบ"
                              value={progressData.systems}
                              onChange={(value) => {
                                const numValue = Math.min(100, Math.max(0, parseInt(value) || 0));
                                const status = numValue >= 100 ? "เสร็จแล้ว" : numValue > 0 ? "ปฏิบัติงาน" : "ยังไม่เริ่ม";
                                setProgressData({ ...progressData, systems: numValue.toString(), systemsStatus: status });
                              }}
                            />
                            <StatusSelect
                              label="สถานะงานระบบ"
                              value={progressData.systemsStatus}
                              onChange={(value) => setProgressData({...progressData, systemsStatus: value})}
                            />
                          </div>
                      )}

                      {project.hasInterior && (
                        <div className="grid grid-cols-[1fr_1.5fr] items-end gap-4">
                            <ProgressInput
                              label="งานตกแต่ง"
                              value={progressData.interior}
                              onChange={(value) => {
                                const numValue = Math.min(100, Math.max(0, parseInt(value) || 0));
                                const status = numValue >= 100 ? "เสร็จแล้ว" : numValue > 0 ? "ปฏิบัติงาน" : "ยังไม่เริ่ม";
                                setProgressData({ ...progressData, interior: numValue.toString(), interiorStatus: status });
                              }}
                            />
                            <StatusSelect
                              label="สถานะงานตกแต่ง"
                              value={progressData.interiorStatus}
                              onChange={(value) => setProgressData({...progressData, interiorStatus: value})}
                            />
                          </div>
                      )}
                      <Button
                        onClick={handleUpdateProgress}
                        disabled={updateProgressMutation.isPending}
                        className="h-11 w-full bg-orange-600 text-white hover:bg-orange-700 mt-4"
                      >
                        บันทึกความคืบหน้า
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="h-3 rounded-full bg-stone-100">
                <div
                  className="h-3 rounded-full bg-orange-600"
                  style={{
                    width: `${Math.min(weightedProgress, 100)}%`,
                  }}
                />
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {project.hasStructure && <MiniProgress label="โครงสร้าง" value={project.structureProgress} status={project.structureStatus} />}
                {project.hasSystems && <MiniProgress label="งานระบบ" value={project.systemsProgress} status={project.systemsStatus} />}
                {project.hasInterior && <MiniProgress label="งานตกแต่ง" value={project.interiorProgress} status={project.interiorStatus} />}
              </div>
            </CardContent>
          </Card>

          <Card className="border-stone-200 bg-white shadow-sm">
            <CardContent className="grid h-full gap-4 p-5 sm:grid-cols-2 lg:grid-cols-1">
              <InfoItem
                icon={CalendarDays}
                label="ระยะเวลา"
                value={`${project.startDate ? format(new Date(project.startDate), "d MMM yyyy") : "ไม่ระบุ"} - ${project.endDate ? format(new Date(project.endDate), "d MMM yyyy") : "ไม่ระบุ"}`}
              />
              <div className="rounded-lg border border-stone-200 p-4">
                <p className="text-sm text-stone-500">รหัสสำหรับลูกค้า</p>
                <div className="mt-2 flex items-center gap-2">
                  <code className="rounded-md bg-stone-100 px-3 py-2 font-mono text-lg font-semibold text-stone-950">
                    {project.accessCode}
                  </code>
                  <button
                    onClick={() => copyAccessCode(project.accessCode)}
                    className="rounded-md border border-stone-200 p-2 text-stone-500 transition hover:bg-stone-50"
                    aria-label="คัดลอกรหัส"
                  >
                    {copiedCode ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      regenerateCodeMutation.mutate({ projectId: id })
                    }
                    disabled={regenerateCodeMutation.isPending}
                    className="gap-2"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    สร้างใหม่
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-5">
          {activeCategories.map((category) => {
            const categoryUpdates = categoryGroups[category];
            const meta = categoryMeta[category];
            return (
              <div
                key={category}
                className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm ${meta.tone}`}
                    >
                      <Layers3 className="h-4 w-4" />
                      {meta.thai}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-stone-500">
                    {categoryUpdates.length} update
                  </span>
                </div>

                {categoryUpdates.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {categoryUpdates.map((update) => (
                      <Card
                        key={update.id}
                        className="border-stone-200 shadow-none transition hover:shadow-sm"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold leading-6 text-stone-950">
                                {update.description}
                              </p>
                              <p className="mt-1 text-xs text-stone-500">
                                {format(new Date(update.uploadedAt), "d MMM yyyy HH:mm")}
                              </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-1">
                              <button
                                onClick={() => openEditUpdate(update)}
                                className="rounded-md p-2 text-stone-500 transition hover:bg-stone-50 hover:text-stone-950"
                                aria-label="แก้ไข update"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <AlertDialog
                                open={deleteId === update.id}
                                onOpenChange={(open) => !open && setDeleteId(null)}
                              >
                                <button
                                  onClick={() => setDeleteId(update.id)}
                                  className="rounded-md p-2 text-red-500 transition hover:bg-red-50"
                                  aria-label="ลบ update"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>ลบ update</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      ต้องการลบ update นี้ใช่ไหม? การลบนี้ไม่สามารถย้อนกลับได้
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <div className="flex gap-3">
                                    <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        deleteMutation.mutate({ updateId: update.id })
                                      }
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      ลบ
                                    </AlertDialogAction>
                                  </div>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>

                          {update.images && update.images.length > 0 && (
                            <div className="mt-4 grid grid-cols-3 gap-2">
                              {update.images.map((img) => (
                                <img
                                  key={img.id}
                                  src={img.imageUrl}
                                  alt="รูป update"
                                  className="aspect-square w-full rounded-md object-cover"
                                />
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 py-8 text-center text-sm text-stone-500">
                    ยังไม่มี update ในหมวดนี้
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </div>
    </DashboardLayout>
  );
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "เสร็จแล้ว":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "รอตรวจ":
      return "bg-sky-50 text-sky-700 border-sky-200";
    case "ปฏิบัติงาน":
      return "bg-amber-50 text-amber-700 border-amber-200 font-semibold animate-pulse";
    default: // ยังไม่เริ่ม
      return "bg-stone-50 text-stone-500 border-stone-200";
  }
}

function StatusSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-stone-700">{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-14 w-full border-stone-200 bg-white px-3 py-2 text-sm leading-loose">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ยังไม่เริ่ม" className="text-sm py-3">ยังไม่เริ่ม</SelectItem>
          <SelectItem value="ปฏิบัติงาน" className="text-sm py-3">ปฏิบัติงาน</SelectItem>
          <SelectItem value="รอตรวจ" className="text-sm py-3">รอตรวจ</SelectItem>
          <SelectItem value="เสร็จแล้ว" className="text-sm py-3">เสร็จแล้ว</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function MiniProgress({ label, value, status }: { label: string; value: string; status: string }) {
  const progress = Number(value || 0);
  return (
    <div className="rounded-md border border-stone-200 p-3 bg-white">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="text-stone-500 font-medium">{label}</span>
        <span className="font-semibold text-stone-950">{value || "0"}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-stone-100">
        <div
          className="h-1.5 rounded-full bg-orange-500"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10px] text-stone-400 font-medium">สถานะ</span>
        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getStatusBadgeClass(status)}`}>
          {status}
        </span>
      </div>
    </div>
  );
}

function ProgressInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-stone-700">{label} (%)</span>
      <Input
        type="number"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2"
      />
    </label>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-stone-200 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm text-stone-500">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="font-medium text-stone-950">{value}</p>
    </div>
  );
}

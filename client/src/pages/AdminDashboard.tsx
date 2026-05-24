import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  ArrowUpRight,
  Building2,
  CalendarDays,
  Check,
  ClipboardCopy,
  Copy,
  Edit2,
  FolderKanban,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type ProjectCard = {
  id: number;
  name: string;
  description: string | null;
  startDate: Date | string | null;
  endDate: Date | string | null;
  accessCode: string;
  progressPercentage: string;
  hasStructure: boolean;
  hasSystems: boolean;
  hasInterior: boolean;
  structureWeight: number;
  systemsWeight: number;
  interiorWeight: number;
};

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    hasStructure: true,
    hasSystems: true,
    hasInterior: true,
    structureWeight: 33,
    systemsWeight: 33,
    interiorWeight: 34,
  });

  const { data: projects, isLoading, refetch } = trpc.projects.list.useQuery(
    undefined,
    { enabled: !!user && user.role === "admin" }
  );

  const createMutation = trpc.projects.create.useMutation({
    onSuccess: () => {
      toast.success("สร้างโครงการสำเร็จ");
      resetForm();
      setIsCreateOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.projects.update.useMutation({
    onSuccess: () => {
      toast.success("อัปเดตโครงการสำเร็จ");
      resetForm();
      setIsCreateOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.projects.delete.useMutation({
    onSuccess: () => {
      toast.success("ลบโครงการสำเร็จ");
      setDeleteId(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "admin") {
      setLocation("/");
    }
  }, [loading, setLocation, user]);

  const resetForm = () => {
    setFormData({ 
      name: "", 
      description: "", 
      startDate: "", 
      endDate: "", 
      hasStructure: true,
      hasSystems: true,
      hasInterior: true,
      structureWeight: 33,
      systemsWeight: 33,
      interiorWeight: 34,
    });
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("กรุณากรอกชื่อโครงการ");
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description || undefined,
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      hasStructure: formData.hasStructure,
      hasSystems: formData.hasSystems,
      hasInterior: formData.hasInterior,
      structureWeight: formData.structureWeight,
      systemsWeight: formData.systemsWeight,
      interiorWeight: formData.interiorWeight,
    };

    if (editingId) {
      updateMutation.mutate({ projectId: editingId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (project: ProjectCard) => {
    setFormData({
      name: project.name,
      description: project.description || "",
      startDate: project.startDate
        ? new Date(project.startDate).toISOString().split("T")[0]
        : "",
      endDate: project.endDate
        ? new Date(project.endDate).toISOString().split("T")[0]
        : "",
      hasStructure: project.hasStructure,
      hasSystems: project.hasSystems,
      hasInterior: project.hasInterior,
      structureWeight: project.structureWeight,
      systemsWeight: project.systemsWeight,
      interiorWeight: project.interiorWeight,
    });
    setEditingId(project.id);
    setIsCreateOpen(true);
  };

  const copyAccessCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("คัดลอกรหัสแล้ว");
    setTimeout(() => setCopiedCode(null), 1800);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-64 animate-pulse rounded-[8px] bg-[#fbfaf7]" />
      </DashboardLayout>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  const projectList = (projects ?? []) as ProjectCard[];
  const filteredProjects = projectList.filter((project) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return (
      project.name.toLowerCase().includes(query) ||
      project.accessCode.toLowerCase().includes(query) ||
      (project.description ?? "").toLowerCase().includes(query)
    );
  });
  const activeProjects = projectList.length;
  const averageProgress =
    activeProjects > 0
      ? Math.round(
          projectList.reduce(
            (sum, project) => sum + Number(project.progressPercentage || 0),
            0
          ) / activeProjects
        )
      : 0;
  const completedProjects = projectList.filter(
    (project) => Number(project.progressPercentage || 0) >= 100
  ).length;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-5">
        <section className="overflow-hidden rounded-[8px] border border-[#e5ddd2] bg-[#fbfaf7] shadow-[0_18px_50px_rgba(75,60,42,0.08)]">
          <div className="grid gap-6 p-5 md:grid-cols-[1fr_auto] md:p-8">
            <div className="max-w-3xl">
              <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-[#a58762]">
                <Building2 className="h-4 w-4" />
                Admin dashboard
              </p>
              <h1 className="mt-4 text-3xl font-semibold leading-[1.35] text-[#2c241c] md:text-4xl">
                จัดการโครงการก่อสร้าง
              </h1>
              <p className="mt-3 text-sm leading-6 text-[#766a5c] md:text-base">
                สร้างโครงการ ส่งรหัสให้ลูกค้า และติดตามความคืบหน้าแต่ละไซต์งานในมุมมองเดียว
              </p>
            </div>

            <ProjectDialog
              isOpen={isCreateOpen}
              setIsOpen={setIsCreateOpen}
              editingId={editingId}
              resetForm={resetForm}
              formData={formData}
              setFormData={setFormData}
              handleSubmit={handleSubmit}
              isPending={createMutation.isPending || updateMutation.isPending}
            />
          </div>

          <div className="grid border-t border-[#ece4d9] bg-[#f6f1ea] md:grid-cols-3">
            <StatCard
              icon={FolderKanban}
              label="โครงการทั้งหมด"
              value={activeProjects.toString()}
            />
            <StatCard
              icon={ArrowUpRight}
              label="ความคืบหน้าเฉลี่ย"
              value={`${averageProgress}%`}
            />
            <StatCard
              icon={Check}
              label="โครงการเสร็จสิ้น"
              value={completedProjects.toString()}
            />
          </div>
        </section>

        <section className="rounded-[8px] border border-[#e5ddd2] bg-[#fbfaf7] p-4 shadow-sm md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#a58762]">
                Project list
              </p>
              <h2 className="mt-1 text-xl font-semibold text-[#2c241c]">
                รายการโครงการ
              </h2>
            </div>
            <div className="relative md:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a58762]" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="ค้นหาชื่อหรือรหัสโครงการ"
                className="h-10 rounded-[4px] border-[#ddd1c2] bg-white pl-9 text-sm"
              />
            </div>
          </div>
        </section>

        <section>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-64 animate-pulse rounded-[8px] border border-[#e5ddd2] bg-[#fbfaf7]"
                />
              ))}
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredProjects.map((project) => {
                const progress = Number(project.progressPercentage || 0);
                return (
                  <Card
                    key={project.id}
                    className="overflow-hidden rounded-[8px] border-[#e5ddd2] bg-[#fbfaf7] shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(75,60,42,0.10)]"
                  >
                    <CardContent className="p-0">
                      <div className="p-5">
                        <div className="mb-5 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h2 className="truncate text-lg font-semibold text-[#2c241c]">
                              {project.name}
                            </h2>
                            <p className="mt-2 line-clamp-2 min-h-[42px] text-sm leading-6 text-[#766a5c]">
                              {project.description || "ยังไม่มีรายละเอียดโครงการ"}
                            </p>
                          </div>
                          <button
                            onClick={() => setLocation(`/admin/project/${project.id}`)}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] border border-[#d8cab9] text-[#8b7660] transition hover:bg-[#efe7dc] hover:text-[#4c4137]"
                            aria-label="เปิดโครงการ"
                          >
                            <Upload className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mb-5 flex items-center gap-2 rounded-[4px] bg-[#f6f1ea] px-3 py-2 text-sm text-[#6f6254]">
                          <CalendarDays className="h-4 w-4 text-[#a58762]" />
                          <span>
                            {project.startDate
                              ? format(new Date(project.startDate), "d MMM yyyy")
                              : "ยังไม่ระบุวันเริ่ม"}
                            {" - "}
                            {project.endDate
                              ? format(new Date(project.endDate), "d MMM yyyy")
                              : "ยังไม่ระบุวันสิ้นสุด"}
                          </span>
                        </div>

                        <div>
                          <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="font-medium text-[#5f5347]">
                              ความคืบหน้า
                            </span>
                            <span className="font-semibold text-[#8b7660]">
                              {project.progressPercentage}%
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-[#e8ded1]">
                            <div
                              className="h-2 rounded-full bg-[#8b7660]"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 border-t border-[#ece4d9] bg-[#f6f1ea] p-4">
                        <button
                          onClick={() => copyAccessCode(project.accessCode)}
                          className="flex min-w-0 items-center gap-2 rounded-[4px] border border-[#ddd1c2] bg-white px-3 py-2 text-left text-sm transition hover:bg-[#fbfaf7]"
                        >
                          <ClipboardCopy className="h-4 w-4 shrink-0 text-[#a58762]" />
                          <code className="truncate font-mono font-semibold text-[#2c241c]">
                            {project.accessCode}
                          </code>
                          {copiedCode === project.accessCode ? (
                            <Check className="h-4 w-4 shrink-0 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4 shrink-0 text-[#9b8d7d]" />
                          )}
                        </button>
                        <div className="flex shrink-0 items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(project)}
                            className="rounded-[4px] border-[#d8cab9] bg-white text-[#6f6254] hover:bg-[#efe7dc]"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <AlertDialog
                            open={deleteId === project.id}
                            onOpenChange={(open) => !open && setDeleteId(null)}
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDeleteId(project.id)}
                              className="rounded-[4px] border-[#d8cab9] bg-white text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <AlertDialogContent className="rounded-[8px]">
                              <AlertDialogHeader>
                                <AlertDialogTitle>ลบโครงการ</AlertDialogTitle>
                                <AlertDialogDescription>
                                  ต้องการลบ "{project.name}" ใช่ไหม? การลบนี้ไม่สามารถย้อนกลับได้
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="flex gap-3">
                                <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    deleteMutation.mutate({ projectId: project.id })
                                  }
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  ลบโครงการ
                                </AlertDialogAction>
                              </div>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState
              hasSearch={projectList.length > 0}
              onCreate={() => {
                resetForm();
                setIsCreateOpen(true);
              }}
            />
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}

function ProjectDialog({
  isOpen,
  setIsOpen,
  editingId,
  resetForm,
  formData,
  setFormData,
  handleSubmit,
  isPending,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  editingId: number | null;
  resetForm: () => void;
  formData: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    hasStructure: boolean;
    hasSystems: boolean;
    hasInterior: boolean;
    structureWeight: number;
    systemsWeight: number;
    interiorWeight: number;
  };
  setFormData: (value: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    hasStructure: boolean;
    hasSystems: boolean;
    hasInterior: boolean;
    structureWeight: number;
    systemsWeight: number;
    interiorWeight: number;
  }) => void;
  handleSubmit: () => void;
  isPending: boolean;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={resetForm}
          className="h-10 gap-2 self-start rounded-[4px] bg-[#8b7660] px-4 text-white hover:bg-[#75624f]"
        >
          <Plus className="h-4 w-4" />
          โครงการใหม่
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[8px] sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingId ? "แก้ไขโครงการ" : "สร้างโครงการใหม่"}
          </DialogTitle>
          <DialogDescription>
            กรอกข้อมูลพื้นฐานและเลือกหมวดงานที่ต้องการ
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-[#5f5347]">ชื่อโครงการ *</span>
            <Input
              placeholder="เช่น บ้านพักอาศัยคุณสมชาย"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-2 rounded-[4px]"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[#5f5347]">รายละเอียด</span>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-2 rounded-[4px]"
              rows={3}
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-[#5f5347]">วันที่เริ่ม</span>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="mt-2 rounded-[4px]"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[#5f5347]">วันที่สิ้นสุด</span>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="mt-2 rounded-[4px]"
              />
            </label>
          </div>
          
          <div className="rounded-md border p-4 space-y-3">
             <span className="text-sm font-semibold text-[#5f5347]">หมวดงานและน้ำหนัก (%)</span>
             <div className="flex items-center gap-2">
                <input type="checkbox" checked={formData.hasStructure} onChange={(e) => setFormData({...formData, hasStructure: e.target.checked})} />
                <span className="text-sm">โครงสร้าง</span>
                <Input type="number" value={formData.structureWeight} onChange={(e) => setFormData({...formData, structureWeight: parseInt(e.target.value)||0})} className="w-20 h-8 ml-auto" />
             </div>
             <div className="flex items-center gap-2">
                <input type="checkbox" checked={formData.hasSystems} onChange={(e) => setFormData({...formData, hasSystems: e.target.checked})} />
                <span className="text-sm">งานระบบ</span>
                <Input type="number" value={formData.systemsWeight} onChange={(e) => setFormData({...formData, systemsWeight: parseInt(e.target.value)||0})} className="w-20 h-8 ml-auto" />
             </div>
             <div className="flex items-center gap-2">
                <input type="checkbox" checked={formData.hasInterior} onChange={(e) => setFormData({...formData, hasInterior: e.target.checked})} />
                <span className="text-sm">งานตกแต่ง</span>
                <Input type="number" value={formData.interiorWeight} onChange={(e) => setFormData({...formData, interiorWeight: parseInt(e.target.value)||0})} className="w-20 h-8 ml-auto" />
             </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="h-11 w-full rounded-[4px] bg-[#8b7660] text-white hover:bg-[#75624f]"
          >
            {editingId ? "บันทึกการแก้ไข" : "สร้างโครงการ"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FolderKanban;
  label: string;
  value: string;
}) {
  return (
    <div className="border-t border-[#ece4d9] p-5 first:border-t-0 md:border-l md:border-t-0 md:first:border-l-0">
      <div className="flex items-center justify-between gap-5">
        <div>
          <p className="text-sm text-[#766a5c]">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-[#2c241c]">
            {value}
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d7c7b5] text-[#a58762]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  hasSearch,
  onCreate,
}: {
  hasSearch: boolean;
  onCreate: () => void;
}) {
  return (
    <div className="rounded-[8px] border border-dashed border-[#d7c7b5] bg-[#fbfaf7] p-10 text-center">
      <FolderKanban className="mx-auto h-10 w-10 text-[#c6b49e]" />
      <h2 className="mt-4 text-lg font-semibold text-[#2c241c]">
        {hasSearch ? "ไม่พบโครงการที่ค้นหา" : "ยังไม่มีโครงการ"}
      </h2>
      <p className="mt-1 text-sm text-[#766a5c]">
        {hasSearch
          ? "ลองค้นหาด้วยชื่อหรือรหัสอื่นอีกครั้ง"
          : "เริ่มจากสร้างโครงการแรกเพื่ออัปเดตรูปและส่งรหัสให้ลูกค้า"}
      </p>
      {!hasSearch && (
        <Button
          onClick={onCreate}
          className="mt-5 gap-2 rounded-[4px] bg-[#8b7660] text-white hover:bg-[#75624f]"
        >
          <Plus className="h-4 w-4" />
          สร้างโครงการแรก
        </Button>
      )}
    </div>
  );
}

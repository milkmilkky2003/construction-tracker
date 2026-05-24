import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowLeft, CalendarDays, ChevronDown, ImageIcon, X } from "lucide-react";
import { categoryMeta as categoryLabels, getStatusBadgeClass, safeFormatDate, type WorkCategory } from "@/lib/projectUtils";


export default function ClientProjectView() {
  const [, setLocation] = useLocation();
  const { accessCode } = useParams<{ accessCode: string }>();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] =
    useState<WorkCategory>("Structure");
  const [viewMode, setViewMode] = useState<"category" | "timeline">("timeline");

  const { data, isLoading, error } = trpc.projects.getByAccessCode.useQuery(
    { accessCode: accessCode || "" },
    { enabled: !!accessCode }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f4ef]">
        <Header title="กำลังโหลดโครงการ..." onBack={() => setLocation("/")} />
        <main className="mx-auto max-w-7xl space-y-4 px-4 py-8 md:px-6">
          <div className="h-52 animate-pulse rounded-lg bg-white" />
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-28 animate-pulse rounded-lg bg-white" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f4ef] px-4">
        <Card className="w-full max-w-md border-stone-200 bg-white">
          <CardContent className="py-10 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-md bg-orange-600 text-lg font-semibold text-white">
              S
            </div>
            <h1 className="text-xl font-semibold text-stone-950">
              เกิดข้อผิดพลาด
            </h1>
            <p className="mt-2 text-sm text-stone-500">
              {error?.message || "รหัสโครงการไม่ถูกต้องหรือหมดอายุ กรุณาตรวจสอบรหัสอีกครั้ง"}
            </p>
            <Button
              onClick={() => setLocation("/")}
              variant="outline"
              className="mt-6"
            >
              กลับหน้าแรก
            </Button>
          </CardContent>
        </Card>
      </div>
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

  const categoryGroups: Partial<Record<WorkCategory, typeof updates>> = {};
  if (project.hasStructure) categoryGroups.Structure = updates.filter((u) => u.category === "Structure");
  if (project.hasSystems) categoryGroups.Systems = updates.filter((u) => u.category === "Systems");
  if (project.hasInterior) categoryGroups["Interior Finishing"] = updates.filter((u) => u.category === "Interior Finishing");

  const activeCategories = Object.keys(categoryGroups) as WorkCategory[];

  const sortedUpdates = [...updates].sort((a, b) =>
    new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );

  const allImages = updates.flatMap((update) =>
    (update.images ?? []).map((image) => ({ image, update }))
  );

  return (
    <div className="min-h-screen bg-[#f7f4ef] text-stone-950">
      <Header title={project.name} onBack={() => setLocation("/")} />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-6">
        <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm md:p-7">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="text-sm font-medium text-orange-700">
                รายงานความคืบหน้าโครงการ
              </p>
              <h1 className="mt-2 text-3xl font-semibold leading-[1.3] md:text-4xl">
                {project.name}
              </h1>
              {project.description && (
                <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">
                  {project.description}
                </p>
              )}
            </div>
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
              <p className="text-sm text-stone-500">ความคืบหน้ารวม</p>
              <p className="mt-1 text-4xl font-semibold text-orange-700">
                {weightedProgress}%
              </p>
            </div>
          </div>
          <div className="mt-6 h-3 rounded-full bg-stone-100">
            <div
              className="h-3 rounded-full bg-orange-600"
              style={{
                width: `${Math.min(
                  Number(weightedProgress || 0),
                  100
                )}%`,
              }}
            />
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <DateInfo label="เริ่มโครงการ" value={project.startDate} />
            <DateInfo label="กำหนดเสร็จ" value={project.endDate} />
          </div>
        </section>

        {/* Tab Switcher for different view modes */}
        <div className="flex border border-stone-200 bg-white rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setViewMode("timeline")}
            className={`flex-1 text-center py-2.5 text-sm font-semibold rounded-md transition-all ${
              viewMode === "timeline"
                ? "bg-orange-600 text-white shadow-sm"
                : "text-stone-600 hover:text-[#2c241c] hover:bg-stone-50"
            }`}
          >
            รายงานไทม์ไลน์ตามวันเวลา (Timeline)
          </button>
          <button
            onClick={() => setViewMode("category")}
            className={`flex-1 text-center py-2.5 text-sm font-semibold rounded-md transition-all ${
              viewMode === "category"
                ? "bg-orange-600 text-white shadow-sm"
                : "text-stone-600 hover:text-[#2c241c] hover:bg-stone-50"
            }`}
          >
            แยกตามหมวดงาน (Categories)
          </button>
        </div>

        {viewMode === "timeline" ? (
          /* Chronological Timeline view */
          <div className="relative border-l-2 border-orange-200 ml-4 md:ml-6 pl-6 md:pl-8 space-y-6 py-2">
            {sortedUpdates.length > 0 ? (
              sortedUpdates.map((update) => {
                const meta = categoryLabels[update.category as WorkCategory];
                if (!meta) return null;
                return (
                  <div key={update.id} className="relative">
                    {/* Timeline Node Point */}
                    <div className={`absolute -left-[33px] md:-left-[41px] top-1.5 flex h-[14px] w-[14px] items-center justify-center rounded-full border-2 border-white shadow-sm ${
                      update.category === "Structure" ? "bg-orange-600" :
                      update.category === "Systems" ? "bg-sky-600" : "bg-stone-700"
                    }`}>
                      <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    </div>

                    <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.tone}`}>
                            {meta.thai}
                          </span>
                          <span className="text-xs text-stone-400 font-medium">
                            รายงานความคืบหน้า
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-2 py-1 rounded">
                          {safeFormatDate(update.uploadedAt, "d MMM yyyy HH:mm น.")}
                        </span>
                      </div>

                      <p className="font-semibold text-stone-950 text-base leading-relaxed whitespace-pre-wrap">
                        {update.description}
                      </p>

                      {update.images && update.images.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
                          {update.images.map((image) => (
                            <button
                              key={image.id}
                              onClick={() => setSelectedImage(image.imageUrl)}
                              className="group overflow-hidden rounded-md border border-stone-100"
                            >
                              <img
                                src={image.imageUrl}
                                alt="รูปความคืบหน้า"
                                className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 py-12 text-center text-sm text-stone-500">
                ยังไม่มีการรายงานความคืบหน้าใด ๆ ในโครงการนี้
              </div>
            )}
          </div>
        ) : (
          /* Category Summary and Group Accordions view */
          <div className="space-y-6">
            <section className="grid gap-4 md:grid-cols-3">
              {(Object.keys(categoryGroups) as WorkCategory[]).map((category) => {
                const meta = categoryLabels[category];
                if (!meta) return null;
                const updates = categoryGroups[category] || [];
                const count = updates.length;
                const status = category === "Structure" ? project.structureStatus :
                               category === "Systems" ? project.systemsStatus :
                               project.interiorStatus;
                const progressVal = category === "Structure" ? project.structureProgress :
                                    category === "Systems" ? project.systemsProgress :
                                    project.interiorProgress;
                return (
                  <div
                    key={category}
                    className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${meta.tone}`}>
                          {meta.thai}
                        </span>
                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClass(status)}`}>
                          {status}
                        </span>
                      </div>
                      <p className="text-3xl font-bold text-stone-950">{progressVal || "0"}%</p>
                      <p className="mt-1 text-sm text-stone-500 font-medium">ความคืบหน้าหมวดงาน</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                      <span>อัปเดตทั้งหมด</span>
                      <span className="font-semibold text-stone-800">{count} รายการ</span>
                    </div>
                  </div>
                );
              })}
            </section>

            <section className="space-y-4">
              {(Object.keys(categoryGroups) as WorkCategory[]).map((category) => {
                const meta = categoryLabels[category];
                if (!meta) return null;
                const categoryUpdates = categoryGroups[category] || [];
                const isOpen = expandedCategory === category;
                const status = category === "Structure" ? project.structureStatus :
                               category === "Systems" ? project.systemsStatus :
                               project.interiorStatus;

                return (
                  <div
                    key={category}
                    className="rounded-lg border border-stone-200 bg-white shadow-sm"
                  >
                    <button
                      onClick={() => setExpandedCategory(category)}
                      className="flex w-full items-center justify-between gap-4 p-5 text-left"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${meta.tone}`}
                          >
                            {meta.thai}
                          </span>
                          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClass(status)}`}>
                            {status}
                          </span>
                        </div>
                        <p className="mt-3 font-semibold text-stone-950 text-base">
                          {meta.subtitle}
                        </p>
                        <p className="mt-1 text-xs text-stone-500 font-medium">
                          รายงานอัปเดต {categoryUpdates.length} รายการ
                        </p>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-stone-500 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="border-t border-stone-100 p-5">
                        {categoryUpdates.length > 0 ? (
                          <div className="space-y-4">
                            {categoryUpdates.map((update) => (
                              <div
                                key={update.id}
                                className="rounded-lg border border-stone-200 p-4"
                              >
                                <p className="font-medium leading-6 text-stone-950">
                                  {update.description}
                                </p>
                                <p className="mt-1 text-sm text-stone-500">
                                  {safeFormatDate(update.uploadedAt, "d MMM yyyy HH:mm")}
                                </p>
                                {update.images && update.images.length > 0 && (
                                  <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
                                    {update.images.map((image) => (
                                      <button
                                        key={image.id}
                                        onClick={() => setSelectedImage(image.imageUrl)}
                                        className="group overflow-hidden rounded-md"
                                      >
                                        <img
                                          src={image.imageUrl}
                                          alt="รูปความคืบหน้า"
                                          className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
                                        />
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 py-8 text-center text-sm text-stone-500">
                            ยังไม่มีรายการอัปเดตในหมวดนี้
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </section>
          </div>
        )}

        {allImages.length > 0 && (
          <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-orange-700" />
              <h2 className="text-xl font-semibold">แกลเลอรีรูปภาพ</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {allImages.map(({ image }) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(image.imageUrl)}
                  className="group overflow-hidden rounded-md"
                >
                  <img
                    src={image.imageUrl}
                    alt="รูปโครงการ"
                    className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
                  />
                </button>
              ))}
            </div>
          </section>
        )}
      </main>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-5xl border-0 bg-black p-0">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute right-4 top-4 z-50 rounded-md bg-white/15 p-2 text-white transition hover:bg-white/25"
            aria-label="ปิดรูป"
          >
            <X className="h-6 w-6" />
          </button>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="รูปขนาดใหญ่"
              className="max-h-[86vh] w-full rounded-lg object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:px-6">
        <button
          onClick={onBack}
          className="rounded-md border border-stone-200 p-2 text-stone-500 transition hover:bg-stone-50 hover:text-stone-950"
          aria-label="กลับ"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-orange-600 text-sm font-semibold text-white">
          S
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-stone-950">{title}</p>
          <p className="text-xs text-stone-500">SIWAKIT GROUP</p>
        </div>
      </div>
    </header>
  );
}

function DateInfo({
  label,
  value,
}: {
  label: string;
  value: Date | string | null;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-stone-200 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-orange-50 text-orange-700">
        <CalendarDays className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm text-stone-500">{label}</p>
        <p className="font-medium text-stone-950">
          {safeFormatDate(value, "d MMM yyyy")}
        </p>
      </div>
    </div>
  );
}



import { format, isValid } from "date-fns";

export type WorkCategory = "Structure" | "Systems" | "Interior Finishing";

export const categoryMeta: Record<
  WorkCategory,
  { thai: string; subtitle: string; tone: string; bar: string }
> = {
  Structure: {
    thai: "โครงสร้าง",
    subtitle: "งานฐานราก เสา คาน พื้น และโครงสร้างหลัก",
    tone: "bg-orange-50 text-orange-700 border-orange-200",
    bar: "bg-orange-600",
  },
  Systems: {
    thai: "งานระบบ",
    subtitle: "ไฟฟ้า ประปา สุขาภิบาล และระบบประกอบอาคาร",
    tone: "bg-sky-50 text-sky-700 border-sky-200",
    bar: "bg-sky-600",
  },
  "Interior Finishing": {
    thai: "งานตกแต่ง",
    subtitle: "ฝ้า ผนัง พื้น สี เฟอร์นิเจอร์ และเก็บงาน",
    tone: "bg-stone-100 text-stone-700 border-stone-200",
    bar: "bg-stone-700",
  },
};

export function getStatusBadgeClass(status: string) {
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

export function safeFormatDate(
  value: Date | string | number | null | undefined,
  formatStr: string,
  fallback = "ไม่ระบุ"
) {
  if (!value) return fallback;
  const d = new Date(value);
  return isValid(d) ? format(d, formatStr) : fallback;
}
export const categoryLabels = categoryMeta; // For backward compatibility with categoryLabels

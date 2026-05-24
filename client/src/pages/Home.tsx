import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLocation } from "wouter";
import { useState } from "react";
import {
  ArrowRight,
  Building2,
  Camera,
  CircleDollarSign,
  ClipboardCheck,
  HardHat,
  HomeIcon,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const galleryImages = [
  {
    src: "/home-images/S__5152782_0.jpg",
    alt: "ห้องนอนตกแต่งสไตล์คลาสสิก",
  },
  {
    src: "/home-images/S__5152778_0.jpg",
    alt: "ห้องน้ำตกแต่งโทนครีมชมพู",
  },
  {
    src: "/home-images/S__5152779_0.jpg",
    alt: "ห้องน้ำตกแต่งโทนสว่าง",
  },
];

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [accessCode, setAccessCode] = useState("");
  const [isAccessDialogOpen, setIsAccessDialogOpen] = useState(false);
  const [error, setError] = useState("");

  const openProject = (code = accessCode) => {
    if (!code.trim()) {
      setError("กรุณากรอกรหัสโครงการ");
      return;
    }

    const trimmedCode = code.trim().toUpperCase();
    const ACCESS_CODE_REGEX = /^[A-Z0-9]{8}$/;
    if (!ACCESS_CODE_REGEX.test(trimmedCode)) {
      setError("รหัสโครงการต้องเป็นตัวอักษรและตัวเลข 8 หลัก");
      return;
    }

    setLocation(`/project/${trimmedCode}`);
    setIsAccessDialogOpen(false);
  };

  const adminTarget = user?.role === "admin" ? "/admin" : "/admin/login";

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#2c241c]">
      <div className="min-h-screen w-full overflow-hidden bg-[#fbfaf7]">
        <header className="flex items-center justify-between px-5 py-5 sm:px-8 lg:px-12 xl:px-16">
          <button
            onClick={() => setLocation("/")}
            className="text-left leading-none"
            aria-label="กลับหน้าแรก"
          >
            <span className="block text-sm font-semibold uppercase tracking-[0.34em] text-[#6d604f]">
              Siwakit
            </span>
            <span className="mt-1 block text-xs uppercase tracking-[0.28em] text-[#b29c81]">
              Group
            </span>
          </button>

          <Button
            onClick={() => setLocation(adminTarget)}
            variant="outline"
            className="h-9 rounded-full border-[#b9aa96] bg-transparent px-4 text-sm text-[#5f5347] hover:bg-[#efe7dc]"
          >
            ผู้ดูแลระบบ
          </Button>
        </header>

        <main id="home">
          <section className="grid gap-7 px-5 pb-7 pt-3 sm:px-8 md:grid-cols-[0.82fr_1.18fr] md:pb-10 lg:min-h-[620px] lg:gap-10 lg:px-12 xl:px-16">
            <div className="flex flex-col justify-center py-4 md:min-h-[500px]">
              <p className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-[#a58762]">
                <Sparkles className="h-4 w-4" />
                Construction progress
              </p>
              <h1 className="max-w-[640px] text-[32px] font-semibold leading-[1.3] text-[#2c241c] sm:text-[43px] lg:text-[54px] xl:text-[65px]">
                ความลงตัวของดีไซน์
                <br />
                และการใช้งานจริง
              </h1>
              <p className="mt-5 max-w-[560px] text-lg leading-relaxed text-[#766a5c]">
                ติดตามความคืบหน้าโครงการก่อสร้างและงานตกแต่งภายใน พร้อมรูปอัปเดตเป็นหมวดหมู่
                เห็นภาพรวมได้ชัดเจนในที่เดียว
              </p>
              <Button
                onClick={() => setIsAccessDialogOpen(true)}
                className="mt-7 h-10 w-fit rounded-[4px] bg-[#8b7660] px-5 text-sm font-medium text-white hover:bg-[#75624f]"
              >
                ดูโครงการของคุณ
              </Button>
            </div>

            <div
              id="gallery"
              className="grid min-h-[430px] gap-4 md:grid-cols-[1fr_0.34fr] lg:min-h-[560px]"
            >
              <div className="relative overflow-hidden rounded-[3px] bg-[#e9dfd2]">
                <img
                  src={galleryImages[0].src}
                  alt={galleryImages[0].alt}
                  className="h-full min-h-[430px] w-full object-cover lg:min-h-[560px]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/35 to-transparent p-5 text-white">
                  <p className="text-sm uppercase tracking-[0.24em] text-white/75">
                    Interior update
                  </p>
                  <p className="mt-1 text-lg font-medium">
                    งานตกแต่งภายในพร้อมตรวจเช็ก
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-1">
                {galleryImages.slice(1).map((image) => (
                  <div
                    key={image.src}
                    className="overflow-hidden rounded-[3px] bg-[#e9dfd2]"
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="h-full min-h-[207px] w-full object-cover lg:min-h-[272px]"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="border-y border-[#ece4d9] bg-[#f6f1ea] px-5 py-7 sm:px-8 lg:px-12 xl:px-16">
            <div className="mx-auto w-full max-w-[1500px]">
              <p className="mb-4 text-sm font-semibold text-[#5b4d3f]">
                ค้นหาโครงการที่ได้รับสิทธิ์เข้าดู
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="กรอกรหัสโครงการของคุณ เช่น ABC12345"
                  value={accessCode}
                  onChange={(event) => {
                    setAccessCode(event.target.value.toUpperCase());
                    setError("");
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") openProject();
                  }}
                  maxLength={12}
                  className="h-11 rounded-[3px] border-[#ddd1c2] bg-white font-mono text-sm uppercase tracking-wider flex-1"
                />
                <Button
                  onClick={() => openProject()}
                  className="h-11 rounded-[3px] bg-[#7b6a58] text-sm text-white hover:bg-[#675746] px-8 sm:w-auto"
                >
                  ค้นหาโครงการ
                </Button>
              </div>
              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            </div>
          </section>

          <section
            id="service"
            className="px-5 py-9 sm:px-8 md:py-11 lg:px-12 xl:px-16"
          >
            <div className="mx-auto w-full max-w-[1500px]">
              <p className="text-sm font-semibold text-[#a58762]">
                ไลฟ์สไตล์ที่ใช่ เริ่มที่บ้านหลังนี้
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[#2c241c]">
                ดูแลรายละเอียดงานสร้างและงานตกแต่งในทุกขั้นตอน
              </h2>

              <div className="mt-8 grid gap-0 divide-y divide-[#e6ded3] border-y border-[#e6ded3] sm:grid-cols-4 sm:divide-x sm:divide-y-0">
                <Feature icon={HomeIcon} title="พื้นที่และฟังก์ชัน" />
                <Feature icon={ShieldCheck} title="ระบบที่ตรวจสอบได้" />
                <Feature icon={Building2} title="แผนงานที่ชัดเจน" />
                <Feature icon={MapPin} title="ตำแหน่งและสถานะงาน" />
              </div>
            </div>
          </section>

          <section
            id="contact"
            className="grid gap-5 bg-[#eee6db] px-5 py-8 sm:px-8 md:grid-cols-[0.8fr_1.2fr] lg:px-12 xl:px-16"
          >
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[#a58762]">
                Siwakit Group
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                ติดตามงานได้ง่ายกว่าเดิม
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <MiniStat icon={ClipboardCheck} label="อัปเดตตามหมวดงาน" />
              <MiniStat icon={Camera} label="รูปหน้างานจริง" />
              <MiniStat icon={CircleDollarSign} label="ลดเวลาการประสานงาน" />
            </div>
          </section>
        </main>
      </div>

      <Dialog open={isAccessDialogOpen} onOpenChange={setIsAccessDialogOpen}>
        <DialogContent className="rounded-[8px] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ใส่รหัสโครงการ</DialogTitle>
            <DialogDescription>
              กรอกรหัสที่ได้รับจากผู้ดูแลโครงการเพื่อดูความคืบหน้า
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="เช่น ABC12345"
              value={accessCode}
              onChange={(event) => {
                setAccessCode(event.target.value.toUpperCase());
                setError("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") openProject();
              }}
              maxLength={12}
              className="h-11 font-mono uppercase tracking-wider"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button
              onClick={() => openProject()}
              className="h-11 w-full bg-[#7b6a58] text-white hover:bg-[#675746]"
            >
              เปิดโครงการ
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
}: {
  icon: typeof HomeIcon;
  title: string;
}) {
  return (
    <div className="flex min-h-[132px] flex-col items-center justify-center px-5 py-6 text-center">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#d7c7b5] text-[#a58762]">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-[#5f5347]">{title}</p>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
}: {
  icon: typeof HardHat;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[6px] bg-[#fbfaf7] px-4 py-4 text-sm font-medium text-[#5f5347]">
      <Icon className="h-5 w-5 text-[#a58762]" />
      {label}
    </div>
  );
}

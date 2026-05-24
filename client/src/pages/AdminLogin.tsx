import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { HardHat, LockKeyhole, UserRound } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loginMutation = trpc.auth.adminLogin.useMutation();
  const utils = trpc.useUtils();
  const { user, loading } = useAuth();

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (!loading && user) {
      setLocation("/admin");
    }
  }, [loading, user, setLocation]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      return;
    }

    setIsLoading(true);
    try {
      await loginMutation.mutateAsync({ username, password });
      // Refresh auth cache before navigating so AdminDashboard sees the user immediately
      await utils.auth.me.invalidate();
      toast.success("เข้าสู่ระบบสำเร็จ");
      setLocation("/admin");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#2c241c]">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left Section - Content & Branding (Hidden on Mobile/Tablet) */}
        <section className="hidden lg:flex relative flex-col justify-between p-6 md:p-12 lg:p-16 bg-[#fbfaf7] border-r border-[#ece4d9]">
          <div className="relative z-10 flex items-center gap-3">
            <img src="/LogoNew.png" className="h-11 w-11 object-contain rounded-full border border-[#d7c7b5] bg-white p-0.5" alt="Siwakit Logo" />
            <div className="leading-none text-left">
              <span className="block text-[13px] font-semibold uppercase tracking-[0.34em] text-[#6d604f]">
                Siwakit
              </span>
              <span className="mt-1 block text-[10px] uppercase tracking-[0.28em] text-[#b29c81]">
                Group
              </span>
            </div>
          </div>

          <div className="relative z-10 max-w-2xl py-12 md:py-20">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d7c7b5] bg-[#efe7dc]/50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#a58762]">
              <HardHat className="h-4 w-4 text-[#a58762]" />
              ระบบติดตามงานก่อสร้าง
            </div>
            <h1 className="text-4xl font-semibold leading-[1.3] text-[#2c241c] sm:text-5xl lg:text-6xl">
              จัดการโครงการให้เห็นความคืบหน้าได้ชัดในที่เดียว
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-[#766a5c] md:text-lg">
              เข้าสู่ระบบเพื่อสร้างโครงการ อัปโหลดรูปหน้างาน แยกหมวดงาน และส่งรหัสให้ลูกค้าดูความคืบหน้าได้ทันที
            </p>
          </div>

          <div className="relative z-10 grid gap-4 text-sm md:grid-cols-3">
            <div className="rounded-[6px] border border-[#ece4d9] bg-[#f6f1ea] p-5 shadow-sm">
              <p className="font-semibold text-[#5f5347] text-base">โครงการ</p>
              <p className="mt-2 text-[#766a5c] leading-relaxed">สร้างและจัดการงานทั้งหมด</p>
            </div>
            <div className="rounded-[6px] border border-[#ece4d9] bg-[#f6f1ea] p-5 shadow-sm">
              <p className="font-semibold text-[#5f5347] text-base">รูปอัปเดต</p>
              <p className="mt-2 text-[#766a5c] leading-relaxed">เก็บภาพตามหมวดงาน</p>
            </div>
            <div className="rounded-[6px] border border-[#ece4d9] bg-[#f6f1ea] p-5 shadow-sm">
              <p className="font-semibold text-[#5f5347] text-base">รหัสเข้าดู</p>
              <p className="mt-2 text-[#766a5c] leading-relaxed">แชร์ให้ลูกค้าดูสถานะ</p>
            </div>
          </div>
        </section>

        {/* Right Section - Login form on top of Premium Image */}
        <section className="relative flex items-center justify-center p-6 md:p-12 lg:p-16 min-h-[500px]">
          {/* Background Image Container */}
          <div className="absolute inset-0 bg-[#e9dfd2]">
            <img 
              src="/home-images/S__5152780_0.jpg" 
              alt="Premium interior design background" 
              className="h-full w-full object-cover"
            />
            {/* Elegant warm-toned dark overlay to pop out the card */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#2c241c]/50 via-[#2c241c]/25 to-[#fbfaf7]/10 backdrop-brightness-95" />
          </div>

          {/* Frosted Glass login container */}
          <div className="relative z-10 w-full max-w-md rounded-[8px] border border-white/25 bg-white/80 p-6 md:p-8 shadow-[0_24px_64px_-16px_rgba(75,60,42,0.3)] backdrop-blur-md">
            <div className="mb-7 text-left">
              <div className="mb-3 flex items-center gap-2">
                <img src="/LogoNew.png" className="h-8 w-8 object-contain rounded-sm" alt="Siwakit Logo" />
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a58762]">Admin Console</span>
              </div>
              <h2 className="mt-2 text-3xl font-semibold text-[#2c241c]">
                เข้าสู่ระบบ
              </h2>
              <p className="mt-2 text-sm text-[#766a5c]">
                ใช้บัญชีผู้ดูแลระบบเพื่อเข้าสู่แดชบอร์ดโครงการ
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <label className="block">
                <span className="text-sm font-medium text-[#5f5347]">ชื่อผู้ใช้</span>
                <div className="relative mt-2">
                  <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a58762]" />
                  <Input
                    type="text"
                    placeholder="กรอกชื่อผู้ใช้"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    className="h-11 pl-9 border-[#ddd1c2] bg-white/90 text-[#2c241c] focus-visible:ring-[#8b7660]"
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-[#5f5347]">รหัสผ่าน</span>
                <div className="relative mt-2">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a58762]" />
                  <Input
                    type="password"
                    placeholder="กรอกรหัสผ่าน"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="h-11 pl-9 border-[#ddd1c2] bg-white/90 text-[#2c241c] focus-visible:ring-[#8b7660]"
                  />
                </div>
              </label>

              <Button
                type="submit"
                disabled={isLoading}
                className="mt-2 h-11 w-full rounded-[4px] bg-[#8b7660] text-white hover:bg-[#75624f] shadow-md transition-colors"
              >
                {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-[#9b8d7d]">
              © 2026 SIWAKIT GROUP. สงวนลิขสิทธิ์
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

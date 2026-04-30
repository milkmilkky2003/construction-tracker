import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useState } from "react";
import { ArrowRight, CheckCircle2, ImageIcon, Lock, Users } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [accessCode, setAccessCode] = useState("");
  const [isAccessDialogOpen, setIsAccessDialogOpen] = useState(false);
  const [error, setError] = useState("");

  const handleAccessProject = () => {
    if (!accessCode.trim()) {
      setError("กรุณากรอกรหัสเข้าถึงโครงการ");
      return;
    }
    setLocation(`/project/${accessCode}`);
    setIsAccessDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-orange-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-orange-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="SIWAKIT GROUP" className="w-10 h-10 object-contain" />
            <span className="text-2xl font-bold text-orange-600">SIWAKIT GROUP</span>
          </div>
          <div className="flex gap-3">
            {user ? (
              <>
                {user.role === "admin" && (
                  <Button onClick={() => setLocation("/admin")} className="bg-orange-600 hover:bg-orange-700">
                    แดชบอร์ด Admin
                  </Button>
                )}
                <Button onClick={() => setLocation("/profile")} variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
                  โปรไฟล์
                </Button>
              </>
            ) : (
              <Button onClick={() => (window.location.href = getLoginUrl())} className="bg-orange-600 hover:bg-orange-700">
                เข้าสู่ระบบ Admin
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              ติดตามความก้าวหน้า<br />งานก่อสร้างของคุณ
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              อัปเดตก่อสร้างแบบเรียลไทม์ แกลเลอรี่รูปภาพ และการติดตามความก้าวหน้า ติดตามโครงการของคุณทุกขั้นตอน
            </p>
            <div className="flex gap-4 flex-wrap">
              <Button
                size="lg"
                onClick={() => setIsAccessDialogOpen(true)}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
              >
                ดูโครงการของคุณ <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              {!user && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => (window.location.href = getLoginUrl())}
                  className="border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  เข้าถึง Admin
                </Button>
              )}
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-orange-300/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-gradient-to-br from-orange-50 to-white rounded-3xl p-12 border border-orange-200/50">
              <div className="space-y-6">
                <div className="h-64 bg-gradient-to-br from-orange-200 to-orange-100 rounded-2xl animate-pulse"></div>
                <div className="h-4 bg-gradient-to-r from-orange-200 to-orange-100 rounded-full w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gradient-to-r from-orange-200 to-orange-100 rounded-full w-1/2 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20 border-t border-orange-100">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-slate-900">
            ฟีเจอร์ที่ยอดเยี่ยม
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl border border-orange-200 bg-gradient-to-br from-white to-orange-50 hover:shadow-lg transition-shadow">
              <ImageIcon className="w-12 h-12 text-orange-600 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-slate-900">อัปเดตรูปภาพ</h3>
              <p className="text-slate-600">
                ดูรูปภาพความก้าวหน้าของโครงการของคุณแบบเรียลไทม์ พร้อมรายละเอียดและวันที่
              </p>
            </div>
            <div className="p-8 rounded-2xl border border-orange-200 bg-gradient-to-br from-white to-orange-50 hover:shadow-lg transition-shadow">
              <CheckCircle2 className="w-12 h-12 text-orange-600 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-slate-900">ติดตามความก้าวหน้า</h3>
              <p className="text-slate-600">
                ดูเปอร์เซ็นต์ความเสร็จสำหรับแต่ละหมวดหมู่งาน โครงสร้าง ระบบ และตกแต่ง
              </p>
            </div>
            <div className="p-8 rounded-2xl border border-orange-200 bg-gradient-to-br from-white to-orange-50 hover:shadow-lg transition-shadow">
              <Lock className="w-12 h-12 text-orange-600 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-slate-900">เข้าถึงแบบปลอดภัย</h3>
              <p className="text-slate-600">
                ใช้รหัสเข้าถึงเฉพาะโครงการ ไม่ต้องสมัครสมาชิก ไม่ต้องรหัสผ่าน
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-slate-900">
            วิธีการใช้งาน
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">รับรหัสเข้าถึง</h3>
              <p className="text-slate-600">
                รับรหัสเข้าถึงโครงการจาก Admin
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">ป้อนรหัส</h3>
              <p className="text-slate-600">
                ป้อนรหัสเข้าถึงเพื่อดูโครงการ
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">ติดตามความก้าวหน้า</h3>
              <p className="text-slate-600">
                ดูรูปภาพและความก้าวหน้า
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            พร้อมที่จะดูโครงการของคุณหรือยัง?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            ป้อนรหัสเข้าถึงของคุณเพื่อเริ่มติดตามความก้าวหน้า
          </p>
          <Button
            size="lg"
            onClick={() => setIsAccessDialogOpen(true)}
            className="bg-white text-orange-600 hover:bg-orange-50 font-semibold"
          >
            ดูโครงการของคุณ <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 border-t border-orange-200">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="SIWAKIT GROUP" className="w-8 h-8 object-contain" />
                <span className="font-bold text-lg">SIWAKIT GROUP</span>
              </div>
              <p className="text-slate-400">
                ระบบติดตามงานก่อสร้างแบบเรียลไทม์
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">ลิงก์ด่วน</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-orange-400 transition">หน้าแรก</a></li>
                <li><a href="#" className="hover:text-orange-400 transition">เกี่ยวกับเรา</a></li>
                <li><a href="#" className="hover:text-orange-400 transition">ติดต่อเรา</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">ติดต่อ</h4>
              <p className="text-slate-400">
                SIWAKIT GROUP<br />
                ติดตามงานก่อสร้างของคุณ
              </p>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 text-center text-slate-400">
            <p>&copy; 2026 SIWAKIT GROUP. สงวนสิทธิ์ทั้งหมด</p>
          </div>
        </div>
      </footer>

      {/* Access Code Dialog */}
      <Dialog open={isAccessDialogOpen} onOpenChange={setIsAccessDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-orange-600">ป้อนรหัสเข้าถึงโครงการ</DialogTitle>
            <DialogDescription>
              ป้อนรหัสเข้าถึง 8 ตัวอักษรที่ได้รับจาก Admin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="เช่น: ABC12345"
              value={accessCode}
              onChange={(e) => {
                setAccessCode(e.target.value.toUpperCase());
                setError("");
              }}
              className="border-orange-300 focus:border-orange-500 focus:ring-orange-500"
              maxLength={12}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button
              onClick={handleAccessProject}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              เข้าถึงโครงการ
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

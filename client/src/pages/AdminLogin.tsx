import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loginMutation = trpc.auth.adminLogin.useMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      return;
    }

    setIsLoading(true);
    try {
      await loginMutation.mutateAsync({ username, password });
      toast.success("เข้าสู่ระบบสำเร็จ");
      setLocation("/admin");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-orange-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-600 rounded-lg mb-4">
            <span className="text-2xl font-bold text-white">S</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">SIWAKIT GROUP</h1>
          <p className="text-slate-600 mt-2">ระบบติดตามงานก่อสร้าง</p>
        </div>

        {/* Login Card */}
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-600">เข้าสู่ระบบ Admin</CardTitle>
            <CardDescription>กรุณากรอกชื่อผู้ใช้และรหัสผ่าน</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  ชื่อผู้ใช้
                </label>
                <Input
                  type="text"
                  placeholder="กรอกชื่อผู้ใช้"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  รหัสผ่าน
                </label>
                <Input
                  type="password"
                  placeholder="กรอกรหัสผ่าน"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </Button>
            </form>

            <p className="text-xs text-slate-500 text-center mt-4">
              ชื่อผู้ใช้: admin | รหัสผ่าน: admin123
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-slate-600 mt-8">
          © 2026 SIWAKIT GROUP. สงวนลิขสิทธิ์
        </p>
      </div>
    </div>
  );
}

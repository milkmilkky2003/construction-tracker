import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { ArrowRight, CheckCircle2, ImageIcon, Lock, Users } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [accessCode, setAccessCode] = useState("");
  const [isAccessDialogOpen, setIsAccessDialogOpen] = useState(false);
  const [error, setError] = useState("");

  const handleAccessProject = () => {
    if (!accessCode.trim()) {
      setError("Please enter an access code");
      return;
    }
    setLocation(`/project/${accessCode}`);
    setIsAccessDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-bold text-slate-900">BuildTrack Pro</span>
          </div>
          <div className="flex gap-3">
            {user ? (
              <>
                {user.role === "admin" && (
                  <Button onClick={() => setLocation("/admin")} variant="default">
                    Admin Dashboard
                  </Button>
                )}
                <Button onClick={() => setLocation("/profile")} variant="outline">
                  Profile
                </Button>
              </>
            ) : (
              <Button onClick={() => (window.location.href = getLoginUrl())} variant="default">
                Admin Login
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
              Track Your Dream Home's Progress
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Real-time construction updates, photo galleries, and progress tracking. Stay connected to your project every step of the way.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Button
                size="lg"
                onClick={() => setIsAccessDialogOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                View Your Project <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              {!user && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => (window.location.href = getLoginUrl())}
                >
                  Admin Access
                </Button>
              )}
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-12 border border-blue-200/50">
              <div className="space-y-6">
                <div className="h-64 bg-gradient-to-br from-blue-200 to-purple-200 rounded-2xl animate-pulse"></div>
                <div className="h-4 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full w-1/2 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20 border-t border-slate-200">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-16">
            Why Choose BuildTrack Pro?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: ImageIcon,
                title: "Photo Updates",
                description: "View high-quality progress photos organized by construction phase",
              },
              {
                icon: Lock,
                title: "Secure Access",
                description: "Access your project with a unique code - no registration needed",
              },
              {
                icon: CheckCircle2,
                title: "Progress Tracking",
                description: "Monitor completion percentage and timeline for each work category",
              },
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all">
                <feature.icon className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Work Categories Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center text-slate-900 mb-16">
          Track All Construction Phases
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "โครงสร้าง",
              subtitle: "Structure",
              description: "Foundation, framing, and structural elements",
              color: "from-orange-500 to-red-500",
            },
            {
              title: "งานระบบ",
              subtitle: "Systems",
              description: "Electrical, plumbing, and HVAC installations",
              color: "from-blue-500 to-cyan-500",
            },
            {
              title: "งานตกแต่ง",
              subtitle: "Interior Finishing",
              description: "Walls, flooring, fixtures, and final touches",
              color: "from-purple-500 to-pink-500",
            },
          ].map((category, i) => (
            <div key={i} className="group">
              <div className={`h-32 bg-gradient-to-br ${category.color} rounded-2xl mb-4 group-hover:shadow-xl transition-shadow`}></div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">{category.title}</h3>
              <p className="text-sm text-blue-600 font-semibold mb-2">{category.subtitle}</p>
              <p className="text-slate-600">{category.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Track Your Project?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Enter your project access code to view real-time updates and progress
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => setIsAccessDialogOpen(true)}
            className="bg-white text-blue-600 hover:bg-blue-50"
          >
            Enter Access Code <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">B</span>
                </div>
                <span className="font-bold text-white">BuildTrack Pro</span>
              </div>
              <p className="text-sm">Premium construction project tracking</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>&copy; 2026 BuildTrack Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Access Code Dialog */}
      <Dialog open={isAccessDialogOpen} onOpenChange={setIsAccessDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Project Access Code</DialogTitle>
            <DialogDescription>
              Enter the access code provided by your project manager to view your construction progress
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter access code"
              value={accessCode}
              onChange={(e) => {
                setAccessCode(e.target.value.toUpperCase());
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleAccessProject()}
              className="text-center text-lg tracking-widest font-semibold"
            />
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            <Button onClick={handleAccessProject} className="w-full bg-blue-600 hover:bg-blue-700">
              View Project
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

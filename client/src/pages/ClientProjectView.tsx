import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowLeft, ChevronDown, X } from "lucide-react";
import { format } from "date-fns";

export default function ClientProjectView() {
  const [, setLocation] = useLocation();
  const { accessCode } = useParams<{ accessCode: string }>();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>("Structure");

  const { data, isLoading, error } = trpc.projects.getByAccessCode.useQuery(
    { accessCode: accessCode || "" },
    { enabled: !!accessCode }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-4">
          <div className="container mx-auto flex items-center gap-4">
            <button onClick={() => setLocation("/")} className="p-2 hover:bg-slate-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="h-8 bg-slate-200 rounded w-1/3 animate-pulse"></div>
          </div>
        </nav>
        <div className="container mx-auto px-4 py-12">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-slate-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <p className="text-slate-600 mb-6">Invalid or expired access code</p>
            <Button onClick={() => setLocation("/")} variant="outline">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { project, updates } = data;
  const categoryGroups = {
    Structure: updates.filter((u) => u.category === "Structure"),
    Systems: updates.filter((u) => u.category === "Systems"),
    "Interior Finishing": updates.filter((u) => u.category === "Interior Finishing"),
  };

  const categoryLabels: Record<string, { thai: string; color: string }> = {
    Structure: { thai: "โครงสร้าง", color: "from-orange-500 to-red-500" },
    Systems: { thai: "งานระบบ", color: "from-blue-500 to-cyan-500" },
    "Interior Finishing": { thai: "งานตกแต่ง", color: "from-purple-500 to-pink-500" },
  };

  const totalUpdates = updates.length;
  const categoryProgress = Object.entries(categoryGroups).map(([cat, items]) => ({
    category: cat,
    count: items.length,
    percentage: totalUpdates > 0 ? Math.round((items.length / totalUpdates) * 100) : 0,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => setLocation("/")}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900">{project.name}</h1>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        {/* Project Header */}
        <div className="mb-12">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">{project.name}</h2>
            {project.description && (
              <p className="text-lg text-slate-600 mb-6">{project.description}</p>
            )}

            {/* Timeline Info */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {project.startDate && (
                <div>
                  <p className="text-sm text-slate-600 mb-1">Project Start</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {format(new Date(project.startDate), "MMMM d, yyyy")}
                  </p>
                </div>
              )}
              {project.endDate && (
                <div>
                  <p className="text-sm text-slate-600 mb-1">Expected Completion</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {format(new Date(project.endDate), "MMMM d, yyyy")}
                  </p>
                </div>
              )}
            </div>

            {/* Overall Progress */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-semibold text-slate-700">Overall Progress</p>
                <p className="text-2xl font-bold text-blue-600">{project.progressPercentage}%</p>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-600 to-blue-700 h-3 rounded-full transition-all"
                  style={{ width: `${parseFloat(project.progressPercentage)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Progress */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {categoryProgress.map((item) => (
            <Card key={item.category} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">
                    {categoryLabels[item.category].thai}
                  </h3>
                  <span className="text-2xl font-bold text-blue-600">{item.count}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r ${categoryLabels[item.category].color}`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-600 mt-2">{item.percentage}% of updates</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Updates Timeline */}
        <div className="space-y-6">
          {Object.entries(categoryGroups).map(([category, categoryUpdates]) => (
            <div key={category}>
              <button
                onClick={() =>
                  setExpandedCategory(expandedCategory === category ? null : category)
                }
                className="w-full flex items-center justify-between p-6 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${categoryLabels[category].color} flex items-center justify-center text-white font-bold`}
                  >
                    {categoryUpdates.length}
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-slate-900">
                      {categoryLabels[category].thai}
                    </h3>
                    <p className="text-sm text-slate-600">{category}</p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-slate-600 transition-transform ${
                    expandedCategory === category ? "rotate-180" : ""
                  }`}
                />
              </button>

              {expandedCategory === category && categoryUpdates.length > 0 && (
                <div className="mt-4 space-y-4 pl-6 border-l-2 border-slate-200">
                  {categoryUpdates.map((update) => (
                    <Card key={update.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{update.description}</CardTitle>
                        <CardDescription>
                          {format(new Date(update.uploadedAt), "MMMM d, yyyy HH:mm")}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}

              {expandedCategory === category && categoryUpdates.length === 0 && (
                <div className="mt-4 pl-6 text-center py-8 text-slate-600">
                  <p>No updates yet for this category</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Photo Gallery */}
        {updates.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Photo Gallery</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {updates.map((update) =>
                update.images?.map((image) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(image.imageUrl)}
                    className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all"
                  >
                    <img
                      src={image.imageUrl}
                      alt="Project update"
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-center">
                        <p className="font-semibold">{update.description}</p>
                        <p className="text-sm text-gray-200">
                          {format(new Date(update.uploadedAt), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Image Lightbox */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 bg-black border-0">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 z-50 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition text-white"
          >
            <X className="w-6 h-6" />
          </button>
          {selectedImage && (
            <img src={selectedImage} alt="Full size" className="w-full h-auto rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

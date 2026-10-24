import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ShieldCheck } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?redirect=/admin");
  }

  if (currentUser.role !== "ADMIN") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-rose-200 p-8 text-center max-w-md shadow-lg space-y-3">
          <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Доступ запрещен</h2>
          <p className="text-xs text-slate-600">
            Этот раздел предназначен исключительно для администраторов платформы.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AdminHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 flex-1 w-full">
        {children}
      </div>
    </div>
  );
}

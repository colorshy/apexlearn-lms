"use client";

import React, { useState } from "react";
import { exportAnalyticsCsvAction } from "@/actions/admin-actions";
import { useToast } from "@/components/ui/ToastProvider";
import { Download, Loader2 } from "lucide-react";

export function ExportCsvButton() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await exportAnalyticsCsvAction();
      if (res.success && res.csv) {
        // Trigger browser file download
        const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `lms_analytics_report_${new Date().toISOString().slice(0, 10)}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Отчет CSV успешно экспортирован!");
      } else {
        toast.error("Не удалось сформировать отчет");
      }
    } catch {
      toast.error("Ошибка при экспорте");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold text-xs shadow-xs transition cursor-pointer"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      <span>Экспорт данных в CSV</span>
    </button>
  );
}

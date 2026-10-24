"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { confirmMockPaymentAction } from "@/actions/learning-actions";
import { useToast } from "@/components/ui/ToastProvider";
import { CreditCard, CheckCircle2, Loader2, ShieldCheck, Lock } from "lucide-react";

export function CheckoutForm({
  orderId,
  amountFormatted,
}: {
  orderId: string;
  amountFormatted: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await confirmMockPaymentAction(orderId);
      if (res.success) {
        toast.success("Платеж успешно обработан!");
        router.push(`/checkout/status?orderId=${orderId}`);
      } else {
        toast.error(res.error || "Ошибка оплаты");
      }
    } catch {
      toast.error("Не удалось связаться с сервером");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Visual Mock Credit Card */}
      <div className="bg-gradient-to-tr from-slate-900 to-slate-800 rounded-2xl p-5 text-white shadow-md space-y-4">
        <div className="flex justify-between items-center text-xs">
          <span className="font-mono text-slate-400">TEST CARD SIMULATION</span>
          <CreditCard className="w-5 h-5 text-slate-300" />
        </div>
        <div className="font-mono text-lg tracking-widest text-slate-200">
          •••• •••• •••• 4242
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-400">
          <div>
            <span className="block">CARD HOLDER</span>
            <span className="text-white font-semibold">STUDENT ACCOUNT</span>
          </div>
          <div>
            <span className="block">EXPIRES</span>
            <span className="text-white font-semibold">12/28</span>
          </div>
        </div>
      </div>

      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Lock className="w-4 h-4" />
            <span>Оплатить {amountFormatted}</span>
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>256-битное SSL шифрование и идемпотентная защита</span>
      </div>
    </div>
  );
}

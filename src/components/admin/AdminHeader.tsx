"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Users, BarChart3, Plus } from "lucide-react";

export function AdminHeader() {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Сводка", icon: LayoutDashboard },
    { href: "/admin/courses", label: "Курсы и модули", icon: BookOpen },
    { href: "/admin/students", label: "Студенты", icon: Users },
    { href: "/admin/analytics", label: "Аналитика и экспорт", icon: BarChart3 },
  ];

  return (
    <div className="bg-white border-b border-slate-200/80 -mt-px mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-1 overflow-x-auto">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div>
            <Link
              href="/admin/courses/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Создать новый курс</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

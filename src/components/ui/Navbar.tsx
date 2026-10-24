"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  BookOpen,
  LayoutDashboard,
  ShieldCheck,
  ShoppingBag,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { logoutAction } from "@/actions/auth-actions";
import { useToast } from "./ToastProvider";

interface UserProp {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
}

export function Navbar({ currentUser }: { currentUser: UserProp | null }) {
  const router = useRouter();
  const toast = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logoutAction();
    toast.info("Вы вышли из системы");
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              ApexLearn
            </span>
            <span className="hidden sm:inline-block ml-1.5 text-xs font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
              LMS
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-7">
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 hover:text-blue-600 transition"
          >
            Главная
          </Link>
          <Link
            href="/courses"
            className="text-sm font-medium text-slate-600 hover:text-blue-600 transition flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            Каталог курсов
          </Link>

          {currentUser && (
            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-4 h-4" />
              Мое обучение
            </Link>
          )}

          {currentUser?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1 hover:bg-amber-100 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              Панель админа
            </Link>
          )}
        </nav>

        {/* Right side auth */}
        <div className="hidden md:flex items-center gap-3">
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
                aria-expanded={userDropdownOpen}
              >
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/20"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
                <span className="text-sm font-medium text-slate-800 max-w-[120px] truncate">
                  {currentUser.name}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 animate-in fade-in zoom-in-95 duration-150 z-50"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                    <div className="mt-1">
                      <span className="inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {currentUser.role}
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                  >
                    <LayoutDashboard className="w-4 h-4 text-slate-400" />
                    Мои курсы
                  </Link>

                  <Link
                    href="/purchases"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                  >
                    <ShoppingBag className="w-4 h-4 text-slate-400" />
                    История покупок
                  </Link>

                  <Link
                    href="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    Профиль и настройки
                  </Link>

                  {currentUser.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-amber-700 hover:bg-amber-50 transition font-medium"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      Панель управления
                    </Link>
                  )}

                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Выйти
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-700 hover:text-blue-600 px-3.5 py-2 transition"
              >
                Войти
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl shadow-sm hover:shadow transition transform active:scale-95"
              >
                Начать обучение
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Меню"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 hover:text-blue-600"
          >
            Главная
          </Link>
          <Link
            href="/courses"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 hover:text-blue-600"
          >
            Каталог курсов
          </Link>

          {currentUser ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-medium text-slate-700 hover:text-blue-600"
              >
                Мое обучение
              </Link>
              <Link
                href="/purchases"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-medium text-slate-700 hover:text-blue-600"
              >
                История покупок
              </Link>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-medium text-slate-700 hover:text-blue-600"
              >
                Профиль
              </Link>
              {currentUser.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-base font-medium text-amber-700"
                >
                  Панель администратора
                </Link>
              )}
              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2 text-base font-medium text-rose-600 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Выйти из системы
                </button>
              </div>
            </>
          ) : (
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-700"
              >
                Войти
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-blue-600 text-white font-semibold"
              >
                Зарегистрироваться
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

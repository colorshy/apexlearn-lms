import React from "react";
import Link from "next/link";
import { GraduationCap, Shield, Code2, Award, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">ApexLearn</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Современная платформа непрерывного онлайн-обучения с поддержкой строгой последовательности, интерактивных квизов и подтвержденных сертификатов.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Обучение</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/courses" className="hover:text-white transition">Каталог курсов</Link>
              </li>
              <li>
                <Link href="/courses/fullstack-mastery-nextjs-typescript" className="hover:text-white transition">Full-Stack Mastery (30h)</Link>
              </li>
              <li>
                <Link href="/courses/ui-ux-design-systems-tailwind" className="hover:text-white transition">UI/UX Дизайн-системы</Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Кабинет</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/dashboard" className="hover:text-white transition">Дашборд студента</Link>
              </li>
              <li>
                <Link href="/purchases" className="hover:text-white transition">История заказов</Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-white transition">Настройки аккаунта</Link>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Надежность</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>Защищенные сессии HTTP-Only</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>Верифицируемые сертификаты</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Next.js 15, Prisma & PostgreSQL</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} ApexLearn LMS Platform. Все права защищены.</p>
          <div className="flex items-center gap-1 text-slate-500">
            <span>Спроектировано с качеством и вниманием к деталям</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

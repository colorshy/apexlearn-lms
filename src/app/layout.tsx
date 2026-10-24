import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

export const dynamic = "force-dynamic";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { ToastProvider } from "@/components/ui/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ApexLearn — Полнофункциональная платформа онлайн-обучения",
  description:
    "Образовательная LMS платформа: 30-часовые курсы, последовательное обучение, интерактивные квизы, финальные экзамены и сертификация.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-slate-900 font-sans">
        <ToastProvider>
          <Navbar currentUser={currentUser} />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}

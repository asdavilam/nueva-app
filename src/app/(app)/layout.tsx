"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import {
  LayoutDashboard, ClipboardList, TrendingUp, ShoppingBag,
  BarChart3, Target, FileText, Trophy, LogOut, ChefHat, Loader2, DollarSign
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const NAV: { href: Route<string>; label: string; icon: React.ElementType }[] = [
  { href: "/dashboard",   label: "Dashboard",        icon: LayoutDashboard },
  { href: "/checklist",   label: "Sistema 21 días",  icon: ClipboardList },
  { href: "/ventas",      label: "Gastos",            icon: DollarSign },
  { href: "/productos",   label: "Mis Productos",    icon: ShoppingBag },
  { href: "/kpis",        label: "KPIs",             icon: BarChart3 },
  { href: "/roadmap",     label: "Roadmap",          icon: Target },
  { href: "/plantillas",  label: "Plantillas",       icon: FileText },
  { href: "/logros",      label: "Logros",           icon: Trophy },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { session, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !session) router.replace("/login");
  }, [session, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="animate-spin text-accent" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-slate-800 bg-panel md:flex">
        <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-4">
          <div className="flex size-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <ChefHat size={20} />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">Burger Business</p>
            <p className="text-xs text-muted">Blueprint</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active ? "bg-accent/10 text-accent font-medium" : "text-slate-300 hover:bg-panelSoft hover:text-white"
                }`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-3">
          <p className="mb-2 truncate px-2 text-xs text-muted">{session.user.email}</p>
          <button
            onClick={() => void signOut()}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-panelSoft hover:text-white"
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="md:pl-60">
        <div className="mx-auto max-w-5xl px-4 py-6 pb-24 md:px-6 md:pb-6">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-800 bg-panel/95 backdrop-blur md:hidden">
        <div className="grid grid-cols-5 px-1 py-1">
          {NAV.slice(0, 5).map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 rounded-lg py-2 text-[10px] transition-colors ${
                  active ? "text-accent" : "text-slate-400"
                }`}
              >
                <Icon size={18} />
                <span className="truncate">{label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

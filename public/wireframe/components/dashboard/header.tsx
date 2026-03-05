"use client";

import { Search, Bell, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
      {/* Mobile Header */}
      <div className="flex items-center justify-between lg:hidden">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-100">Cosmic Gateway</h1>
          <p className="text-sm text-slate-500">Personal Dashboard</p>
        </div>
        <div className="relative">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden ring-2 ring-slate-700" />
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-amber-500 rounded-full border-2 border-[#020617]" />
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <h1 className="text-2xl font-semibold text-slate-100">Good Evening, Traveler</h1>
        <p className="text-sm text-slate-500">Personal Dashboard • {currentDate}</p>
      </div>

      <div className="hidden lg:flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            className="w-64 h-10 pl-10 pr-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-300 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
          />
        </div>

        {/* Notification Bell */}
        <button className="relative w-10 h-10 flex items-center justify-center bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-400 hover:text-slate-200 transition-colors">
          <Bell className="w-5 h-5" />
        </button>

        {/* Quick Scan Button */}
        <Button className="h-10 px-4 bg-transparent border border-amber-500 text-amber-500 hover:bg-amber-500/10 rounded-xl font-medium">
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Quick Scan
        </Button>
      </div>
    </header>
  );
}

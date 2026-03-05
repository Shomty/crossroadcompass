"use client";

import { Settings, LayoutGrid, FileText, AtSign, Headphones, User } from "lucide-react";

const navItems = [
  { icon: LayoutGrid, label: "Home", active: true },
  { icon: FileText, label: "Reports", active: false },
  { icon: AtSign, label: "Yantras", active: false },
  { icon: Headphones, label: "Coaching", active: false },
  { icon: User, label: "Profile", active: false },
];

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-[#0c1222] border-r border-slate-800/50 p-4">
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 py-2 mb-8">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </div>
        <span className="text-lg font-semibold text-slate-100">Cosmic Gateway</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              item.active
                ? "bg-slate-700/50 text-amber-500"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* User Profile */}
      <div className="mt-auto pt-4 border-t border-slate-800/50">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden" />
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-100">Traveler</p>
            <p className="text-xs text-slate-500">Pro Member</p>
          </div>
          <button className="p-2 text-slate-500 hover:text-slate-300 transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

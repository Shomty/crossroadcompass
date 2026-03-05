"use client";

import { LayoutGrid, FileText, Compass, Headphones, User } from "lucide-react";

const navItems = [
  { icon: LayoutGrid, label: "Home", active: true },
  { icon: FileText, label: "", active: false },
  { icon: Compass, label: "", active: false },
  { icon: Headphones, label: "", active: false },
  { icon: User, label: "", active: false },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-[#0c1222]/95 backdrop-blur-xl border-t border-slate-800/50">
      <div className="flex items-center justify-around py-3">
        {navItems.map((item, index) => (
          <button
            key={index}
            className={`flex flex-col items-center gap-1 px-4 py-1 ${
              item.active ? "text-amber-500" : "text-slate-500"
            }`}
          >
            <item.icon className="w-6 h-6" />
            {item.label && (
              <span className="text-xs font-medium">{item.label}</span>
            )}
          </button>
        ))}
      </div>
      {/* Home indicator line */}
      <div className="flex justify-center pb-2">
        <div className="w-32 h-1 bg-slate-600 rounded-full" />
      </div>
    </nav>
  );
}

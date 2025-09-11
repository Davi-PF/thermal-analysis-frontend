// src/components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/curvas", label: "Ligas" },
  { href: "/curvas/analise", label: "Análise Geral" },
  { href: "/curvas/comparar", label: "Comparar" },
  { href: "/curvas/analiseAvancada", label: "Análise Avançada"},
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="text-lg font-bold text-blue-600">
            🔥 Curvas Metal
          </Link>
          <div className="flex space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-blue-100 hover:text-blue-700"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  items: SidebarItem[];
  basePath: string;
  title?: string;
  className?: string;
  footer?: ReactNode;
}

export function Sidebar({ items, basePath, title = "Меню", className, footer }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "w-full md:w-64 shrink-0 h-fit rounded-3xl border border-(--outline) bg-(--card) p-6 shadow-md transition-all",
        className
      )}
    >
      <div className="mb-6 pb-6 border-b border-(--outline)">
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      </div>
      <nav className="flex flex-col space-y-1">
        {items.map((item) => {
          const href = `${basePath}${item.href}`;
          const isActive = pathname === href || (item.href !== "" && pathname.startsWith(href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive
                  ? "bg-(--primary-glass) text-(--primary) font-medium"
                  : "text-(--on-bg-medium) hover:bg-(--state-hover)"
              )}
            >
              <Icon className="size-5 shrink-0" />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      {footer && <div className="mt-6 pt-6 border-t border-(--outline)">{footer}</div>}
    </aside>
  );
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  WorkIcon, ArticleIcon, DeployedCodeIcon, DiamondIcon,
  DesignServicesIcon
} from "@/components/icons";

const navItems = [
  { label: "Дашборд", href: "", icon: ArticleIcon },
  { label: "Пользователи", href: "/users", icon: ArticleIcon },
  { label: "Заявки", href: "/orders", icon: DesignServicesIcon },
  { label: "Клиенты", href: "/clients", icon: DiamondIcon },
  { label: "Проекты", href: "/projects", icon: DeployedCodeIcon },
  { label: "Статьи", href: "/articles", icon: ArticleIcon },
  { label: "Команда", href: "/team", icon: WorkIcon },
];

export function AdminSidebar({ secret }: { secret: string }) {
  const pathname = usePathname();
  const basePath = `/admin/${secret}`;

  return (
    <aside className="w-64 border-r border-(--outline) bg-(--card) flex flex-col h-screen fixed left-0 top-0 z-40 pt-16">
      <div className="p-6 border-b border-(--outline)">
        <h1 className="font-bold text-lg tracking-tighter">Админ-панель</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const href = `${basePath}${item.href}`;
          const isActive = pathname === href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors",
                isActive ? "bg-(--primary-glass) text-(--primary)" : "text-(--on-bg-medium) hover:bg-(--state-hover)"
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

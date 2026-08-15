"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  DiamondIcon,
  ExitIcon,
} from "@/components/icons";
import { useUser } from "@/entities/user/model/user-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from 'react';

export function ProfileSidebar() {
  const [domain, setDomain] = useState('');
  const pathname = usePathname();
  const { logout } = useUser();
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDomain(window.location.hostname);
    }
  }, []);


  const navItems = [
    { label: "Профиль", href: `app.${domain}/profile`, icon: DiamondIcon },
    { label: "Настройки", href: "/app/settings", icon: DiamondIcon },
    { label: "Безопасность", href: "/app/security", icon: DiamondIcon },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <aside className="w-64 border-r border-(--outline) bg-(--card) flex flex-col h-screen fixed left-0 top-0 z-40 pt-16">
      <div className="p-6 border-b border-(--outline)">
        <h1 className="font-bold text-lg tracking-tighter">Личный кабинет</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
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
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-2 rounded-lg transition-colors text-(--on-bg-medium) hover:bg-(--state-hover)"
        >
          <ExitIcon className="size-5" />
          Выйти
        </button>
      </nav>
    </aside>
  );
}

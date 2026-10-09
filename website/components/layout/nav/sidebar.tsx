"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { SidebarSimpleIcon, SidebarIcon, CaretDownIcon } from "@phosphor-icons/react";

/**
 * A single nav item.
 *
 * `href` is a SUFFIX, not a full path — the sidebar prepends `basePath`.
 * Use "" for the base route itself (e.g. the dashboard at the root of a
 * section); pair it with `exact: true` so it doesn't match every child.
 */
export interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  /**
   * Highlight ONLY on an exact pathname match.
   *
   * Required for any item whose resolved href is a prefix of a sibling's.
   * The canonical case: a dashboard at basePath="" alongside /users, /team,
   * etc. Without this, the dashboard lights up on every child route.
   */
  exact?: boolean;
  /**
   * Nested items. A parent with `children` renders as a foldable group:
   * clicking the label navigates to the parent's own page, clicking the
   * chevron expands/collapses the children. The chevron state persists
   * in localStorage under `<storageKey>-groups`.
   */
  children?: SidebarItem[];
}

interface SidebarProps {
  items: SidebarItem[];
  /** Prepended to every item.href. Must have no trailing slash. */
  basePath: string;
  title?: string;
  className?: string;
  /** Rendered at the bottom in expanded mode, hidden when collapsed. */
  footer?: ReactNode;
  collapsible?: boolean;
  /**
   * localStorage key used to persist collapse state.
   * Omit to disable persistence (state resets on every mount).
   */
  storageKey?: string;
}

export function Sidebar({
  items,
  basePath,
  title = "Меню",
  className,
  footer,
  collapsible = true,
  storageKey,
}: SidebarProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Fold state per group, keyed by the group's href (unique within a
  // sidebar). Persisted so a returning admin keeps their last layout.
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // Restore collapse state on mount. Client-only, so the initial render
  // matches the server output and hydration is stable.
  useEffect(() => {
    if (!storageKey) return;
    try {
      if (localStorage.getItem(storageKey) === "1") setIsCollapsed(true);
      const raw = localStorage.getItem(`${storageKey}-groups`);
      if (raw) setOpenGroups(JSON.parse(raw));
    } catch {
      /* private mode / disabled storage */
    }
  }, [storageKey]);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, next ? "1" : "0");
        } catch {
          /* ignore */
        }
      }
      return next;
    });
  };

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (storageKey) {
        try {
          localStorage.setItem(`${storageKey}-groups`, JSON.stringify(next));
        } catch {
          /* ignore */
        }
      }
      return next;
    });
  };

  // Strip trailing slashes so /foo/ and /foo match identically.
  const path = pathname.replace(/\/+$/, "") || "/";

  const isItemActive = (href: string, item: SidebarItem): boolean => {
    // `exact` items match the full path only — this is how a dashboard at
    // "/admin/secret" avoids highlighting on "/admin/secret/team".
    if (item.exact) return path === href;
    // Prefix items match themselves AND their children, so a parent like
    // "/app/profile/articles" stays lit on "/app/profile/articles/foo/edit".
    return path === href || path.startsWith(href + "/");
  };

  // Auto-open any group that contains the active item, so a deep-linked
  // route reveals its parent without a manual click.
  useEffect(() => {
    const opens: Record<string, boolean> = {};
    for (const item of items) {
      if (!item.children?.length) continue;
      const active = item.children.some((c) =>
        isItemActive(`${basePath}${c.href}`, c),
      );
      if (active) opens[item.href] = true;
    }
    if (Object.keys(opens).length === 0) return;
    setOpenGroups((prev) => {
      const merged = { ...prev };
      let changed = false;
      for (const k of Object.keys(opens)) {
        if (!merged[k]) {
          merged[k] = true;
          changed = true;
        }
      }
      if (!changed) return prev;
      if (storageKey) {
        try {
          localStorage.setItem(`${storageKey}-groups`, JSON.stringify(merged));
        } catch {
          /* ignore */
        }
      }
      return merged;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, basePath]);

  // ---- Mobile: horizontal scroll of pills --------------------------------
  // The desktop vertical sidebar would eat too much vertical space on a
  // phone; a single-row scroller keeps navigation reachable and lets the
  // content own the viewport.
  if (isMobile) {
    // Flatten groups so the pill scroller stays a single row.
    const flat: { item: SidebarItem; isChild: boolean }[] = [];
    for (const item of items) {
      flat.push({ item, isChild: false });
      if (item.children) {
        for (const c of item.children) flat.push({ item: c, isChild: true });
      }
    }
    return (
      <div
        className={cn(
          "w-full overflow-x-auto py-2 border-b border-(--outline) bg-(--card)",
          "[&::-webkit-scrollbar]:hidden",
          className
        )}
      >
        <div className="flex gap-1 px-4 whitespace-nowrap">
          {flat.map(({ item, isChild }, i) => {
            const href = `${basePath}${item.href}`;
            const isActive = isItemActive(href, item);
            const Icon = item.icon;
            return (
              <Link
                key={`${item.href}-${i}`}
                href={href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors",
                  isActive
                    ? "bg-(--primary-glass) text-(--primary)"
                    : "text-(--on-bg-medium) hover:bg-(--state-hover)",
                  isChild && !isActive && "text-body-5 opacity-80",
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  // ---- Desktop: collapsible sidebar ---------------------------------------
  return (
    <aside
      data-collapsed={isCollapsed ? "true" : "false"}
      className={cn(
        "h-fit rounded-3xl border border-(--outline) bg-(--card) shadow-md",
        "transition-[width,padding] duration-200 ease-in-out",
        isCollapsed ? "w-16 p-3" : "w-64 p-3",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-(--outline)">
        {!isCollapsed && (
          <h2 className="text-heading-3 tracking-tight truncate">{title}</h2>
        )}
        {collapsible && (
          <Button
            variant="text"
            size="icon-small"
            onClick={toggleCollapsed}
            className={cn(isCollapsed ? "mx-auto" : "ml-4")}
            aria-label={isCollapsed ? "Развернуть" : "Свернуть"}
          >
            {isCollapsed ? (
              <SidebarSimpleIcon className="size-4" />
            ) : (
              <SidebarIcon className="size-4" />
            )}
          </Button>
        )}
      </div>

      <nav className="flex flex-col gap-0.5">
        {items.map((item) => {
          const href = `${basePath}${item.href}`;
          const hasChildren = !!item.children?.length;
          const childActive =
            hasChildren &&
            item.children!.some((c) =>
              isItemActive(`${basePath}${c.href}`, c),
            );
          const selfActive = isItemActive(href, item);
          const anyActive = selfActive || childActive;
          const Icon = item.icon;

          // ── Plain link ─────────────────────────────────────────────
          if (!hasChildren) {
            return (
              <Tooltip
                key={item.href}
                delayDuration={0}
                disableHoverableContent={!isCollapsed}
              >
                <TooltipTrigger asChild>
                  <Button
                    variant={anyActive ? "glass" : "text"}
                    className={cn(
                      isCollapsed ? "justify-center" : "justify-start",
                      "p-3"
                    )}
                    asChild
                  >
                    <Link href={href}>
                      <Icon className="size-5 shrink-0" />
                      {!isCollapsed && (
                        <span className="text-sm">{item.label}</span>
                      )}
                    </Link>
                  </Button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent
                    side="right"
                    sideOffset={8}
                    className="hidden md:block"
                  >
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          }

          // ── Foldable group ─────────────────────────────────────────
          const groupOpen = !!openGroups[item.href];
          return (
            <div key={item.href} className="flex flex-col">
              <div
                className={cn(
                  "flex items-stretch rounded-lg transition-colors",
                  anyActive && "bg-(--primary-glass)",
                )}
              >
                <Tooltip
                  delayDuration={0}
                  disableHoverableContent={!isCollapsed}
                >
                  <TooltipTrigger asChild>
                    <Link
                      href={href}
                      className={cn(
                        "flex flex-1 items-center gap-3 rounded-lg p-3 transition-colors",
                        "hover:bg-(--state-hover)",
                        isCollapsed && "justify-center",
                        anyActive && "text-(--primary)",
                      )}
                    >
                      <Icon className="size-5 shrink-0" />
                      {!isCollapsed && (
                        <span className="text-sm font-medium">
                          {item.label}
                        </span>
                      )}
                    </Link>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent
                      side="right"
                      sideOffset={8}
                      className="hidden md:block"
                    >
                      {item.label}
                    </TooltipContent>
                  )}
                </Tooltip>
                {!isCollapsed && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleGroup(item.href);
                    }}
                    aria-expanded={groupOpen}
                    aria-label={groupOpen ? "Свернуть" : "Развернуть"}
                    className={cn(
                      "flex items-center justify-center px-3 rounded-lg transition-colors",
                      "hover:bg-(--state-hover)",
                    )}
                  >
                    <CaretDownIcon
                      className={cn(
                        "size-3.5 text-(--on-bg-low) transition-transform duration-200",
                        groupOpen && "rotate-180",
                      )}
                    />
                  </button>
                )}
              </div>
              {groupOpen && !isCollapsed && (
                <div className="mt-0.5 mb-1 flex flex-col gap-0.5 ml-[26px] pl-3 border-l border-(--outline)/60">
                  {item.children!.map((child) => {
                    const childHref = `${basePath}${child.href}`;
                    const active = isItemActive(childHref, child);
                    const ChildIcon = child.icon;
                    return (
                      <Link
                        key={child.href}
                        href={childHref}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                          active
                            ? "bg-(--primary-glass) text-(--primary)"
                            : "text-(--on-bg-medium) hover:bg-(--state-hover) hover:text-(--on-bg-high)",
                        )}
                      >
                        <ChildIcon className="size-4 shrink-0" />
                        <span>{child.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {footer && !isCollapsed && (
        <div className="mt-4 pt-3 border-t border-(--outline)">{footer}</div>
      )}
    </aside>
  );
}

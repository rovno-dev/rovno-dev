"use client";
import { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SlidersHorizontalIcon, XIcon } from "@phosphor-icons/react";

export function FilterDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  onReset,
  hasActiveFilters,
  resultCount,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
  onReset: () => void;
  hasActiveFilters: boolean;
  resultCount: number;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full sm:max-w-md p-0 gap-0 flex flex-col"
      >
        <SheetHeader className="px-6 py-5 border-b border-(--outline) shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <SheetTitle className="flex items-center gap-2.5 text-heading-2 tracking-tight">
                <SlidersHorizontalIcon className="size-5 shrink-0" weight="bold" />
                {title}
              </SheetTitle>
              <SheetDescription className="text-body-4 text-(--on-bg-low) mt-1 tabular-nums">
                {description}
              </SheetDescription>
            </div>
            <SheetClose asChild>
              <Button
                variant="text"
                size="icon-small"
                className="shrink-0 -mr-2"
                aria-label="Закрыть"
              >
                <XIcon className="size-4" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto scrollbar-admin">
          <div className="px-6 py-6 space-y-8">{children}</div>
        </div>
        <SheetFooter className="px-6 py-4 border-t border-(--outline) shrink-0 flex-row gap-2">
          <Button
            variant="outlined"
            onClick={onReset}
            disabled={!hasActiveFilters}
            className="flex-1 h-11"
          >
            Сбросить
          </Button>
          <Button onClick={() => onOpenChange(false)} className="flex-1 h-11">
            Показать {resultCount}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

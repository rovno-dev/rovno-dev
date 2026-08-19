"use client";
import { ReactNode } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface AdminTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function AdminTable<T>({ data, columns, isLoading = false, emptyMessage = "Нет данных" }: AdminTableProps<T>) {
  if (isLoading) {
    return (
      <div className="p-4 bg-(--card) rounded-xl border border-(--outline)/50">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-muted/30 animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return <p className="text-muted-foreground text-center py-8">{emptyMessage}</p>;
  }

  return (
    <div className="w-full overflow-hidden rounded-xl bg-(--card)">
      <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-(--outline)/60 bg-(--primary-glass)">
              {columns.map((col, idx) => {
                const isLast = idx === columns.length - 1;
                return (
                  <TableHead
                    key={col.key as string}
                    className={cn(
                      "h-10 px-3 sm:px-4 text-[11px] uppercase tracking-wider text-(--on-bg-low) font-medium whitespace-nowrap",
                      !isLast && "border-r border-(--outline)/40",
                      isLast && "sticky right-0 bg-(--primary-glass) z-10 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)]",
                      col.className
                    )}
                  >
                    {col.header}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow
                key={index}
                className="border-b border-(--outline)/30 hover:bg-(--state-hover) transition-colors"
              >
                {columns.map((col, idx) => {
                  const isLast = idx === columns.length - 1;
                  return (
                    <TableCell
                      key={col.key as string}
                      className={cn(
                        "py-3 px-3 sm:px-4 text-sm text-(--on-bg-medium)",
                        !isLast && "border-r border-(--outline)/30",
                        isLast && "sticky right-0 bg-(--card) z-10 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)]",
                        col.className
                      )}
                    >
                      {col.render ? col.render(item) : (item[col.key as keyof T] as ReactNode)}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

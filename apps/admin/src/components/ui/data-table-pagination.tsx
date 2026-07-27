"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DataTablePaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  entityName?: string;
  limitOptions?: number[];
  className?: string;
}

export function DataTablePagination({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
  entityName = "items",
  limitOptions = [5, 10, 25, 50],
  className = "",
}: DataTablePaginationProps) {
  if (total <= 0) return null;

  // Displayed item count formatting: e.g. "Showing 10 of 14 products"
  const displayedCount = Math.min(page * limit, total);
  const safeTotalPages = Math.max(1, totalPages || Math.ceil(total / limit));

  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-t border-border bg-card/40 ${className}`}
    >
      {/* Left Info & Per-page selector */}
      <div className="flex items-center gap-4">
        <div className="text-xs text-muted-foreground font-medium">
          Showing <span className="font-bold text-foreground">{displayedCount}</span> of{" "}
          <span className="font-bold text-foreground">{total}</span> {entityName}
        </div>

        {onLimitChange && (
          <div className="flex items-center gap-2 border-l border-border pl-4">
            <span className="text-xs text-muted-foreground font-semibold">Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => {
                onLimitChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="h-8 rounded-md border border-border bg-card px-2.5 text-xs font-semibold text-foreground outline-none cursor-pointer focus:border-primary transition-colors"
            >
              {limitOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right Controls: First, Prev, Page Counter, Next, Last */}
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="xs"
          onClick={() => onPageChange(1)}
          disabled={page <= 1}
          title="First Page"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="xs"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
        </Button>

        <span className="px-3 text-xs font-bold text-foreground font-mono">
          {page} / {safeTotalPages}
        </span>

        <Button
          variant="outline"
          size="xs"
          onClick={() => onPageChange(Math.min(safeTotalPages, page + 1))}
          disabled={page >= safeTotalPages}
        >
          Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
        </Button>
        <Button
          variant="outline"
          size="xs"
          onClick={() => onPageChange(safeTotalPages)}
          disabled={page >= safeTotalPages}
          title="Last Page"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

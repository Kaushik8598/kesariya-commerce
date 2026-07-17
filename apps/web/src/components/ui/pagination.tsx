"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);

      if (start === 1) {
        end = maxVisible;
      } else if (end === totalPages) {
        start = totalPages - maxVisible + 1;
      }

      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  return (
    <nav className="flex items-center justify-center gap-1.5 my-8 select-none">
      {/* Prev Button */}
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={currentPage === 1 || disabled}
        onClick={() => onPageChange(currentPage - 1)}
        className="h-9 w-9 text-foreground hover:bg-secondary disabled:opacity-40 transition-all cursor-pointer"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Page Numbers */}
      {getPageNumbers().map((page) => (
        <Button
          key={page}
          type="button"
          variant={currentPage === page ? "default" : "outline"}
          size="icon"
          disabled={disabled}
          onClick={() => onPageChange(page)}
          className={`h-9 w-9 text-xs font-bold tracking-wider transition-all cursor-pointer ${
            currentPage === page
              ? "shadow-xs"
              : "text-foreground hover:bg-secondary"
          }`}
        >
          {page}
        </Button>
      ))}

      {/* Next Button */}
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={currentPage === totalPages || disabled}
        onClick={() => onPageChange(currentPage + 1)}
        className="h-9 w-9 text-foreground hover:bg-secondary disabled:opacity-40 transition-all cursor-pointer"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}

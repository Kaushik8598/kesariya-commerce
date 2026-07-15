"use client";

import React, { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  options: Option[];
  value: string | string[];
  onChange: (value: any) => void;
  placeholder?: string;
  multiple?: boolean;
  label?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  multiple = false,
  label,
}: SelectProps) {
  const [open, setOpen] = useState(false);

  const handleSelectSingle = (currentValue: string) => {
    onChange(currentValue === value ? "" : currentValue);
    setOpen(false);
  };

  const handleSelectMultiple = (optionValue: string) => {
    const currentValues = Array.isArray(value) ? value : [];
    if (currentValues.includes(optionValue)) {
      onChange(currentValues.filter((v) => v !== optionValue));
    } else {
      onChange([...currentValues, optionValue]);
    }
  };

  const handleRemoveMultiple = (e: React.MouseEvent, valToRemove: string) => {
    e.stopPropagation();
    const currentValues = Array.isArray(value) ? value : [];
    onChange(currentValues.filter((v) => v !== valToRemove));
  };

  // Render for Single Select (Combobox)
  if (!multiple) {
    const activeOption = options.find((opt) => opt.value === value);

    return (
      <div className="flex flex-col gap-1.5 w-full text-left">
        {label && (
          <Label className="text-xs font-extrabold tracking-widest text-foreground/75 uppercase">
            {label}
          </Label>
        )}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            className={cn(
              "w-full flex h-9 items-center justify-between gap-2 rounded-md border border-input bg-card px-3 py-2 text-xs font-semibold shadow-xs transition-colors focus:outline-hidden focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-left cursor-pointer"
            )}
          >
            <span className="truncate">
              {activeOption ? activeOption.label : placeholder}
            </span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-55" />
          </PopoverTrigger>
          <PopoverContent className="w-[--anchor-width] p-0 bg-popover border border-border" align="start">
            <Command>
              <CommandInput placeholder="Search options..." className="h-9 text-xs" />
              <CommandList>
                <CommandEmpty className="text-xs py-2 px-3 text-muted-foreground font-semibold">No options found.</CommandEmpty>
                <CommandGroup>
                  {options.map((opt) => (
                    <CommandItem
                      key={opt.value}
                      value={opt.label}
                      onSelect={() => handleSelectSingle(opt.value)}
                      className="text-xs font-semibold flex items-center justify-between py-1.5 px-2 cursor-pointer rounded-sm hover:bg-accent hover:text-accent-foreground"
                    >
                      {opt.label}
                      <Check
                        className={cn(
                          "h-4 w-4 text-primary",
                          value === opt.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  // Render for Multi Select (Combobox Tagged Input)
  const currentValues = Array.isArray(value) ? value : [];

  return (
    <div className="flex flex-col gap-1.5 w-full text-left">
      {label && (
        <Label className="text-xs font-extrabold tracking-widest text-foreground/75 uppercase">
          {label}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className={cn(
            "w-full flex min-h-9 items-center justify-between gap-2 rounded-md border border-input bg-card px-3 py-1.5 text-xs font-semibold shadow-xs transition-colors focus:outline-hidden focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-left cursor-pointer"
          )}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {currentValues.length === 0 ? (
              <span className="text-foreground/45">{placeholder}</span>
            ) : (
              currentValues.map((v) => {
                const opt = options.find((o) => o.value === v);
                return (
                  <span
                    key={v}
                    className="flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-[10px] font-bold text-foreground tracking-wider uppercase border border-border"
                  >
                    {opt?.label || v}
                    <button
                      type="button"
                      onClick={(e) => handleRemoveMultiple(e, v)}
                      className="rounded-full hover:bg-foreground/15 p-0.5 text-foreground/60 transition-colors"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                );
              })
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-55" />
        </PopoverTrigger>
        <PopoverContent className="w-[--anchor-width] p-0 bg-popover border border-border" align="start">
          <Command>
            <CommandInput placeholder="Search options..." className="h-9 text-xs" />
            <CommandList>
              <CommandEmpty className="text-xs py-2 px-3 text-muted-foreground font-semibold">No options found.</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => {
                  const isSelected = currentValues.includes(opt.value);
                  return (
                    <CommandItem
                      key={opt.value}
                      value={opt.label}
                      onSelect={() => handleSelectMultiple(opt.value)}
                      className="text-xs font-semibold flex items-center justify-between py-1.5 px-2 cursor-pointer rounded-sm hover:bg-accent hover:text-accent-foreground"
                    >
                      {opt.label}
                      <Check
                        className={cn(
                          "h-4 w-4 text-primary",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

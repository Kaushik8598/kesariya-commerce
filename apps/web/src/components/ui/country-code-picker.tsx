"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCountries } from "@/hooks/profile/use-profile";

interface CountryCodePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export function getFlagEmoji(countryCode: string) {
  if (!countryCode || countryCode.length !== 2) return "";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function CountryCodePicker({
  value,
  onChange,
  className,
  disabled,
}: CountryCodePickerProps) {
  const [open, setOpen] = useState(false);
  const { data: countries } = useCountries();

  // Find the currently selected country object
  const selectedCountry = countries?.find((c: any) => c.phoneCode === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        className={cn(
          "flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 h-10",
          className,
        )}
      >
        <span>{selectedCountry ? selectedCountry.phoneCode : "Code"}</span>
        <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search country code..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countries?.map((c: any) => (
                <CommandItem
                  key={c.id}
                  value={`${c.name} ${c.phoneCode}`}
                  onSelect={() => {
                    onChange(c.phoneCode);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === c.phoneCode ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="mr-2 text-lg">{getFlagEmoji(c.iso2)}</span>
                  <span className="flex-1">{c.name}</span>
                  <span className="text-muted-foreground font-mono">
                    {c.phoneCode}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

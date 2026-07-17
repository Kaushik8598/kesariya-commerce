"use client";

import { useState, useEffect } from "react";
import { useCountries, useStates, useCities, useAddAddress } from "@/hooks/profile/use-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Loader2, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AddressFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddressForm({ onSuccess, onCancel }: AddressFormProps) {
  const { mutate: addAddress, isPending: isAdding } = useAddAddress();
  const [openCountry, setOpenCountry] = useState(false);
  const [openState, setOpenState] = useState(false);
  const [openCity, setOpenCity] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "", phoneCode: "", mobile: "", addressLine1: "", addressLine2: "",
    countryId: "", stateId: "", cityId: "", postalCode: "", isDefault: false
  });

  const { data: countries } = useCountries();
  const { data: states } = useStates(formData.countryId);
  const { data: cities } = useCities(formData.stateId);

  useEffect(() => {
    if (formData.countryId) {
      const country = countries?.find((c: any) => c.id === formData.countryId);
      if (country && !formData.phoneCode) {
        setFormData(prev => ({ ...prev, phoneCode: country.phoneCode }));
      }
    }
  }, [formData.countryId, countries]);

  const handleSubmit = () => {
    if (!formData.countryId || !formData.stateId || !formData.cityId) {
      toast.error("Please select country, state and city");
      return;
    }

    addAddress(formData, {
      onSuccess: () => {
        setFormData({
          fullName: "", phoneCode: "", mobile: "", addressLine1: "", addressLine2: "",
          countryId: "", stateId: "", cityId: "", postalCode: "", isDefault: false
        });
        if (onSuccess) onSuccess();
      }
    });
  };

  return (
    <div className="space-y-4 border border-border p-6 rounded-lg bg-background">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-foreground/70">Full Name</Label>
          <Input required type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-foreground/70">Phone Number</Label>
          <div className="flex gap-2">
            <Input required type="text" value={formData.phoneCode} readOnly className="w-20 bg-secondary/50 cursor-not-allowed text-center" />
            <Input required type="text" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} className="flex-1" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-widest text-foreground/70">Address Line 1</Label>
        <Input required type="text" value={formData.addressLine1} onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-widest text-foreground/70">Address Line 2 (Optional)</Label>
        <Input type="text" value={formData.addressLine2} onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-foreground/70">Country</Label>
          <Popover open={openCountry} onOpenChange={setOpenCountry}>
            <PopoverTrigger className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              {formData.countryId ? countries?.find((c: any) => c.id === formData.countryId)?.name : "Select Country..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search country..." />
                <CommandList>
                  <CommandEmpty>No country found.</CommandEmpty>
                  <CommandGroup>
                    {countries?.map((c: any) => (
                      <CommandItem
                        key={c.id}
                        value={c.name}
                        onSelect={() => {
                          setFormData({ ...formData, countryId: c.id, stateId: "", cityId: "" });
                          setOpenCountry(false);
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", formData.countryId === c.id ? "opacity-100" : "opacity-0")} />
                        {c.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-foreground/70">State</Label>
          <Popover open={openState} onOpenChange={setOpenState}>
            <PopoverTrigger disabled={!formData.countryId} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              {formData.stateId ? states?.find((s: any) => s.id === formData.stateId)?.name : "Select State..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search state..." />
                <CommandList>
                  <CommandEmpty>No state found.</CommandEmpty>
                  <CommandGroup>
                    {states?.map((s: any) => (
                      <CommandItem
                        key={s.id}
                        value={s.name}
                        onSelect={() => {
                          setFormData({ ...formData, stateId: s.id, cityId: "" });
                          setOpenState(false);
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", formData.stateId === s.id ? "opacity-100" : "opacity-0")} />
                        {s.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-foreground/70">City</Label>
          <Popover open={openCity} onOpenChange={setOpenCity}>
            <PopoverTrigger disabled={!formData.stateId} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              {formData.cityId ? cities?.find((c: any) => c.id === formData.cityId)?.name : "Select City..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search city..." />
                <CommandList>
                  <CommandEmpty>No city found.</CommandEmpty>
                  <CommandGroup>
                    {cities?.map((c: any) => (
                      <CommandItem
                        key={c.id}
                        value={c.name}
                        onSelect={() => {
                          setFormData({ ...formData, cityId: c.id });
                          setOpenCity(false);
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", formData.cityId === c.id ? "opacity-100" : "opacity-0")} />
                        {c.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-foreground/70">Pincode</Label>
          <Input required type="text" value={formData.postalCode} onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })} />
        </div>
      </div>

      <Label className="flex items-center gap-2 mt-4 cursor-pointer">
        <Checkbox checked={formData.isDefault} onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked === true })} />
        <span className="text-sm font-medium">Set as default address</span>
      </Label>

      <div className="flex gap-4 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        )}
        <Button type="button" onClick={handleSubmit} disabled={isAdding}>
          {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Address
        </Button>
      </div>
    </div>
  );
}

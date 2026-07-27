"use client";

import {
  useMeasurements,
  useAddMeasurement,
  useUpdateMeasurement,
  useDeleteMeasurement,
  useSetDefaultMeasurement,
  useMeasurementTypes,
} from "@/hooks/measurement/use-measurement";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { cn } from "@/lib/utils";
import {
  Ruler,
  Plus,
  Trash2,
  Edit2,
  X,
  Save,
  Loader2,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import { useState } from "react";

function MeasurementRow({ v, index, allTypes, getAvailableTypes, updateValueRow, removeValueRow }: any) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const availableTypes = getAvailableTypes(index);
  const displayLabel = v.type
    ? v.type === "OTHER"
      ? v.customName || "Other"
      : allTypes.find((mt: any) => mt.value === v.type)?.label || v.type
    : "Select Type";

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            role="combobox"
            aria-expanded={open}
            className={cn(buttonVariants({ variant: "outline" }), "w-full justify-between px-3 h-10 font-normal")}
          >
            <span className="truncate">{displayLabel}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Search or create type..."
                value={searchValue}
                onValueChange={setSearchValue}
              />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  {availableTypes
                    .filter((t: any) => t.value !== "OTHER")
                    .map((t: any) => (
                      <CommandItem
                        key={t.value}
                        value={t.label}
                        onSelect={() => {
                          updateValueRow(index, "type", t.value);
                          setOpen(false);
                          setSearchValue("");
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            v.type === t.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {t.label}
                      </CommandItem>
                    ))}
                  {v.type &&
                    v.type !== "OTHER" &&
                    !availableTypes.some((t: any) => t.value === v.type) && (
                      <CommandItem
                        value={
                          allTypes.find((mt: any) => mt.value === v.type)?.label || v.type
                        }
                        onSelect={() => {
                          updateValueRow(index, "type", v.type);
                          setOpen(false);
                          setSearchValue("");
                        }}
                      >
                        <Check className="mr-2 h-4 w-4 opacity-100" />
                        {allTypes.find((mt: any) => mt.value === v.type)?.label || v.type}
                      </CommandItem>
                    )}
                  {searchValue &&
                    !availableTypes.some(
                      (t: any) => t.label.toLowerCase() === searchValue.toLowerCase()
                    ) && (
                      <CommandItem
                        value={`create-${searchValue}`}
                        onSelect={() => {
                          updateValueRow(index, "type", "OTHER");
                          updateValueRow(index, "customName", searchValue);
                          setOpen(false);
                          setSearchValue("");
                        }}
                        className="text-primary font-medium border-t mt-1 pt-1"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create "{searchValue}"
                      </CommandItem>
                    )}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex-[0.7] relative">
        <Input
          type="number"
          required
          min="0"
          step="0.1"
          value={v.value}
          onChange={(e) => updateValueRow(index, "value", e.target.value)}
          placeholder="Value"
          className="pr-10 h-10"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold uppercase">
          cm
        </span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => removeValueRow(index)}
        className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function MeasurementsPage() {
  const { data: measurements, isLoading } = useMeasurements();
  const { data: measurementTypes } = useMeasurementTypes();
  const { mutate: addMeasurement, isPending: isAdding } = useAddMeasurement();
  const { mutate: updateMeasurement, isPending: isUpdating } = useUpdateMeasurement();
  const { mutate: deleteMeasurement, isPending: isDeleting } = useDeleteMeasurement();
  const { mutate: setDefaultMeasurement } = useSetDefaultMeasurement();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    isDefault: false,
    values: [] as { type: string; value: string; customName?: string }[],
  });

  const openNewForm = () => {
    setFormData({ name: "", isDefault: false, values: [] });
    setEditingId(null);
    setIsFormOpen(true);
  };

  const openEditForm = (m: any) => {
    setFormData({
      name: m.name,
      isDefault: m.isDefault,
      values: m.values.map((v: any) => ({
        type: v.type,
        value: v.value.toString(),
        customName: v.customName || "",
      })),
    });
    setEditingId(m.id);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  const addValueRow = () => {
    const selectedTypes = formData.values.map((v) => v.type).filter(Boolean);
    const availableTypes =
      measurementTypes?.filter((t: any) => !selectedTypes.includes(t.value)) || [];
    const nextType = availableTypes.length > 0 ? availableTypes[0].value : "";

    setFormData({
      ...formData,
      values: [...formData.values, { type: nextType, value: "" }],
    });
  };

  const updateValueRow = (
    index: number,
    field: "type" | "value" | "customName",
    val: string,
  ) => {
    const newValues = [...formData.values];
    newValues[index][field] = val;

    if (field === "type" && val !== "OTHER") {
      newValues[index].customName = "";
    }

    setFormData({ ...formData, values: newValues });
  };

  const removeValueRow = (index: number) => {
    const newValues = formData.values.filter((_, i) => i !== index);
    setFormData({ ...formData, values: newValues });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validValues = formData.values
      .filter((v) => v.type && v.value)
      .map((v) => ({
        type: v.type,
        value: Number(v.value),
        customName: v.customName,
      }));

    const payload = {
      name: formData.name,
      isDefault: formData.isDefault,
      values: validValues,
    };

    if (editingId) {
      updateMeasurement(
        { id: editingId, data: payload },
        { onSuccess: () => closeForm() }
      );
    } else {
      addMeasurement(payload, {
        onSuccess: () => closeForm(),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="border border-border rounded-2xl p-6 md:p-8 bg-card shadow-sm space-y-6">
        <Skeleton className="h-8 w-44 mb-4" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  const allTypes = [...(measurementTypes || [])];
  if (measurementTypes && !allTypes.some((t) => t.value === "OTHER")) {
    allTypes.push({ value: "OTHER", label: "Other (Custom)" });
  }

  const getAvailableTypes = (currentIndex: number) => {
    if (!allTypes.length) return [];
    const selectedTypes = formData.values
      .filter((_, i) => i !== currentIndex)
      .map((v) => v.type)
      .filter(Boolean);

    return allTypes.filter((t: any) => !selectedTypes.includes(t.value));
  };

  return (
    <div className="border border-border rounded-2xl p-6 md:p-8 bg-card shadow-sm space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center border border-primary/20">
            <Ruler className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-wider font-heading text-foreground">
              Body Measurements
            </h2>
            <p className="text-xs text-muted-foreground font-medium">
              Save your custom measurement profiles for custom tailored fits.
            </p>
          </div>
        </div>
        {!isFormOpen && (
          <Button
            onClick={openNewForm}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
          >
            <Plus className="h-4 w-4" /> Add Profile
          </Button>
        )}
      </div>

      {isFormOpen ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Profile Name
            </Label>
            <Input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. My Measurements, Dad's Measurements"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Measurement Values
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addValueRow}
                className="text-xs font-bold uppercase tracking-wider"
              >
                <Plus className="h-3 w-3 mr-1" /> Add Row
              </Button>
            </div>

            {formData.values.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-border rounded-xl text-muted-foreground text-xs">
                No measurements added yet. Click "Add Row" to start.
              </div>
            ) : (
              <div className="space-y-3">
                {formData.values.map((v, index) => (
                  <MeasurementRow
                    key={index}
                    v={v}
                    index={index}
                    allTypes={allTypes}
                    getAvailableTypes={getAvailableTypes}
                    updateValueRow={updateValueRow}
                    removeValueRow={removeValueRow}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="isDefault"
              checked={formData.isDefault}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isDefault: checked === true })
              }
            />
            <Label htmlFor="isDefault" className="text-xs font-normal cursor-pointer text-foreground">
              Set as default measurement profile
            </Label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isAdding || isUpdating}
              className="flex-1 uppercase font-bold tracking-wider text-xs"
            >
              {isAdding || isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" /> Save Profile
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={closeForm}
              className="flex-1 uppercase font-bold tracking-wider text-xs"
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          {!measurements || measurements.length === 0 ? (
            <div className="text-center py-12 max-w-sm mx-auto">
              <div className="h-16 w-16 rounded-2xl bg-secondary border border-border flex items-center justify-center mb-4 text-muted-foreground mx-auto">
                <Ruler className="h-8 w-8 opacity-60" />
              </div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider mb-1 font-heading text-foreground">
                No profiles found
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                You haven't saved any measurement profiles yet.
              </p>
              <Button onClick={openNewForm} className="text-xs font-bold uppercase tracking-wider">
                Add Your First Profile
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {measurements.map((m: any) => (
                <div
                  key={m.id}
                  className="border border-border rounded-xl p-5 relative overflow-hidden bg-secondary/10 transition-colors hover:border-foreground/20"
                >
                  {m.isDefault && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider py-0.5 px-2.5 rounded-bl-lg">
                      Default
                    </div>
                  )}

                  <h3 className="font-extrabold text-base mb-4 pr-16 font-heading text-foreground">
                    {m.name}
                  </h3>

                  {m.values && m.values.length > 0 ? (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-6">
                      {m.values.map((v: any) => (
                        <div
                          key={v.id}
                          className="flex justify-between items-end border-b border-border/50 pb-1"
                        >
                          <span className="text-xs text-muted-foreground">
                            {v.type === "OTHER"
                              ? v.customName || "Other"
                              : allTypes.find((mt: any) => mt.value === v.type)?.label || v.type}
                          </span>
                          <span className="font-semibold text-xs text-foreground font-mono">
                            {v.value} cm
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground mb-6 italic">
                      No measurements recorded.
                    </p>
                  )}

                  <div className="flex gap-2 border-t border-border pt-4">
                    {!m.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[11px] font-bold uppercase tracking-wider flex-1 h-8"
                        onClick={() => setDefaultMeasurement(m.id)}
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[11px] font-bold uppercase tracking-wider flex-1 h-8"
                      onClick={() => openEditForm(m)}
                    >
                      <Edit2 className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[11px] text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 h-8 px-3"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to delete this profile?")) {
                          deleteMeasurement(m.id);
                        }
                      }}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

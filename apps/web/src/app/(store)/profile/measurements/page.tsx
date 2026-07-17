"use client";

import {
  useMeasurements,
  useAddMeasurement,
  useUpdateMeasurement,
  useDeleteMeasurement,
  useSetDefaultMeasurement,
  useMeasurementTypes,
} from "@/hooks/measurement/use-measurement";
import { useAuth } from "@/providers/auth-provider";
import { useProfile } from "@/hooks/profile/use-profile";
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
  User,
  LogOut,
  Ruler,
  Plus,
  Trash2,
  Edit2,
  Shield,
  X,
  Save,
  Loader2,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
                <CommandEmpty>
                  {searchValue ? `No results found.` : "No results found."}
                </CommandEmpty>
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
                          allTypes.find((mt: any) => mt.value === v.type)
                            ?.label || v.type
                        }
                        onSelect={() => {
                          updateValueRow(index, "type", v.type);
                          setOpen(false);
                          setSearchValue("");
                        }}
                      >
                        <Check className="mr-2 h-4 w-4 opacity-100" />
                        {allTypes.find((mt: any) => mt.value === v.type)
                          ?.label || v.type}
                      </CommandItem>
                    )}
                  {searchValue &&
                    !availableTypes.some(
                      (t: any) =>
                        t.label.toLowerCase() === searchValue.toLowerCase()
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
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-foreground/50 font-bold uppercase">
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
  const { isAuthenticated, logout } = useAuth();
  const { data: profile } = useProfile();
  const { data: measurements, isLoading } = useMeasurements();
  const { data: measurementTypes } = useMeasurementTypes();
  const { mutate: addMeasurement, isPending: isAdding } = useAddMeasurement();
  const { mutate: updateMeasurement, isPending: isUpdating } =
    useUpdateMeasurement();
  const { mutate: deleteMeasurement, isPending: isDeleting } =
    useDeleteMeasurement();
  const { mutate: setDefaultMeasurement } = useSetDefaultMeasurement();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    isDefault: false,
    values: [] as { type: string; value: string; customName?: string }[],
  });

  const router = useRouter();

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

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
    // Find the first available type that isn't already selected
    const selectedTypes = formData.values.map((v) => v.type).filter(Boolean);
    const availableTypes =
      measurementTypes?.filter((t: any) => !selectedTypes.includes(t.value)) ||
      [];
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

    // Reset customName if type is no longer OTHER
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

    // Filter out invalid rows and parse values to numbers
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
        {
          onSuccess: () => closeForm(),
        },
      );
    } else {
      addMeasurement(payload, {
        onSuccess: () => closeForm(),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black tracking-widest uppercase mb-10">
          My Profile
        </h1>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  // Ensure OTHER is always in the list
  const allTypes = [...(measurementTypes || [])];
  if (measurementTypes && !allTypes.some(t => t.value === "OTHER")) {
    allTypes.push({ value: "OTHER", label: "Other (Custom)" });
  }

  // Get available types not already selected in current form
  const getAvailableTypes = (currentIndex: number) => {
    if (!allTypes.length) return [];

    // Find all types selected in OTHER rows
    const selectedTypes = formData.values
      .filter((_, i) => i !== currentIndex)
      .map((v) => v.type)
      .filter(Boolean);

    return allTypes.filter(
      (t: any) => !selectedTypes.includes(t.value),
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:py-20 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-black tracking-widest uppercase">
          My Profile
        </h1>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
        >
          <LogOut className="h-4 w-4" /> Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Sidebar */}
        <div className="md:col-span-4 space-y-6">
          <div className="border border-border rounded-xl p-6 bg-secondary/10 text-center flex flex-col items-center">
            <div className="h-24 w-24 bg-foreground/10 rounded-full flex items-center justify-center mb-4">
              <User className="h-10 w-10 text-foreground/50" />
            </div>
            <h2 className="text-xl font-black tracking-widest uppercase mb-1">
              {profile?.firstName} {profile?.lastName}
            </h2>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground/60">
              <Shield className="h-3 w-3" /> {profile?.role?.name || "Customer"}
            </div>
          </div>

          <div className="border border-border rounded-xl p-2 bg-secondary/10 flex flex-col gap-1">
            <Link
              href="/profile"
              className="px-4 py-3 hover:bg-secondary/30 rounded-lg text-sm font-bold uppercase tracking-widest text-foreground/70 transition-colors"
            >
              Profile Details
            </Link>
            <Link
              href="/profile/addresses"
              className="px-4 py-3 hover:bg-secondary/30 rounded-lg text-sm font-bold uppercase tracking-widest text-foreground/70 transition-colors"
            >
              Saved Addresses
            </Link>
            <Link
              href="/profile/measurements"
              className="px-4 py-3 bg-secondary/50 rounded-lg text-sm font-bold uppercase tracking-widest"
            >
              Measurements
            </Link>
            <Link
              href="/orders"
              className="px-4 py-3 hover:bg-secondary/30 rounded-lg text-sm font-bold uppercase tracking-widest text-foreground/70 transition-colors"
            >
              Order History
            </Link>
            <Link
              href="/profile/password"
              className="px-4 py-3 hover:bg-secondary/30 rounded-lg text-sm font-bold uppercase tracking-widest text-foreground/70 transition-colors"
            >
              Password
            </Link>
            <Link
              href="/profile/notifications"
              className="px-4 py-3 hover:bg-secondary/30 rounded-lg text-sm font-bold uppercase tracking-widest text-foreground/70 transition-colors"
            >
              Notifications
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-8">
          <div className="border border-border rounded-xl p-6 md:p-8">
            <div className="flex items-center justify-between border-b border-border pb-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Ruler className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-widest">
                    Body Measurements
                  </h2>
                  <p className="text-sm text-foreground/60">
                    Save your measurements for custom tailored fits.
                  </p>
                </div>
              </div>
              {!isFormOpen && (
                <Button
                  onClick={openNewForm}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" /> Add Profile
                </Button>
              )}
            </div>

            {isFormOpen ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label className="block text-xs font-bold uppercase tracking-widest text-foreground/70 mb-2">
                    Profile Name
                  </Label>
                  <Input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. My Measurements, Dad's Measurements"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/80">
                      Measurement Values
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addValueRow}
                      className="text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Row
                    </Button>
                  </div>

                  {formData.values.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-border rounded-lg text-foreground/50 text-sm">
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
                  <Label
                    htmlFor="isDefault"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Set as default measurement profile
                  </Label>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isAdding || isUpdating}
                    className="flex-1 uppercase font-bold tracking-widest text-xs"
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
                    className="flex-1 uppercase font-bold tracking-widest text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {!measurements || measurements.length === 0 ? (
                  <div className="text-center py-16">
                    <Ruler className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
                    <h3 className="text-lg font-bold mb-2">
                      No profiles found
                    </h3>
                    <p className="text-foreground/60 mb-6">
                      You haven't saved any measurements yet.
                    </p>
                    <Button onClick={openNewForm}>
                      Add Your First Profile
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {measurements.map((m: any) => (
                      <div
                        key={m.id}
                        className="border border-border rounded-xl p-6 relative group overflow-hidden bg-secondary/5 transition-colors hover:bg-secondary/10"
                      >
                        {m.isDefault && (
                          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded-bl-lg">
                            Default
                          </div>
                        )}

                        <h3 className="font-bold text-lg mb-4 pr-16">
                          {m.name}
                        </h3>

                        {m.values && m.values.length > 0 ? (
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-6">
                            {m.values.map((v: any) => (
                              <div
                                key={v.id}
                                className="flex justify-between items-end border-b border-border/50 pb-1"
                              >
                                <span className="text-xs text-foreground/60">
                                  {v.type === "OTHER"
                                    ? v.customName || "Other"
                                    : allTypes.find(
                                      (mt: any) => mt.value === v.type,
                                    )?.label || v.type}
                                </span>
                                <span className="font-semibold text-sm">
                                  {v.value} cm
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-foreground/50 mb-6 italic">
                            No measurements recorded.
                          </p>
                        )}

                        <div className="flex gap-2 border-t border-border pt-4">
                          {!m.isDefault && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs font-bold uppercase tracking-widest flex-1"
                              onClick={() => setDefaultMeasurement(m.id)}
                            >
                              Set Default
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs flex-1"
                            onClick={() => openEditForm(m)}
                          >
                            <Edit2 className="h-3 w-3 mr-1" /> Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 flex-none px-3"
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Are you sure you want to delete this profile?",
                                )
                              ) {
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
        </div>
      </div>
    </div>
  );
}

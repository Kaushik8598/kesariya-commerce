"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Store,
  Truck,
  Receipt,
  Bell,
  CreditCard,
  Save,
  Loader2,
  Upload,
  X,
  Share2,
  PhoneCall,
  Globe,
} from "lucide-react";
import api from "@/lib/api";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"general" | "shipping" | "tax" | "notifications" | "payments">("general");

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch Settings: GET /admin/settings
  const { data: allSettings, isLoading, isError } = useQuery<Record<string, any>>({
    queryKey: ["adminSettings"],
    queryFn: async () => {
      const res = await api.get("/admin/settings");
      return res.data || {};
    },
  });

  // Form States
  const [generalForm, setGeneralForm] = useState({
    storeName: "",
    storeLogo: "",
    supportEmail: "",
    supportPhone: "",
    storeAddress: "",
    storeDescription: "",
    currency: "₹ (INR)",
    maintenanceMode: false,
    socialLinks: {
      instagram: "",
      facebook: "",
      twitter: "",
      whatsapp: "",
      youtube: "",
    },
  });

  const [shippingForm, setShippingForm] = useState({
    flatShippingFee: 0,
    freeShippingThreshold: 0,
    courierPartner: "",
    shiprocketApiKey: "",
    pincodeValidation: false,
  });

  const [taxForm, setTaxForm] = useState({
    hsnCode: "",
    apparelGstRate: 0,
    pricesIncludeGst: false,
    interstateIgst: false,
    gstinNumber: "",
  });

  const [notifyForm, setNotifyForm] = useState({
    orderPlacedSms: false,
    orderShippedSms: false,
    orderDeliveredSms: false,
  });

  const [paymentForm, setPaymentForm] = useState({
    codEnabled: false,
    codExtraCharge: 0,
    razorpayEnabled: false,
    razorpayKeyId: "",
    razorpaySecret: "",
  });

  // Populate form states ONLY when real database data is fetched
  useEffect(() => {
    if (allSettings) {
      if (allSettings.general && Object.keys(allSettings.general).length > 0) {
        setGeneralForm((prev) => ({
          ...prev,
          ...allSettings.general,
          socialLinks: {
            ...prev.socialLinks,
            ...(allSettings.general.socialLinks || {}),
          },
        }));
      }
      if (allSettings.shipping && Object.keys(allSettings.shipping).length > 0) {
        setShippingForm((prev) => ({ ...prev, ...allSettings.shipping }));
      }
      if (allSettings.tax && Object.keys(allSettings.tax).length > 0) {
        setTaxForm((prev) => ({ ...prev, ...allSettings.tax }));
      }
      if (allSettings.notifications && Object.keys(allSettings.notifications).length > 0) {
        setNotifyForm((prev) => ({ ...prev, ...allSettings.notifications }));
      }
      if (allSettings.payments && Object.keys(allSettings.payments).length > 0) {
        setPaymentForm((prev) => ({ ...prev, ...allSettings.payments }));
      }
    }
  }, [allSettings]);

  // Direct Logo Upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file for logo");
      return;
    }

    setIsUploadingLogo(true);
    setUploadProgress(0);

    try {
      const result = await uploadToCloudinary(file, {
        folder: "kesariya/store",
        onProgress: (pct) => setUploadProgress(pct),
      });
      setGeneralForm((prev) => ({
        ...prev,
        storeLogo: result.secureUrl || result.url,
      }));
      toast.success("Store Logo uploaded successfully!");
    } catch (err: any) {
      console.warn("Cloudinary upload fallback:", err);
      const reader = new FileReader();
      reader.onload = () => {
        setGeneralForm((prev) => ({
          ...prev,
          storeLogo: reader.result as string,
        }));
        toast.success("Logo attached!");
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Update Settings Mutation: PATCH /admin/settings/:key
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const res = await api.patch(`/admin/settings/${key}`, value);
      return res.data;
    },
    onSuccess: (_, variables) => {
      toast.success(`${variables.key.toUpperCase()} settings saved to database!`);
      queryClient.invalidateQueries({ queryKey: ["adminSettings"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to save settings to database");
    },
  });

  const handleSaveGroup = (key: string, value: any) => {
    updateSettingMutation.mutate({ key, value });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground font-heading">
          Store Settings & Configuration Hub
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage general store details, logos, social links, maintenance mode, shipping rates, GST tax rules, and payments.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-border overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors border-b-2 ${
            activeTab === "general"
              ? "border-primary text-primary bg-primary/10"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Store className="h-4 w-4" />
          <span>General Store Info</span>
        </button>

        <button
          onClick={() => setActiveTab("shipping")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors border-b-2 ${
            activeTab === "shipping"
              ? "border-primary text-primary bg-primary/10"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Truck className="h-4 w-4" />
          <span>Shipping & Delivery</span>
        </button>

        <button
          onClick={() => setActiveTab("tax")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors border-b-2 ${
            activeTab === "tax"
              ? "border-primary text-primary bg-primary/10"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>GST & Tax Rules</span>
        </button>

        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors border-b-2 ${
            activeTab === "notifications"
              ? "border-primary text-primary bg-primary/10"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Bell className="h-4 w-4" />
          <span>SMS & Notifications</span>
        </button>

        <button
          onClick={() => setActiveTab("payments")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors border-b-2 ${
            activeTab === "payments"
              ? "border-primary text-primary bg-primary/10"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Payments & Security</span>
        </button>
      </div>

      {isLoading ? (
        <Card className="p-12 text-center text-muted-foreground">
          <Loader2 className="h-7 w-7 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-xs font-semibold">Loading store settings from database...</p>
        </Card>
      ) : isError ? (
        <Card className="p-8 text-center text-rose-400 border-rose-500/20">
          <p className="text-xs font-bold mb-2">Failed to load settings from server.</p>
          <Button variant="outline" size="xs" onClick={() => queryClient.invalidateQueries({ queryKey: ["adminSettings"] })}>
            Retry Connection
          </Button>
        </Card>
      ) : (
        <>
          {/* TAB 1: GENERAL STORE INFO */}
          {activeTab === "general" && (
            <Card className="p-6 space-y-6 max-w-4xl">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h2 className="text-base font-bold text-foreground font-heading">
                    General Store Information
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Basic details displayed dynamically across storefront header, footer, invoices, and maintenance mode.
                  </p>
                </div>
                <Badge variant={generalForm.maintenanceMode ? "warning" : "success"}>
                  {generalForm.maintenanceMode ? "Maintenance Mode ON" : "Store Live"}
                </Badge>
              </div>

              <div className="space-y-6">
                {/* Store Logo Upload & Preview */}
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">
                    Store Main Brand Logo
                  </label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={generalForm.storeLogo}
                        onChange={(e) =>
                          setGeneralForm({ ...generalForm, storeLogo: e.target.value })
                        }
                        placeholder="Paste logo image URL or click upload →"
                        className="h-10 flex-1 px-3.5 rounded-lg bg-secondary border border-border text-xs text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingLogo}
                        className="h-10 gap-1.5 shrink-0"
                      >
                        {isUploadingLogo ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        <span>{isUploadingLogo ? `${uploadProgress}%` : "Upload Logo"}</span>
                      </Button>
                    </div>

                    {generalForm.storeLogo && (
                      <div className="relative mt-2 h-20 w-52 rounded-xl border border-border bg-secondary p-2 flex items-center justify-center overflow-hidden group shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={generalForm.storeLogo}
                          alt="Store Logo Preview"
                          className="h-full w-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => setGeneralForm({ ...generalForm, storeLogo: "" })}
                          className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-rose-600 transition-colors"
                          title="Remove logo"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Store Name, Email, Phone */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      Store Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={generalForm.storeName}
                      onChange={(e) =>
                        setGeneralForm({ ...generalForm, storeName: e.target.value })
                      }
                      placeholder="e.g. Kesariya Studio"
                      className="h-10 w-full px-3.5 rounded-lg bg-secondary border border-border text-xs text-foreground font-semibold outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      Support Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={generalForm.supportEmail}
                      onChange={(e) =>
                        setGeneralForm({ ...generalForm, supportEmail: e.target.value })
                      }
                      placeholder="support@kesariya.com"
                      className="h-10 w-full px-3.5 rounded-lg bg-secondary border border-border text-xs text-foreground outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      Support Phone / Mobile Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={generalForm.supportPhone}
                      onChange={(e) =>
                        setGeneralForm({ ...generalForm, supportPhone: e.target.value })
                      }
                      placeholder="+91 9106958429"
                      className="h-10 w-full px-3.5 rounded-lg bg-secondary border border-border text-xs text-foreground outline-none focus:border-primary font-mono"
                    />
                  </div>
                </div>

                {/* Description & Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      Store Description (Displayed in Footer & About)
                    </label>
                    <textarea
                      rows={3}
                      value={generalForm.storeDescription}
                      onChange={(e) =>
                        setGeneralForm({ ...generalForm, storeDescription: e.target.value })
                      }
                      placeholder="Premium handcrafted Indian ethnic wear studio..."
                      className="w-full p-3 rounded-lg bg-secondary border border-border text-xs text-foreground outline-none focus:border-primary resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      Physical Store Address (Displayed in Footer & Contact)
                    </label>
                    <textarea
                      rows={3}
                      value={generalForm.storeAddress}
                      onChange={(e) =>
                        setGeneralForm({ ...generalForm, storeAddress: e.target.value })
                      }
                      placeholder="Surat, Gujarat, India..."
                      className="w-full p-3 rounded-lg bg-secondary border border-border text-xs text-foreground outline-none focus:border-primary resize-none"
                    />
                  </div>
                </div>

                {/* Currency & Maintenance Mode */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      Default Currency Symbol & Code *
                    </label>
                    <select
                      value={generalForm.currency}
                      onChange={(e) => setGeneralForm({ ...generalForm, currency: e.target.value })}
                      className="h-10 w-full px-3.5 rounded-lg bg-secondary border border-border text-xs text-foreground font-bold outline-none focus:border-primary"
                    >
                      <option value="₹ (INR)">₹ (INR - Indian Rupee)</option>
                      <option value="$ (USD)">$ (USD - US Dollar)</option>
                      <option value="€ (EUR)">€ (EUR - Euro)</option>
                      <option value="£ (GBP)">£ (GBP - British Pound)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      Maintenance Mode *
                    </label>
                    <select
                      value={generalForm.maintenanceMode ? "true" : "false"}
                      onChange={(e) =>
                        setGeneralForm({ ...generalForm, maintenanceMode: e.target.value === "true" })
                      }
                      className="h-10 w-full px-3.5 rounded-lg bg-secondary border border-border text-xs text-foreground outline-none focus:border-primary"
                    >
                      <option value="false">OFF (Store Online & Active)</option>
                      <option value="true">ON (Show Maintenance Screen on Storefront)</option>
                    </select>
                  </div>
                </div>

                {/* Social Media Links Section */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Dynamic Storefront Social Media Links
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-rose-400" /> Instagram Link
                      </label>
                      <input
                        type="text"
                        value={generalForm.socialLinks?.instagram || ""}
                        onChange={(e) =>
                          setGeneralForm({
                            ...generalForm,
                            socialLinks: { ...generalForm.socialLinks, instagram: e.target.value },
                          })
                        }
                        placeholder="https://instagram.com/kesariyastudio"
                        className="h-9 w-full px-3 rounded-lg bg-secondary border border-border text-xs text-foreground font-mono outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-blue-400" /> Facebook Link
                      </label>
                      <input
                        type="text"
                        value={generalForm.socialLinks?.facebook || ""}
                        onChange={(e) =>
                          setGeneralForm({
                            ...generalForm,
                            socialLinks: { ...generalForm.socialLinks, facebook: e.target.value },
                          })
                        }
                        placeholder="https://facebook.com/kesariyastudio"
                        className="h-9 w-full px-3 rounded-lg bg-secondary border border-border text-xs text-foreground font-mono outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
                        <PhoneCall className="h-3.5 w-3.5 text-emerald-400" /> WhatsApp Link / Number
                      </label>
                      <input
                        type="text"
                        value={generalForm.socialLinks?.whatsapp || ""}
                        onChange={(e) =>
                          setGeneralForm({
                            ...generalForm,
                            socialLinks: { ...generalForm.socialLinks, whatsapp: e.target.value },
                          })
                        }
                        placeholder="https://wa.me/919106958429"
                        className="h-9 w-full px-3 rounded-lg bg-secondary border border-border text-xs text-foreground font-mono outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-sky-400" /> Twitter / X Link
                      </label>
                      <input
                        type="text"
                        value={generalForm.socialLinks?.twitter || ""}
                        onChange={(e) =>
                          setGeneralForm({
                            ...generalForm,
                            socialLinks: { ...generalForm.socialLinks, twitter: e.target.value },
                          })
                        }
                        placeholder="https://x.com/kesariyastudio"
                        className="h-9 w-full px-3 rounded-lg bg-secondary border border-border text-xs text-foreground font-mono outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-rose-500" /> YouTube Channel Link
                      </label>
                      <input
                        type="text"
                        value={generalForm.socialLinks?.youtube || ""}
                        onChange={(e) =>
                          setGeneralForm({
                            ...generalForm,
                            socialLinks: { ...generalForm.socialLinks, youtube: e.target.value },
                          })
                        }
                        placeholder="https://youtube.com/@kesariyastudio"
                        className="h-9 w-full px-3 rounded-lg bg-secondary border border-border text-xs text-foreground font-mono outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex justify-end">
                  <Button
                    onClick={() => handleSaveGroup("general", generalForm)}
                    disabled={updateSettingMutation.isPending || isUploadingLogo}
                    className="gap-2 px-6"
                  >
                    <Save className="h-4 w-4" />
                    <span>{updateSettingMutation.isPending ? "Saving..." : "Save General Info Settings"}</span>
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 2: SHIPPING & DELIVERY */}
          {activeTab === "shipping" && (
            <Card className="p-6 space-y-6 max-w-3xl">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h2 className="text-base font-bold text-foreground font-heading">
                    Shipping & Courier Integration
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Configure flat shipping fees, free shipping order thresholds, and courier API keys.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      Standard Flat Shipping Fee (₹)
                    </label>
                    <input
                      type="number"
                      value={shippingForm.flatShippingFee}
                      onChange={(e) => setShippingForm({ ...shippingForm, flatShippingFee: Number(e.target.value) })}
                      placeholder="0"
                      className="h-10 w-full px-3.5 rounded-lg bg-secondary border border-border text-xs font-mono font-bold text-foreground outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      Free Shipping Order Threshold (₹)
                    </label>
                    <input
                      type="number"
                      value={shippingForm.freeShippingThreshold}
                      onChange={(e) => setShippingForm({ ...shippingForm, freeShippingThreshold: Number(e.target.value) })}
                      placeholder="0"
                      className="h-10 w-full px-3.5 rounded-lg bg-secondary border border-border text-xs font-mono font-bold text-foreground outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      Primary Courier Partner
                    </label>
                    <input
                      type="text"
                      value={shippingForm.courierPartner}
                      onChange={(e) => setShippingForm({ ...shippingForm, courierPartner: e.target.value })}
                      placeholder="Shiprocket, Delhivery..."
                      className="h-10 w-full px-3.5 rounded-lg bg-secondary border border-border text-xs text-foreground outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      API Key / Secret Token
                    </label>
                    <input
                      type="text"
                      value={shippingForm.shiprocketApiKey}
                      onChange={(e) => setShippingForm({ ...shippingForm, shiprocketApiKey: e.target.value })}
                      placeholder="Enter API token..."
                      className="h-10 w-full px-3.5 rounded-lg bg-secondary border border-border text-xs font-mono text-foreground outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    Pincode Serviceability Validation
                  </label>
                  <select
                    value={shippingForm.pincodeValidation ? "true" : "false"}
                    onChange={(e) => setShippingForm({ ...shippingForm, pincodeValidation: e.target.value === "true" })}
                    className="h-10 w-full px-3.5 rounded-lg bg-secondary border border-border text-xs text-foreground outline-none focus:border-primary"
                  >
                    <option value="true font-semibold">ENABLED (Verify customer pincodes on checkout)</option>
                    <option value="false">DISABLED (Allow all pincodes)</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-border flex justify-end">
                  <Button
                    onClick={() => handleSaveGroup("shipping", shippingForm)}
                    disabled={updateSettingMutation.isPending}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{updateSettingMutation.isPending ? "Saving..." : "Save Shipping Settings"}</span>
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 3: GST & TAX RULES */}
          {activeTab === "tax" && (
            <Card className="p-6 space-y-6 max-w-3xl">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h2 className="text-base font-bold text-foreground font-heading">
                    GST Tax Slabs & Invoice Rules
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Set HSN apparel codes, GST percentage slabs, and IGST/CGST invoice calculation rules.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      Store GSTIN Registration Number
                    </label>
                    <input
                      type="text"
                      value={taxForm.gstinNumber}
                      onChange={(e) => setTaxForm({ ...taxForm, gstinNumber: e.target.value.toUpperCase() })}
                      placeholder="GSTIN..."
                      className="h-10 w-full px-3.5 rounded-lg bg-secondary border border-border text-xs font-mono font-bold text-foreground outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      Apparel HSN Code
                    </label>
                    <input
                      type="text"
                      value={taxForm.hsnCode}
                      onChange={(e) => setTaxForm({ ...taxForm, hsnCode: e.target.value })}
                      placeholder="5407"
                      className="h-10 w-full px-3.5 rounded-lg bg-secondary border border-border text-xs font-mono font-bold text-foreground outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      Default GST Slab Rate (%)
                    </label>
                    <input
                      type="number"
                      value={taxForm.apparelGstRate}
                      onChange={(e) => setTaxForm({ ...taxForm, apparelGstRate: Number(e.target.value) })}
                      placeholder="5"
                      className="h-10 w-full px-3.5 rounded-lg bg-secondary border border-border text-xs font-bold text-foreground outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      Product Prices GST Calculation
                    </label>
                    <select
                      value={taxForm.pricesIncludeGst ? "true" : "false"}
                      onChange={(e) => setTaxForm({ ...taxForm, pricesIncludeGst: e.target.value === "true" })}
                      className="h-10 w-full px-3.5 rounded-lg bg-secondary border border-border text-xs text-foreground outline-none focus:border-primary"
                    >
                      <option value="true">INCLUSIVE (Prices include GST)</option>
                      <option value="false">EXCLUSIVE (GST added at checkout)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex justify-end">
                  <Button
                    onClick={() => handleSaveGroup("tax", taxForm)}
                    disabled={updateSettingMutation.isPending}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{updateSettingMutation.isPending ? "Saving..." : "Save GST & Tax Settings"}</span>
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <Card className="p-6 space-y-6 max-w-3xl">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h2 className="text-base font-bold text-foreground font-heading">
                    SMS & Email Order Notifications
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Enable automated customer SMS alerts and store manager email notifications.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <span className="text-xs font-bold text-foreground block">
                    Customer SMS Alert Triggers:
                  </span>

                  <label className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40 border border-border cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyForm.orderPlacedSms}
                      onChange={(e) => setNotifyForm({ ...notifyForm, orderPlacedSms: e.target.checked })}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="text-xs font-bold text-foreground block">Order Placement Confirmation SMS</span>
                      <span className="text-[11px] text-muted-foreground">Send SMS instantly when customer completes checkout</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40 border border-border cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyForm.orderShippedSms}
                      onChange={(e) => setNotifyForm({ ...notifyForm, orderShippedSms: e.target.checked })}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="text-xs font-bold text-foreground block">Dispatch & Tracking SMS</span>
                      <span className="text-[11px] text-muted-foreground">Send courier tracking URL when order status changes to SHIPPED</span>
                    </div>
                  </label>
                </div>

                <div className="pt-4 border-t border-border flex justify-end">
                  <Button
                    onClick={() => handleSaveGroup("notifications", notifyForm)}
                    disabled={updateSettingMutation.isPending}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{updateSettingMutation.isPending ? "Saving..." : "Save Notification Settings"}</span>
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 5: PAYMENTS & SECURITY */}
          {activeTab === "payments" && (
            <Card className="p-6 space-y-6 max-w-3xl">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h2 className="text-base font-bold text-foreground font-heading">
                    Payment Gateways & Security
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Manage Razorpay API credentials and Cash-on-Delivery (COD) checkout options.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Razorpay Section */}
                <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-3">
                  <span className="text-xs font-extrabold text-foreground font-heading block">
                    Razorpay Online Payments
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">
                        Key ID
                      </label>
                      <input
                        type="text"
                        value={paymentForm.razorpayKeyId}
                        onChange={(e) => setPaymentForm({ ...paymentForm, razorpayKeyId: e.target.value })}
                        placeholder="rzp_live_..."
                        className="h-10 w-full px-3.5 rounded-lg bg-card border border-border text-xs font-mono text-foreground outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">
                        Key Secret
                      </label>
                      <input
                        type="password"
                        value={paymentForm.razorpaySecret}
                        onChange={(e) => setPaymentForm({ ...paymentForm, razorpaySecret: e.target.value })}
                        placeholder="Enter Key Secret..."
                        className="h-10 w-full px-3.5 rounded-lg bg-card border border-border text-xs font-mono text-foreground outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* COD Section */}
                <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-foreground font-heading">
                      Cash-on-Delivery (COD)
                    </span>
                    <select
                      value={paymentForm.codEnabled ? "true" : "false"}
                      onChange={(e) => setPaymentForm({ ...paymentForm, codEnabled: e.target.value === "true" })}
                      className="h-8 px-2.5 rounded-lg bg-card border border-border text-xs font-bold text-foreground outline-none"
                    >
                      <option value="true">COD ENABLED</option>
                      <option value="false font-semibold">COD DISABLED</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      Additional COD Handling Surcharge (₹)
                    </label>
                    <input
                      type="number"
                      value={paymentForm.codExtraCharge}
                      onChange={(e) => setPaymentForm({ ...paymentForm, codExtraCharge: Number(e.target.value) })}
                      placeholder="0"
                      className="h-10 w-full px-3.5 rounded-lg bg-card border border-border text-xs font-mono font-bold text-foreground outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex justify-end">
                  <Button
                    onClick={() => handleSaveGroup("payments", paymentForm)}
                    disabled={updateSettingMutation.isPending}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{updateSettingMutation.isPending ? "Saving..." : "Save Payment Settings"}</span>
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

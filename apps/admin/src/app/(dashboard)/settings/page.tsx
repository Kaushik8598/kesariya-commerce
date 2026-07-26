"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Store,
  Truck,
  Receipt,
  Bell,
  CreditCard,
  Save,
  Loader2,
} from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"general" | "shipping" | "tax" | "notifications" | "payments">("general");

  // Fetch Settings: GET /admin/settings
  const { data: allSettings, isLoading, isError } = useQuery<Record<string, any>>({
    queryKey: ["adminSettings"],
    queryFn: async () => {
      const res = await api.get("/admin/settings");
      return res.data || {};
    },
  });

  // Blank Form States (No static dummy data)
  const [generalForm, setGeneralForm] = useState({
    storeName: "",
    supportEmail: "",
    supportPhone: "",
    storeAddress: "",
    currency: "INR (₹)",
    maintenanceMode: false,
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
        setGeneralForm((prev) => ({ ...prev, ...allSettings.general }));
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
          Manage store settings, shipping rates, GST tax rules, SMS notifications, and payment gateways.
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
            <Card className="p-6 space-y-6 max-w-3xl">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h2 className="text-base font-bold text-foreground font-heading">
                    General Store Information
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Basic details displayed on customer invoices, emails, and storefront footers.
                  </p>
                </div>
                <Badge variant={generalForm.maintenanceMode ? "warning" : "success"}>
                  {generalForm.maintenanceMode ? "Maintenance" : "Live Store"}
                </Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    Store Name
                  </label>
                  <input
                    type="text"
                    value={generalForm.storeName}
                    onChange={(e) => setGeneralForm({ ...generalForm, storeName: e.target.value })}
                    placeholder="Enter store name..."
                    className="h-10 w-full px-3.5 rounded-lg bg-secondary border border-border text-xs text-foreground font-semibold outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      Customer Support Email
                    </label>
                    <input
                      type="email"
                      value={generalForm.supportEmail}
                      onChange={(e) => setGeneralForm({ ...generalForm, supportEmail: e.target.value })}
                      placeholder="support@example.com"
                      className="h-10 w-full px-3.5 rounded-lg bg-secondary border border-border text-xs text-foreground outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      Support Phone / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={generalForm.supportPhone}
                      onChange={(e) => setGeneralForm({ ...generalForm, supportPhone: e.target.value })}
                      placeholder="+91 9876543210"
                      className="h-10 w-full px-3.5 rounded-lg bg-secondary border border-border text-xs text-foreground outline-none focus:border-primary font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    Physical Store Address
                  </label>
                  <textarea
                    rows={3}
                    value={generalForm.storeAddress}
                    onChange={(e) => setGeneralForm({ ...generalForm, storeAddress: e.target.value })}
                    placeholder="Enter store address..."
                    className="w-full p-3 rounded-lg bg-secondary border border-border text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      Default Store Currency
                    </label>
                    <input
                      type="text"
                      value={generalForm.currency}
                      readOnly
                      className="h-10 w-full px-3.5 rounded-lg bg-secondary/60 border border-border text-xs text-muted-foreground font-bold outline-none cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      Maintenance Mode
                    </label>
                    <select
                      value={generalForm.maintenanceMode ? "true" : "false"}
                      onChange={(e) => setGeneralForm({ ...generalForm, maintenanceMode: e.target.value === "true" })}
                      className="h-10 w-full px-3.5 rounded-lg bg-secondary border border-border text-xs text-foreground outline-none focus:border-primary"
                    >
                      <option value="false">OFF (Store Online)</option>
                      <option value="true">ON (Store Under Maintenance)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex justify-end">
                  <Button
                    onClick={() => handleSaveGroup("general", generalForm)}
                    disabled={updateSettingMutation.isPending}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{updateSettingMutation.isPending ? "Saving..." : "Save General Settings"}</span>
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

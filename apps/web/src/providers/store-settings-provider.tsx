"use client";

import React, { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export interface GeneralStoreSettings {
  storeName: string;
  storeLogo: string;
  supportEmail: string;
  supportPhone: string;
  storeAddress: string;
  storeDescription: string;
  currency: string;
  currencySymbol: string;
  maintenanceMode: boolean;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    whatsapp?: string;
    youtube?: string;
  };
}

export interface PublicSettingsResponse {
  general: GeneralStoreSettings;
  shipping: {
    flatShippingFee: number;
    freeShippingThreshold: number;
    pincodeValidation: boolean;
  };
  tax: {
    apparelGstRate: number;
    pricesIncludeGst: boolean;
  };
  payments: {
    codEnabled: boolean;
    codExtraCharge: number;
    razorpayKeyId: string;
  };
}

const defaultGeneralSettings: GeneralStoreSettings = {
  storeName: "",
  storeLogo: "",
  supportEmail: "",
  supportPhone: "",
  storeAddress: "",
  storeDescription: "",
  currency: "",
  currencySymbol: "",
  maintenanceMode: false,
  socialLinks: {
    instagram: "",
    facebook: "",
    twitter: "",
    whatsapp: "",
    youtube: "",
  },
};

interface StoreSettingsContextValue {
  settings: PublicSettingsResponse;
  general: GeneralStoreSettings;
  currencySymbol: string;
  formatPrice: (amount: number) => string;
  isLoading: boolean;
}

const StoreSettingsContext = createContext<StoreSettingsContextValue>({
  settings: {
    general: defaultGeneralSettings,
    shipping: { flatShippingFee: 0, freeShippingThreshold: 0, pincodeValidation: false },
    tax: { apparelGstRate: 0, pricesIncludeGst: false },
    payments: { codEnabled: false, codExtraCharge: 0, razorpayKeyId: "" },
  },
  general: defaultGeneralSettings,
  currencySymbol: "₹",
  formatPrice: (amt: number) => `₹${amt.toLocaleString("en-IN")}`,
  isLoading: false,
});

export function StoreSettingsProvider({ children }: { children: React.ReactNode }) {
  // CRITICAL REQUIREMENT: Fetch public settings EXACTLY ONCE with infinite cache staleTime!
  const { data: settingsData, isLoading } = useQuery<PublicSettingsResponse>({
    queryKey: ["publicStoreSettings"],
    queryFn: async () => {
      const res = await api.get("/public/settings");
      return res.data;
    },
    staleTime: Infinity, // Prevent re-fetching on page transitions or component re-renders!
    gcTime: 1000 * 60 * 60 * 24, // 24 hours cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const general = settingsData?.general || defaultGeneralSettings;

  // Extract currency symbol (e.g. "₹ (INR)" -> "₹")
  const currencyStr = general.currencySymbol || "₹";
  const currencySymbol = currencyStr.includes("(")
    ? currencyStr.split("(")[0].trim()
    : currencyStr.trim() || "₹";

  const formatPrice = (amount: number) => {
    const num = Number(amount) || 0;
    return `${currencySymbol} ${num.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const fullSettings: PublicSettingsResponse = settingsData || {
    general: defaultGeneralSettings,
    shipping: { flatShippingFee: 0, freeShippingThreshold: 0, pincodeValidation: false },
    tax: { apparelGstRate: 0, pricesIncludeGst: false },
    payments: { codEnabled: false, codExtraCharge: 0, razorpayKeyId: "" },
  };

  return (
    <StoreSettingsContext.Provider
      value={{
        settings: fullSettings,
        general,
        currencySymbol,
        formatPrice,
        isLoading,
      }}
    >
      {children}
    </StoreSettingsContext.Provider>
  );
}

export function useStoreSettings() {
  return useContext(StoreSettingsContext);
}

"use client";

import { ThemeProvider } from "./theme-provider";
import { QueryProvider } from "./query-provider";
import { AuthProvider } from "./auth-provider";
import { StoreSettingsProvider, useStoreSettings } from "./store-settings-provider";
import { MaintenanceScreen } from "@/components/common/maintenance-screen";

import { Toaster } from "@/components/ui/sonner";

function MaintenanceWrapper({ children }: { children: React.ReactNode }) {
  const { general } = useStoreSettings();

  if (general.maintenanceMode) {
    return <MaintenanceScreen />;
  }

  return <>{children}</>;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <StoreSettingsProvider>
            <MaintenanceWrapper>
              {children}
              <Toaster richColors />
            </MaintenanceWrapper>
          </StoreSettingsProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

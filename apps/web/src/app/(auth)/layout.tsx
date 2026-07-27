import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthCarousel } from "@/components/auth/auth-carousel";
import { Logo } from "@/components/ui/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen lg:grid-cols-2 bg-background text-foreground">
      {/* ── Left Column: Auto-Play Image Carousel ── */}
      <section className="relative hidden lg:block h-full">
        <AuthCarousel />
      </section>

      {/* ── Right Column: Form Container + Header Nav ── */}
      <section className="relative flex flex-col min-h-screen">
        {/* Top Header Bar for Mobile & Desktop Landing Page Redirect */}
        <header className="flex items-center justify-between p-6 sm:px-10 border-b border-border/40 lg:border-b-0">
          <Logo size="md" showBadge />

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-foreground transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary shadow-sm"
          >
            <ArrowLeft size={14} /> Back to Store
          </Link>
        </header>

        {/* Center Auth Form */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          {children}
        </div>
      </section>
    </main>
  );
}

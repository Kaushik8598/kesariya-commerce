"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronRight,
  Home,
  Clock,
  Globe,
  Loader2,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { api } from "@/lib/axios";

interface CmsPageData {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};

export default function CmsInfoDynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  // Fetch public CMS Page by slug: GET /public/cms/pages/:slug or /cms/:slug
  const { data: pageData, isLoading, isError } = useQuery<CmsPageData>({
    queryKey: ["cmsPage", slug],
    queryFn: async () => {
      try {
        const res = await api.get(`/public/cms/pages/${slug}`);
        return res.data;
      } catch {
        // Fallback to /cms/:slug
        const res = await api.get(`/cms/${slug}`);
        return res.data;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 pt-6">
      {/* Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
          <span className="text-muted-foreground font-medium uppercase tracking-wider">
            Information
          </span>
          <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
          <span className="text-foreground font-semibold truncate capitalize">
            {pageData?.title || slug.replace(/-/g, " ")}
          </span>
        </nav>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
            <h3 className="text-sm font-bold text-foreground">
              Loading Page Content...
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Fetching dynamic page details from Kesariya Commerce API
            </p>
          </div>
        ) : isError || !pageData ? (
          /* Page Not Found Error State */
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
            <div className="h-16 w-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4 border border-rose-500/20">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-extrabold text-foreground font-heading">
              Page Not Found
            </h2>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              The CMS information page <span className="font-mono font-semibold text-foreground">"/info/{slug}"</span> could not be found or is currently kept as a private draft.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-lg hover:bg-primary/90 transition-all"
            >
              <ArrowLeft className="h-4 w-4" /> Return to Homepage
            </Link>
          </div>
        ) : (
          /* Main CMS Page Card */
          <article className="space-y-8">
            {/* Title & Metadata Banner */}
            <div className="border-b border-border pb-6 space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Official Policy
                </span>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Updated {formatDate(pageData.updatedAt)}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-heading">
                {pageData.title}
              </h1>
            </div>

            {/* Rendered HTML Content Body */}
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-10 shadow-sm">
              <div
                dangerouslySetInnerHTML={{ __html: pageData.content }}
                className="space-y-4 text-xs sm:text-sm leading-relaxed text-foreground/90 font-sans [&_h2]:text-lg [&_h2]:sm:text-xl [&_h2]:font-extrabold [&_h2]:text-foreground [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:font-heading [&_h2]:border-b [&_h2]:border-border [&_h2]:pb-2 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-foreground [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:leading-relaxed [&_p]:text-foreground/80 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1.5 [&_li]:text-foreground/80 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:bg-secondary/50 [&_blockquote]:p-4 [&_blockquote]:rounded-r-xl [&_blockquote]:italic [&_blockquote]:text-foreground [&_a]:text-primary [&_a]:underline [&_a]:font-semibold hover:[&_a]:text-primary/80 transition-colors"
              />
            </div>

            {/* Footer Assurance Banner */}
            <div className="p-4 rounded-xl bg-secondary/40 border border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary shrink-0" />
                <span>Kesariya Craftsmanship & Direct Store Services</span>
              </div>
              <Link
                href="/info/faq"
                className="text-primary font-semibold hover:underline"
              >
                Have questions? Visit Help & Support →
              </Link>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}

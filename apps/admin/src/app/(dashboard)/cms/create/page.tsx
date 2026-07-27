"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Save,
  Pencil,
  Eye,
  Columns2,
  Lock,
  Bold,
  Italic,
  Heading,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Globe,
  CheckCircle2,
} from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const generateSlug = (str: string) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

export default function CreateCmsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [editorMode, setEditorMode] = useState<"edit" | "split" | "preview">("split");
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content:
      "<h2>Welcome to Kesariya</h2>\n<p>Enter your structured content here using rich HTML formatting...</p>",
    isPublished: true,
  });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const titleVal = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title: titleVal,
      slug: generateSlug(titleVal),
    }));
  };

  const insertFormatting = (tagStart: string, tagEnd = "") => {
    const textarea = document.getElementById("cms-content-editor") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = formData.content;
    const selectedText = currentText.substring(start, end);

    const newText =
      currentText.substring(0, start) +
      tagStart +
      selectedText +
      tagEnd +
      currentText.substring(end);

    setFormData({ ...formData, content: newText });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tagStart.length, end + tagStart.length);
    }, 50);
  };

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post("/admin/cms", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("CMS Page created successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminCmsPages"] });
      router.push("/cms");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to create CMS page");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Page title is required");
      return;
    }
    if (!formData.content.trim()) {
      toast.error("Page content body is required");
      return;
    }

    const payload = {
      title: formData.title.trim(),
      slug: formData.slug.trim() || generateSlug(formData.title),
      content: formData.content.trim(),
      isPublished: formData.isPublished,
    };

    createMutation.mutate(payload);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Action Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="xs"
            onClick={() => router.push("/cms")}
            className="h-9 px-3 gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Pages
          </Button>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground font-heading">
              Create CMS Page
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add a new static storefront page with real-time live preview.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-secondary p-1 rounded-lg border border-border shrink-0">
            <button
              type="button"
              onClick={() => setEditorMode("edit")}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                editorMode === "edit"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
            <button
              type="button"
              onClick={() => setEditorMode("split")}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                editorMode === "split"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Columns2 className="h-3.5 w-3.5" /> Split Mode
            </button>
            <button
              type="button"
              onClick={() => setEditorMode("preview")}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                editorMode === "preview"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Eye className="h-3.5 w-3.5" /> Full Preview
            </button>
          </div>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="gap-2 shrink-0"
          >
            <Save className="h-4 w-4" />
            <span>{createMutation.isPending ? "Publishing..." : "Save & Publish"}</span>
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title, Slug & Status Card */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Page Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="e.g. Terms & Conditions"
                className="h-10 w-full px-3.5 rounded-lg bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div className="md:col-span-1">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-foreground">
                  URL Route Slug (Auto-generated)
                </label>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Locked
                </span>
              </div>
              <input
                type="text"
                disabled
                value={formData.slug}
                placeholder="terms-and-conditions"
                className="h-10 w-full px-3.5 rounded-lg bg-muted/60 border border-border text-xs font-mono text-foreground cursor-not-allowed opacity-75"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Storefront Route: <span className="text-primary font-mono font-semibold">/info/{formData.slug || "slug"}</span>
              </p>
            </div>

            <div className="md:col-span-1">
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Publishing Status *
              </label>
              <select
                value={formData.isPublished ? "true" : "false"}
                onChange={(e) =>
                  setFormData({ ...formData, isPublished: e.target.value === "true" })
                }
                className="h-10 w-full px-3.5 rounded-lg bg-secondary border border-border text-xs text-foreground outline-none focus:border-primary"
              >
                <option value="true">PUBLISHED (Visible on Storefront)</option>
                <option value="false">DRAFT (Hidden / Work in Progress)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Content Editor & Live Preview Panel */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">Page Body Content</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Format your content using the HTML toolbar buttons or standard markdown/HTML syntax.
              </p>
            </div>
            <span className="text-xs font-mono text-muted-foreground bg-secondary px-2.5 py-1 rounded border border-border">
              Live Preview Active
            </span>
          </div>

          {/* Formatting Toolbar */}
          {(editorMode === "edit" || editorMode === "split") && (
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-secondary/80 border border-border rounded-t-xl">
              <button
                type="button"
                onClick={() => insertFormatting("<h2>", "</h2>")}
                className="px-2.5 py-1 rounded hover:bg-card text-muted-foreground hover:text-foreground text-xs font-bold gap-1 flex items-center border border-border/50"
                title="Heading 2"
              >
                <Heading className="h-3.5 w-3.5" /> H2
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("<h3>", "</h3>")}
                className="px-2.5 py-1 rounded hover:bg-card text-muted-foreground hover:text-foreground text-xs font-bold gap-1 flex items-center border border-border/50"
                title="Heading 3"
              >
                <Heading className="h-3.5 w-3.5" /> H3
              </button>
              <div className="h-4 w-px bg-border mx-1" />
              <button
                type="button"
                onClick={() => insertFormatting("<strong>", "</strong>")}
                className="p-1.5 rounded hover:bg-card text-muted-foreground hover:text-foreground border border-border/50"
                title="Bold"
              >
                <Bold className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("<em>", "</em>")}
                className="p-1.5 rounded hover:bg-card text-muted-foreground hover:text-foreground border border-border/50"
                title="Italic"
              >
                <Italic className="h-3.5 w-3.5" />
              </button>
              <div className="h-4 w-px bg-border mx-1" />
              <button
                type="button"
                onClick={() => insertFormatting("<ul>\n  <li>", "</li>\n</ul>")}
                className="p-1.5 rounded hover:bg-card text-muted-foreground hover:text-foreground border border-border/50"
                title="Bullet List"
              >
                <List className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("<ol>\n  <li>", "</li>\n</ol>")}
                className="p-1.5 rounded hover:bg-card text-muted-foreground hover:text-foreground border border-border/50"
                title="Numbered List"
              >
                <ListOrdered className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("<blockquote>", "</blockquote>")}
                className="p-1.5 rounded hover:bg-card text-muted-foreground hover:text-foreground border border-border/50"
                title="Quote"
              >
                <Quote className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("<code>", "</code>")}
                className="p-1.5 rounded hover:bg-card text-muted-foreground hover:text-foreground border border-border/50"
                title="Inline Code"
              >
                <Code className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('<a href="https://example.com">', "</a>")}
                className="p-1.5 rounded hover:bg-card text-muted-foreground hover:text-foreground border border-border/50"
                title="Insert Link"
              >
                <LinkIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Editor & Preview Grid */}
          <div
            className={`grid gap-4 ${
              editorMode === "split"
                ? "grid-cols-1 lg:grid-cols-2"
                : "grid-cols-1"
            }`}
          >
            {/* Editor Textarea */}
            {(editorMode === "edit" || editorMode === "split") && (
              <div>
                <textarea
                  id="cms-content-editor"
                  rows={20}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter HTML content or text..."
                  className={`w-full p-4 bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-mono resize-y leading-relaxed ${
                    editorMode === "split"
                      ? "rounded-b-xl lg:rounded-bl-xl lg:rounded-br-none"
                      : "rounded-b-xl"
                  }`}
                />
              </div>
            )}

            {/* Live Preview Screen */}
            {(editorMode === "preview" || editorMode === "split") && (
              <div className="flex flex-col border border-border rounded-xl bg-card overflow-hidden min-h-[500px]">
                <div className="px-4 py-2.5 bg-secondary border-b border-border flex items-center justify-between text-xs text-muted-foreground font-semibold">
                  <span className="flex items-center gap-2 text-primary font-bold">
                    <Globe className="h-4 w-4" /> Storefront Live Preview
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    /info/{formData.slug || "slug"}
                  </span>
                </div>

                <div className="p-8 max-h-[600px] overflow-y-auto bg-background prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed">
                  <div className="border-b border-border pb-4 mb-6">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                      Official Policy Preview
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-2 font-heading">
                      {formData.title || "Page Title"}
                    </h1>
                  </div>

                  {formData.content ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: formData.content }}
                      className="space-y-4 text-muted-foreground font-sans [&_h2]:text-base [&_h2]:sm:text-lg [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:border-b [&_h2]:border-border [&_h2]:pb-2 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-foreground [&_h3]:mt-4 [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1.5 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:bg-secondary/40 [&_blockquote]:p-3 [&_blockquote]:rounded-r-lg [&_blockquote]:italic [&_blockquote]:text-foreground [&_a]:text-primary [&_a]:underline"
                    />
                  ) : (
                    <p className="text-muted-foreground italic">No content entered yet...</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/cms")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="gap-2 px-6"
          >
            <Save className="h-4 w-4" />
            <span>{createMutation.isPending ? "Publishing..." : "Save & Publish Page"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}

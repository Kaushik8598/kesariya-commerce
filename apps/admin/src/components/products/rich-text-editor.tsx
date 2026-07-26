"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  UnderlineIcon,
  List,
  ListOrdered,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading2,
  Heading3,
  Undo,
  Redo,
} from "lucide-react";
import { useEffect } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder = "Write something..." }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "rich-editor-content",
      },
    },
  });

  // Sync external value changes (e.g., loading from DB)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) return null;

  const ToolbarButton = ({
    onClick,
    active,
    title,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 30,
        height: 30,
        borderRadius: 6,
        border: "none",
        background: active ? "rgba(99,102,241,0.25)" : "transparent",
        color: active ? "#818cf8" : "#a1a1aa",
        cursor: "pointer",
        transition: "background 0.15s, color 0.15s",
      }}
    >
      {children}
    </button>
  );

  return (
    <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, overflow: "hidden", background: "rgba(0,0,0,0.2)" }}>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          padding: "6px 10px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <Bold size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <Italic size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline"
        >
          <UnderlineIcon size={14} />
        </ToolbarButton>
        <div style={{ width: 1, background: "rgba(255,255,255,0.1)", margin: "4px 4px" }} />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 size={14} />
        </ToolbarButton>
        <div style={{ width: 1, background: "rgba(255,255,255,0.1)", margin: "4px 4px" }} />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Ordered List"
        >
          <ListOrdered size={14} />
        </ToolbarButton>
        <div style={{ width: 1, background: "rgba(255,255,255,0.1)", margin: "4px 4px" }} />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="Align Left"
        >
          <AlignLeft size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="Align Center"
        >
          <AlignCenter size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="Align Right"
        >
          <AlignRight size={14} />
        </ToolbarButton>
        <div style={{ width: 1, background: "rgba(255,255,255,0.1)", margin: "4px 4px" }} />
        <ToolbarButton
          onClick={() => {
            const url = window.prompt("Enter URL");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          active={editor.isActive("link")}
          title="Insert Link"
        >
          <LinkIcon size={14} />
        </ToolbarButton>
        <div style={{ width: 1, background: "rgba(255,255,255,0.1)", margin: "4px 4px" }} />
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          active={false}
          title="Undo"
        >
          <Undo size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          active={false}
          title="Redo"
        >
          <Redo size={14} />
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <style>{`
        .rich-editor-content {
          padding: 12px 16px;
          min-height: 140px;
          color: #e4e4e7;
          font-size: 14px;
          line-height: 1.65;
          outline: none;
        }
        .rich-editor-content h2 { font-size: 1.2rem; font-weight: 700; margin: 12px 0 6px; color: #f4f4f5; }
        .rich-editor-content h3 { font-size: 1rem; font-weight: 600; margin: 10px 0 4px; color: #f4f4f5; }
        .rich-editor-content p { margin: 0 0 8px; }
        .rich-editor-content ul { list-style: disc; padding-left: 20px; margin: 0 0 8px; }
        .rich-editor-content ol { list-style: decimal; padding-left: 20px; margin: 0 0 8px; }
        .rich-editor-content a { color: #818cf8; text-decoration: underline; }
        .rich-editor-content strong { font-weight: 700; }
        .rich-editor-content em { font-style: italic; }
        .rich-editor-content u { text-decoration: underline; }
        .tiptap p.is-editor-empty:first-child::before {
          color: #52525b;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>
      <EditorContent editor={editor} />
    </div>
  );
}

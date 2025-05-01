'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { EditorMenu } from "@/components/editor/editor-menu";
import { useEffect, useState } from "react";
import { common, createLowlight } from "lowlight";
import { toast } from "@/components/ui/use-toast";
import Heading from '@tiptap/extension-heading';

const lowlight = createLowlight(common);

export interface PostFormProps {
  title: string;
  setTitle: (title: string) => void;
  slug: string;
  setSlug: (slug: string) => void;
  initialContent: any;
  onContentChange: (content: any) => void;
  isSubmitting: boolean;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
  submitButtonText: string;
  cancelButton?: React.ReactNode;
}

export function PostForm({
  title,
  setTitle,
  slug,
  setSlug,
  initialContent,
  onContentChange,
  isSubmitting,
  error,
  onSubmit,
  submitButtonText,
  cancelButton
}: PostFormProps) {
  const [editorReady, setEditorReady] = useState(false);
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Heading.configure({ // Ensure Heading is configured
        levels: [1, 2, 3], 
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary hover:underline',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder: 'Write your post content here...',
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'rounded-md bg-muted p-4 my-4 overflow-x-auto',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full my-4',
        },
      }),
      TableRow,
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-muted p-2',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-muted bg-muted font-bold p-2',
        },
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-headings:font-bold focus:outline-none min-h-[400px] p-4 max-w-none',
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const result = e.target?.result;
              if (typeof result === 'string') {
                view.dispatch(
                  view.state.tr.replaceSelectionWith(
                    view.state.schema.nodes.image.create({ src: result })
                  )
                );
              }
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event, slice) => {
        if (event.clipboardData && event.clipboardData.files && event.clipboardData.files[0]) {
          const file = event.clipboardData.files[0];
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const result = e.target?.result;
              if (typeof result === 'string') {
                view.dispatch(
                  view.state.tr.replaceSelectionWith(
                    view.state.schema.nodes.image.create({ src: result })
                  )
                );
              }
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      },
    },
    onUpdate({ editor }) {
      onContentChange(editor.getJSON());
    },
    onCreate: () => {
      setEditorReady(true);
    },
  });

  useEffect(() => {
    if (editor && editorReady && initialContent) {
      try {
        editor.commands.setContent(initialContent);
      } catch (error) {
        console.error("Error setting editor content:", error);
        toast({
          title: "Editor Warning",
          description: "There was an issue loading the content into the editor.",
          variant: "destructive",
        });
      }
    }
  }, [editor, initialContent, editorReady]);

  // Auto-save draft functionality
  useEffect(() => {
    if (!editor || !editorReady) return;
    
    const interval = setInterval(() => {
      const content = editor.getJSON();
      localStorage.setItem('post-draft', JSON.stringify({
        title,
        slug,
        content,
        lastSaved: new Date().toISOString()
      }));
    }, 30000); // Save every 30 seconds
    
    return () => clearInterval(interval);
  }, [editor, editorReady, title, slug]);

  // Generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    // Only auto-generate slug if it hasn't been manually edited
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(newTitle));
    }
  };

  // Check for content before submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editor && editor.isEmpty) {
      toast({
        title: "Content Required",
        description: "Please add some content to your post before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    onSubmit(e);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={handleTitleChange}
          placeholder="Enter post title"
          required
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <div className="flex items-center space-x-2">
          <span className="text-muted-foreground">/post/</span>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="your-post-slug"
            required
            className="flex-1"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          The slug is used in the URL of your post. It should contain only lowercase letters, numbers, and hyphens.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Content</Label>
        <div className="border rounded-lg overflow-hidden">
          <EditorMenu editor={editor} />
          <EditorContent editor={editor} />
          {editor && (
            <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
              <EditorMenu editor={editor} isBubble />
            </BubbleMenu>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Tip: You can drag and drop images directly into the editor. Use Markdown shortcuts like # for headings, {">"} for quotes, and ``` for code blocks.
        </p>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        {cancelButton}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="animate-spin mr-2">⟳</span> {submitButtonText}...
            </>
          ) : (
            submitButtonText
          )}
        </Button>
      </div>
    </form>
  );
}
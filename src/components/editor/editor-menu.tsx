'use client';

import { Editor } from '@tiptap/react';
import { Button } from "@/components/ui/button";
import {
  BoldIcon,
  ItalicIcon,
  StrikethroughIcon,
  CodeIcon,
  Link2Icon,
  ImageIcon,
  ListIcon,
  ListOrderedIcon,
  Code2Icon,
  QuoteIcon,
  UndoIcon,
  RedoIcon,
  Heading1,
  Heading2,
  Heading3,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  AlignJustifyIcon,
  PilcrowIcon,
  RemoveFormattingIcon,
  SeparatorHorizontalIcon,
} from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function EditorMenu({ editor, isBubble = false }: { editor: Editor | null; isBubble?: boolean }) {
  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt('Enter the image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter the URL', previousUrl);
    
    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const MenuButton = ({ 
    onClick, 
    isActive = false, 
    disabled = false, 
    tooltip, 
    icon 
  }: { 
    onClick: () => void, 
    isActive?: boolean, 
    disabled?: boolean, 
    tooltip: string, 
    icon: React.ReactNode 
  }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClick}
            disabled={disabled}
            className={isActive ? 'bg-primary/10' : ''}
          >
            {icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className={`flex flex-wrap gap-1 p-2 ${isBubble ? 'bg-background border rounded-lg shadow-lg' : 'border-b'}`}>
      {!isBubble && (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <PilcrowIcon className="h-4 w-4 mr-1" /> Heading
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                <Heading1 className="h-4 w-4 mr-2" /> <span className="text-xl">Heading 1</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                <Heading2 className="h-4 w-4 mr-2" /> <span className="text-lg">Heading 2</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                <Heading3 className="h-4 w-4 mr-2" /> <span className="text-base">Heading 3</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}>
                <PilcrowIcon className="h-4 w-4 mr-2" /> <span className="text-sm">Paragraph</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}

      <MenuButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        tooltip="Bold"
        icon={<BoldIcon className="h-4 w-4" />}
      />

      <MenuButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        tooltip="Italic"
        icon={<ItalicIcon className="h-4 w-4" />}
      />

      <MenuButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        tooltip="Strikethrough"
        icon={<StrikethroughIcon className="h-4 w-4" />}
      />

      <MenuButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        tooltip="Inline Code"
        icon={<CodeIcon className="h-4 w-4" />}
      />

      {!isBubble && (
        <>
          <MenuButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            tooltip="Code Block"
            icon={<Code2Icon className="h-4 w-4" />}
          />

          <MenuButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            tooltip="Quote"
            icon={<QuoteIcon className="h-4 w-4" />}
          />

          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            tooltip="Bullet List"
            icon={<ListIcon className="h-4 w-4" />}
          />

          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            tooltip="Numbered List"
            icon={<ListOrderedIcon className="h-4 w-4" />}
          />

          <MenuButton
            onClick={setLink}
            isActive={editor.isActive('link')}
            tooltip="Add Link"
            icon={<Link2Icon className="h-4 w-4" />}
          />

          <MenuButton
            onClick={addImage}
            tooltip="Add Image"
            icon={<ImageIcon className="h-4 w-4" />}
          />

          <MenuButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            tooltip="Horizontal Rule"
            icon={<SeparatorHorizontalIcon className="h-4 w-4" />}
          />

          <div className="flex-grow"></div>

          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            tooltip="Align Left"
            icon={<AlignLeftIcon className="h-4 w-4" />}
          />

          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            tooltip="Align Center"
            icon={<AlignCenterIcon className="h-4 w-4" />}
          />

          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            tooltip="Align Right"
            icon={<AlignRightIcon className="h-4 w-4" />}
          />

          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            isActive={editor.isActive({ textAlign: 'justify' })}
            tooltip="Justify"
            icon={<AlignJustifyIcon className="h-4 w-4" />}
          />

          <MenuButton
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            tooltip="Clear Formatting"
            icon={<RemoveFormattingIcon className="h-4 w-4" />}
          />

          <MenuButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            tooltip="Undo"
            icon={<UndoIcon className="h-4 w-4" />}
          />

          <MenuButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            tooltip="Redo"
            icon={<RedoIcon className="h-4 w-4" />}
          />
        </>
      )}
    </div>
  );
}
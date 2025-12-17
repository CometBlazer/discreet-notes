'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CharacterCount from '@tiptap/extension-character-count';
import { useEffect } from 'react';

interface DiscreteEditorProps {
  content: string;
  isVisible: boolean;
  onChange: (content: string, plainText: string, wordCount: number) => void;
  onSave: () => void;
}

export default function DiscreteEditor({
  content,
  isVisible,
  onChange,
  onSave,
}: DiscreteEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      CharacterCount,
    ],
    content,
    editorProps: {
      attributes: {
        class: `prose prose-invert max-w-none focus:outline-none min-h-[calc(100vh-12rem)] p-4 ${
          isVisible ? 'text-white' : 'text-transparent caret-white'
        }`,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      const words = editor.storage.characterCount.words();
      onChange(html, text, words);
    },
  });

  // Handle Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave]);

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Update visibility styling
  useEffect(() => {
    if (editor) {
      const className = `prose prose-invert max-w-none focus:outline-none min-h-[calc(100vh-12rem)] p-4 ${
        isVisible ? 'text-white' : 'text-transparent caret-white'
      }`;
      editor.view.dom.setAttribute('class', className);
    }
  }, [isVisible, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="w-full h-full">
      <EditorContent editor={editor} />
    </div>
  );
}
// components/DiscreteEditor.tsx
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CharacterCount from '@tiptap/extension-character-count';
import { useEffect, forwardRef, useImperativeHandle } from 'react';

interface DiscreteEditorProps {
  content: string;
  isVisible: boolean;
  textOpacity?: number;
  onChange: (content: string, plainText: string, wordCount: number) => void;
  onSave: () => void;
}

const DiscreteEditor = forwardRef<{ scrollToBottom: () => void }, DiscreteEditorProps>(
  ({ content, isVisible, textOpacity = 1, onChange, onSave }, ref) => {
    const editor = useEditor({
      extensions: [StarterKit, CharacterCount],
      content,
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class: 'prose prose-invert max-w-none focus:outline-none min-h-[calc(100vh-12rem)] p-4',
        },
      },
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        const text = editor.getText();
        const words = editor.storage.characterCount.words();
        onChange(html, text, words);
      },
    });

    const textColor = isVisible ? `rgba(255,255,255,${textOpacity})` : 'transparent';
    const caretColor = isVisible ? 'white' : 'rgb(82,82,82)';

    useImperativeHandle(ref, () => ({
      scrollToBottom: () => {
        if (!editor) return;
        editor.commands.focus('end');
        editor.commands.enter();
        editor.commands.enter();
        editor.commands.enter();
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      },
    }), [editor]);

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

    useEffect(() => {
      if (editor && content !== editor.getHTML()) {
        editor.commands.setContent(content);
      }
    }, [content, editor]);

    if (!editor) return null;

    return (
      <div className="w-full h-full" data-discrete-editor>
        <style>{`
          [data-discrete-editor] .ProseMirror,
          [data-discrete-editor] .ProseMirror * {
            color: ${textColor} !important;
            caret-color: ${caretColor} !important;
          }
        `}</style>
        <EditorContent editor={editor} />
      </div>
    );
  }
);

DiscreteEditor.displayName = 'DiscreteEditor';
export default DiscreteEditor;
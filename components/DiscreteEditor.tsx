// components/DiscreteEditor.tsx
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CharacterCount from '@tiptap/extension-character-count';
import { useEffect, forwardRef, useImperativeHandle } from 'react';

interface DiscreteEditorProps {
  content: string;
  isVisible: boolean;
  onChange: (content: string, plainText: string, wordCount: number) => void;
  onSave: () => void;
}

const DiscreteEditor = forwardRef<{ scrollToBottom: () => void }, DiscreteEditorProps>(
  ({ content, isVisible, onChange, onSave }, ref) => {
    const editor = useEditor({
      extensions: [StarterKit, CharacterCount],
      content,
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class: `prose prose-invert max-w-none focus:outline-none min-h-[calc(100vh-12rem)] p-4 ${
            isVisible ? 'text-white' : 'text-transparent caret-neutral-600'
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

    useImperativeHandle(ref, () => ({
      scrollToBottom: () => {
        if (!editor) return;
        // Move cursor to end
        editor.commands.focus('end');
        // Insert a few empty lines
        editor.commands.enter();
        editor.commands.enter();
        // editor.commands.enter();
        
        // Scroll to bottom
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

    useEffect(() => {
      if (editor) {
        const className = `prose prose-invert max-w-none focus:outline-none min-h-[calc(100vh-12rem)] p-4 ${
          isVisible ? 'text-white' : 'text-transparent caret-neutral-600'
        }`;
        editor.view.dom.setAttribute('class', className);
      }
    }, [isVisible, editor]);

    if (!editor) return null;

    return (
      <div className="w-full h-full">
        <EditorContent editor={editor} />
      </div>
    );
  }
);

DiscreteEditor.displayName = 'DiscreteEditor';
export default DiscreteEditor;
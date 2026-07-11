'use client';

// Tiptap editor wrapper for discreet mode: text is rendered fully transparent
// (only the caret and word count give feedback) until visibility is toggled on,
// at which point opacity is user-adjustable.
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CharacterCount from '@tiptap/extension-character-count';
import { useEffect, forwardRef, useImperativeHandle } from 'react';

interface DiscreetEditorProps {
  content: string;
  isVisible: boolean;
  textOpacity?: number;
  onChange: (content: string, plainText: string, wordCount: number) => void;
  onSave: () => void;
}

const DiscreetEditor = forwardRef<{ scrollToBottom: () => void }, DiscreetEditorProps>(
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

    // Ctrl/Cmd+S triggers a manual save instead of the browser dialog
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
      <div className="w-full h-full" data-discreet-editor>
        <style>{`
          [data-discreet-editor] .ProseMirror,
          [data-discreet-editor] .ProseMirror * {
            color: ${textColor} !important;
            caret-color: ${caretColor} !important;
          }
        `}</style>
        <EditorContent editor={editor} />
      </div>
    );
  }
);

DiscreetEditor.displayName = 'DiscreetEditor';
export default DiscreetEditor;

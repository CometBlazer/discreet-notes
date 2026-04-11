// app/note/[id]/page.tsx
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getNote, saveNote, type Note } from '@/lib/db';
import DiscreteEditor from '@/components/DiscreteEditor';
import { Save, Eye, EyeOff, X, Check, Loader2, Circle, ArrowDown } from 'lucide-react';

type SaveStatus = 'saved' | 'saving' | 'unsaved';

export default function NotePage() {
  const router = useRouter();
  const params = useParams();
  const noteId = params.id as string;

  const [note, setNote] = useState<Note | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [textOpacity, setTextOpacity] = useState(1);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [isLoading, setIsLoading] = useState(true);
  const [showBar, setShowBar] = useState(true);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContentRef = useRef<string>('');
  const lastScrollY = useRef(0);
  const editorRef = useRef<{ scrollToBottom: () => void } | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < lastScrollY.current || currentScrollY < 10) {
        setShowBar(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setShowBar(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fast synchronous init for new notes, async load for existing
  useEffect(() => {
    let cancelled = false;
    getNote(noteId).then((existingNote) => {
      if (cancelled) return;
      if (existingNote) {
        setNote(existingNote);
        lastSavedContentRef.current = existingNote.content;
      } else {
        const newNote: Note = {
          id: noteId,
          content: '',
          plainText: '',
          wordCount: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setNote(newNote);
        lastSavedContentRef.current = '';
      }
      setIsLoading(false);
    }).catch(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [noteId]);

  const persistNote = useCallback(async (updatedNote: Note) => {
    if (updatedNote.content === lastSavedContentRef.current) {
      setSaveStatus('saved');
      return;
    }

    setSaveStatus('saving');
    try {
      await saveNote(updatedNote);
      lastSavedContentRef.current = updatedNote.content;
      setSaveStatus('saved');
    } catch (error) {
      console.error('Error saving note:', error);
      setSaveStatus('unsaved');
    }
  }, []);

  const handleChange = useCallback((content: string, plainText: string, wordCount: number) => {
    setNote((prev) => {
      if (!prev) return prev;
      const updated: Note = {
        ...prev,
        content,
        plainText,
        wordCount,
        updatedAt: Date.now(),
      };

      if (content !== lastSavedContentRef.current) {
        setSaveStatus('unsaved');
      }

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => persistNote(updated), 2000);

      return updated;
    });
  }, [persistNote]);

  const handleSave = useCallback(async () => {
    if (!note) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    if (note.content === lastSavedContentRef.current) {
      setSaveStatus('saved');
      return;
    }
    await persistNote(note);
  }, [note, persistNote]);

  const handleClose = async () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    if (note && note.content !== lastSavedContentRef.current) {
      await persistNote(note);
    }
    router.push('/');
  };

  const handleScrollToBottom = () => {
    editorRef.current?.scrollToBottom();
  };

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-neutral-600 animate-spin" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-600 text-sm tracking-wide">Note not found</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-16">
      {/* Word Count */}
      <div className="text-left px-4 pt-4 pb-2">
        <p className="text-xs text-neutral-600 tracking-widest uppercase">
          {note.wordCount} words
        </p>
      </div>

      {/* Editor */}
      <DiscreteEditor
        ref={editorRef}
        content={note.content}
        isVisible={isVisible}
        textOpacity={textOpacity}
        onChange={handleChange}
        onSave={handleSave}
      />

      {/* Bottom Navbar */}
      <div
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
        className={`fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-neutral-800/50 px-4 pt-3 flex items-center justify-between transition-all duration-500 ease-out z-50 ${
          showBar ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="flex items-center space-x-6">
          {/* Save Button */}
          <button
            onClick={handleSave}
            className="group flex items-center space-x-2 text-neutral-500 hover:text-neutral-300 transition-colors duration-300 cursor-pointer"
          >
            <Save className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-sm tracking-wide">save</span>
          </button>

          {/* Save Status */}
          <div className="flex items-center space-x-2 text-neutral-600">
            {saveStatus === 'saved' && (
              <>
                <Check className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span className="text-xs tracking-wider">saved</span>
              </>
            )}
            {saveStatus === 'saving' && (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} />
                <span className="text-xs tracking-wider">saving</span>
              </>
            )}
            {saveStatus === 'unsaved' && (
              <>
                <Circle className="w-3 h-3 fill-current" strokeWidth={0} />
                <span className="text-xs tracking-wider">unsaved</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-6">
          {/* Scroll to Bottom */}
          <button
            onClick={handleScrollToBottom}
            className="group flex items-center space-x-2 text-neutral-500 hover:text-neutral-300 transition-colors duration-300 cursor-pointer"
          >
            <ArrowDown className="w-4 h-4" strokeWidth={1.5} />
          </button>

          {/* Opacity Slider (only when visible) */}
          {isVisible && (
            <input
              type="range"
              min="0.05"
              max="1"
              step="0.05"
              value={textOpacity}
              onChange={(e) => setTextOpacity(parseFloat(e.target.value))}
              className="w-20 h-1 accent-neutral-500 cursor-pointer"
            />
          )}

          {/* Visibility Toggle */}
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="group flex items-center space-x-2 text-neutral-500 hover:text-neutral-300 transition-colors duration-300 cursor-pointer"
          >
            {isVisible ? (
              <Eye className="w-4 h-4" strokeWidth={1.5} />
            ) : (
              <EyeOff className="w-4 h-4" strokeWidth={1.5} />
            )}
          </button>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="text-neutral-500 hover:text-neutral-300 transition-colors duration-300 cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </main>
  );
}
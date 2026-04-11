// app/note/[id]/page.tsx
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getNote, saveNote, type Note } from '@/lib/db';
import DiscreteEditor from '@/components/DiscreteEditor';
import { Save, Eye, EyeOff, X, Check, Loader2, Circle } from 'lucide-react';

type SaveStatus = 'saved' | 'saving' | 'unsaved';

export default function NotePage() {
  const router = useRouter();
  const params = useParams();
  const noteId = params.id as string;

  const [note, setNote] = useState<Note | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [isLoading, setIsLoading] = useState(true);
  const [showHeader, setShowHeader] = useState(true);
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContentRef = useRef<string>('');
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY.current || currentScrollY < 10) {
        setShowHeader(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setShowHeader(false);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadNote = useCallback(async () => {
    try {
      const existingNote = await getNote(noteId);
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
    } catch (error) {
      console.error('Error loading note:', error);
    } finally {
      setIsLoading(false);
    }
  }, [noteId]);

  useEffect(() => {
    loadNote();
  }, [loadNote]);

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
    if (!note) return;

    const updatedNote: Note = {
      ...note,
      content,
      plainText,
      wordCount,
      updatedAt: Date.now(),
    };

    setNote(updatedNote);
    
    if (content !== lastSavedContentRef.current) {
      setSaveStatus('unsaved');
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      persistNote(updatedNote);
    }, 2000);
  }, [note, persistNote]);

  const handleSave = useCallback(async () => {
    if (!note) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    if (note.content === lastSavedContentRef.current) {
      setSaveStatus('saved');
      return;
    }
    
    await persistNote(note);
  }, [note, persistNote]);

  const handleClose = async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    if (note && note.content !== lastSavedContentRef.current) {
      await persistNote(note);
    }
    router.push('/');
  };

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (note && note.content !== lastSavedContentRef.current) {
        persistNote(note);
      }
    };
  }, [note, persistNote]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
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
    <main className="min-h-screen">
      {/* Header */}
      <div 
        className={`sticky top-0 bg-black/80 backdrop-blur-sm border-b border-neutral-800/50 px-4 py-3 flex items-center justify-between transition-all duration-500 ease-out z-50 ${
          showHeader ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
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
          {/* Visibility Toggle */}
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="group flex items-center space-x-2 text-neutral-500 hover:text-neutral-300 transition-colors duration-300 cursor-pointer"
          >
            {isVisible ? (
              <>
                <Eye className="w-4 h-4" strokeWidth={1.5} />
                <span className="text-sm tracking-wide"></span>
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                <span className="text-sm tracking-wide"></span>
              </>
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

      {/* Word Count */}
      <div className="text-left px-4 pt-4 pb-2">
        <p className="text-xs text-neutral-600 tracking-widest uppercase">
          {note.wordCount} words
        </p>
      </div>

      {/* Editor */}
      <DiscreteEditor
        content={note.content}
        isVisible={isVisible}
        onChange={handleChange}
        onSave={handleSave}
      />
    </main>
  );
}
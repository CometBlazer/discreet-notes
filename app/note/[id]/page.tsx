'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getNote, saveNote, type Note } from '@/lib/db';
import DiscreteEditor from '@/components/DiscreteEditor';

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

  // Handle scroll to show/hide header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY.current || currentScrollY < 10) {
        // Scrolling up or at top
        setShowHeader(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        // Scrolling down and past threshold
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
        // New note
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
    // Check if content has actually changed since last save
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
    
    // Only mark as unsaved if content actually changed
    if (content !== lastSavedContentRef.current) {
      setSaveStatus('unsaved');
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(() => {
      persistNote(updatedNote);
    }, 2000);
  }, [note, persistNote]);

  const handleSave = useCallback(async () => {
    if (!note) return;
    
    // Clear any pending auto-save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Only save if there are actual changes
    if (note.content === lastSavedContentRef.current) {
      setSaveStatus('saved');
      return;
    }
    
    await persistNote(note);
  }, [note, persistNote]);

  const handleClose = async () => {
    // Clear any pending auto-save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    if (note && note.content !== lastSavedContentRef.current) {
      await persistNote(note);
    }
    router.push('/');
  };

  // Save on unmount
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

  // Cleanup timeout on unmount
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
        <p className="text-neutral-500">Loading...</p>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-500">Note not found</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className={`sticky top-0 bg-black border-b border-neutral-800 px-4 py-3 flex items-center justify-between transition-transform duration-300 z-50 ${
          showHeader ? 'translate-y-0' : '-translate-y-full'
        }`}>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleSave}
            className="bg-white text-black px-4 py-2 rounded-xl font-medium hover:bg-neutral-200 transition-colors text-sm cursor-pointer"
          >
            Save
          </button>
          <div className="flex items-center space-x-2">
            {saveStatus === 'saved' && (
              <span className="text-green-500 text-sm">✓ Saved</span>
            )}
            {saveStatus === 'saving' && (
              <span className="text-neutral-400 text-sm">Saving...</span>
            )}
            {saveStatus === 'unsaved' && (
              <span className="text-yellow-500 text-sm">Unsaved</span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="text-neutral-400 hover:text-white transition-colors text-sm cursor-pointer outline-1 outline-neutral-600 px-3 py-2 rounded-xl"
          >
            {isVisible ? '👁️ Hide' : '👁️ Show'}
          </button>
          <button
            onClick={handleClose}
            className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Word Count */}
      <div className="text-left px-4 pt-2 text-neutral-400">
        <p className="text-md font-light">Word Count: {note.wordCount}</p>
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
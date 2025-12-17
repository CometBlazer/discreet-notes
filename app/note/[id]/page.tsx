'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getNote, saveNote, type Note } from '@/lib/db';
import { debounce } from '@/lib/utils';
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

  useEffect(() => {
    loadNote();
  }, [noteId]);

  const loadNote = async () => {
    try {
      const existingNote = await getNote(noteId);
      if (existingNote) {
        setNote(existingNote);
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
      }
    } catch (error) {
      console.error('Error loading note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const persistNote = async (updatedNote: Note) => {
    setSaveStatus('saving');
    try {
      await saveNote(updatedNote);
      setSaveStatus('saved');
    } catch (error) {
      console.error('Error saving note:', error);
      setSaveStatus('unsaved');
    }
  };

  // Debounced auto-save
  const debouncedSave = useCallback(
    debounce((noteToSave: Note) => {
      persistNote(noteToSave);
    }, 2000),
    []
  );

  const handleChange = (content: string, plainText: string, wordCount: number) => {
    if (!note) return;

    const updatedNote: Note = {
      ...note,
      content,
      plainText,
      wordCount,
      updatedAt: Date.now(),
    };

    setNote(updatedNote);
    setSaveStatus('unsaved');
    debouncedSave(updatedNote);
  };

  const handleSave = async () => {
    if (!note) return;
    await persistNote(note);
  };

  const handleClose = async () => {
    if (note && saveStatus !== 'saved') {
      await persistNote(note);
    }
    router.push('/');
  };

  // Save on unmount
  useEffect(() => {
    return () => {
      if (note && saveStatus !== 'saved') {
        persistNote(note);
      }
    };
  }, [note, saveStatus]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Note not found</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-black border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleSave}
            className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
          >
            Save
          </button>
          <div className="flex items-center space-x-2">
            {saveStatus === 'saved' && (
              <span className="text-green-500 text-sm">✓ Saved</span>
            )}
            {saveStatus === 'saving' && (
              <span className="text-gray-400 text-sm">Saving...</span>
            )}
            {saveStatus === 'unsaved' && (
              <span className="text-yellow-500 text-sm">Unsaved</span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            {isVisible ? '👁️ Hide Text' : '👁️ Show Text'}
          </button>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
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
      <div className="text-center py-6 text-gray-400">
        <p className="text-2xl font-light">Word Count: {note.wordCount}</p>
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
// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { getAllNotes, deleteNote, searchNotes, type Note } from '@/lib/db';
import NoteList from '@/components/NoteList';
import SearchBar from '@/components/SearchBar';

export default function Home() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [displayedNotes, setDisplayedNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const allNotes = await getAllNotes();
      setNotes(allNotes);
      setDisplayedNotes(allNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewNote = () => {
    const id = uuidv4();
    router.push(`/note/${id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNote(id);
      await loadNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleSearch = async (query: string) => {
    if (query.trim() === '') {
      setDisplayedNotes(notes);
    } else {
      try {
        const results = await searchNotes(query);
        setDisplayedNotes(results);
      } catch (error) {
        console.error('Error searching notes:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-500">Loading...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4 max-w-2xl mx-auto flex flex-col">
      {/* Notes list fills available space */}
      <div className="flex-1 pt-4">
        <p className="text-sm text-neutral-500 mb-4 ml-1">
          Last updated: {displayedNotes.length > 0 ? new Date(displayedNotes[0].updatedAt).toLocaleString() : 'No notes available'}. Format is MM/DD/YY.
        </p>
        <NoteList notes={displayedNotes} onDelete={handleDelete} />
      </div>

      {/* Bottom section: heading, search, new note */}
      <div className="sticky bottom-0 pt-4 bg-black" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">My Notes</h1>
          <button
            onClick={handleNewNote}
            className="bg-white text-black px-4 py-2 rounded-2xl font-medium hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            + New Note
          </button>
        </div>
        <SearchBar onSearch={handleSearch} />
      </div>
    </main>
  );
}
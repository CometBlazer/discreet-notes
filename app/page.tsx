'use client';

// Home: note list with live search and a floating bottom dock
// (search bar + new-note button) that stays clear of mobile safe areas.
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
    <main className="min-h-screen max-w-2xl mx-auto px-4">
      <header className="flex items-center justify-between pt-6 pb-4">
        <h1 className="text-3xl font-bold">My Notes</h1>
        <span className="text-sm text-neutral-500">
          {notes.length} {notes.length === 1 ? 'note' : 'notes'}
        </span>
      </header>

      {/* Bottom padding keeps the last notes visible above the floating dock */}
      <div className="pb-32">
        <NoteList notes={displayedNotes} onDelete={handleDelete} />
      </div>

      {/* Floating dock: search + new note */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 px-4 pt-10 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none"
        style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="mx-auto flex max-w-2xl items-center gap-3 pointer-events-auto">
          <SearchBar onSearch={handleSearch} />
          <button
            onClick={handleNewNote}
            aria-label="New note"
            className="h-12 w-12 shrink-0 rounded-full bg-white text-black text-2xl leading-none shadow-lg hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            +
          </button>
        </div>
      </div>
    </main>
  );
}

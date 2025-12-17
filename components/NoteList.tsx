'use client';

import Link from 'next/link';
import { Note } from '@/lib/db';
import { formatRelativeTime, getFirstLine } from '@/lib/utils';

interface NoteListProps {
  notes: Note[];
  onDelete: (id: string) => void;
}

export default function NoteList({ notes, onDelete }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-20">
        <p className="text-xl mb-2">No notes yet</p>
        <p className="text-sm">Create your first discrete note</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <div
          key={note.id}
          className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors relative group"
        >
          <Link href={`/note/${note.id}`} className="block">
            <h3 className="text-lg font-medium mb-2 truncate">
              {getFirstLine(note.plainText)}
            </h3>
            <div className="flex items-center text-sm text-gray-400 space-x-3">
              <span>{note.wordCount} words</span>
              <span>•</span>
              <span>{formatRelativeTime(note.updatedAt)}</span>
            </div>
          </Link>
          <button
            onClick={(e) => {
              e.preventDefault();
              if (confirm('Delete this note?')) {
                onDelete(note.id);
              }
            }}
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
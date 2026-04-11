// components/NoteList.tsx
'use client';

import Link from 'next/link';
import { Note } from '@/lib/db';
import { formatRelativeTime } from '@/lib/utils';
import { useState } from 'react';

interface NoteListProps {
  notes: Note[];
  onDelete: (id: string) => void;
}

export default function NoteList({ notes, onDelete }: NoteListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (e: React.MouseEvent, note: Note) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await navigator.clipboard.writeText(note.plainText);
      setCopiedId(note.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (notes.length === 0) {
    return (
      <div className="text-center text-neutral-500 mt-20">
        <p className="text-xl mb-2">No notes yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <div
          key={note.id}
          className="bg-neutral-900 rounded-lg p-4 hover:bg-neutral-800 transition-colors relative"
        >
          <Link href={`/note/${note.id}`} className="block pr-24">
            <h3 className="text-lg font-medium mb-2">
              Note from {new Date(note.createdAt).toLocaleDateString()}
            </h3>
            <div className="flex items-center text-xs text-neutral-400 space-x-1">
              <span>Created {formatRelativeTime(note.createdAt)}</span>
              <span>•</span>
              <span>Updated {formatRelativeTime(note.updatedAt)}</span>
              <span>•</span>
              <span>{note.wordCount} words</span>
            </div>
          </Link>
          <div className="absolute top-4 right-4 flex items-center space-x-3">
            <button
              onClick={(e) => handleCopy(e, note)}
              className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Copy note content"
            >
              {copiedId === note.id ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                  <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
                </svg>
              )}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (confirm('Delete this note?')) {
                  onDelete(note.id);
                }
              }}
              className="text-red-500 hover:text-red-400 transition-colors cursor-pointer"
              title="Delete note"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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
        </div>
      ))}
    </div>
  );
}
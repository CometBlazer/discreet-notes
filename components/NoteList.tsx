'use client';

import Link from 'next/link';
import { Note } from '@/lib/db';
import { formatRelativeTime } from '@/lib/utils';
import { useState } from 'react';
import { Copy, Check, Trash2 } from 'lucide-react';

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
                <Check className="h-5 w-5 text-green-500" strokeWidth={2} />
              ) : (
                <Copy className="h-5 w-5" strokeWidth={2} />
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
              <Trash2 className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

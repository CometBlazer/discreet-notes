// IndexedDB persistence for notes (via idb). All data stays on-device.
import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface Note {
  id: string;
  content: string; // Tiptap HTML
  plainText: string;
  wordCount: number;
  createdAt: number;
  updatedAt: number;
}

interface NotesDB extends DBSchema {
  notes: {
    key: string;
    value: Note;
    indexes: { 'by-updated': number };
  };
}

// Keeps the original database name so existing users' notes survive the
// project's rename from "Discrete Notes" to "Discreet Notes".
const DB_NAME = 'discrete-notes-db';
const STORE_NAME = 'notes';

let dbInstance: IDBPDatabase<NotesDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<NotesDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<NotesDB>(DB_NAME, 1, {
    upgrade(db) {
      const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      store.createIndex('by-updated', 'updatedAt');
    },
  });

  return dbInstance;
}

export async function getAllNotes(): Promise<Note[]> {
  const db = await getDB();
  const notes = await db.getAllFromIndex(STORE_NAME, 'by-updated');
  return notes.reverse(); // Most recent first
}

export async function getNote(id: string): Promise<Note | undefined> {
  const db = await getDB();
  return db.get(STORE_NAME, id);
}

export async function saveNote(note: Note): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, note);
}

export async function deleteNote(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

export async function searchNotes(query: string): Promise<Note[]> {
  const allNotes = await getAllNotes();
  const lowerQuery = query.toLowerCase();

  return allNotes.filter((note) =>
    note.plainText.toLowerCase().includes(lowerQuery)
  );
}

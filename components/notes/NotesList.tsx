'use client';

import NoteCard from './NoteCard';
import { useNotes } from './NotesContext';
import { deleteNote } from '@/app/actions/notes';

interface Note {
  id: string;
  title: string;
  content: string;
  updated_at: string;
}

function NotesGrid() {
  const { notes } = useNotes();
  
  if (!notes || notes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No notes yet. Create your first note!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.map((note: Note) => (
        <NoteCard 
          key={note.id} 
          note={note} 
          deleteNote={deleteNote} 
        />
      ))}
    </div>
  );
}

export default function NotesList() {
  return <NotesGrid />;
} 
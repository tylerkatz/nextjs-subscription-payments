'use client';

import { createContext, useContext, useCallback, useState, ReactNode } from 'react';

interface Note {
  id: string;
  title: string;
  content: string;
  updated_at: string;
}

interface NotesContextType {
  notes: Note[];
  setNotes: (notes: Note[]) => void;
  removeNote: (id: string) => void;
  addNote: (note: Note) => void;
  updateNote: (note: Note) => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ 
  children, 
  initialNotes 
}: { 
  children: ReactNode;
  initialNotes: Note[];
}) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);

  const removeNote = useCallback((id: string) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
  }, []);

  const addNote = useCallback((note: Note) => {
    setNotes(prevNotes => [note, ...prevNotes]);
  }, []);

  const updateNote = useCallback((updatedNote: Note) => {
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === updatedNote.id ? updatedNote : note
      )
    );
  }, []);

  return (
    <NotesContext.Provider value={{ notes, setNotes, removeNote, addNote, updateNote }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
} 
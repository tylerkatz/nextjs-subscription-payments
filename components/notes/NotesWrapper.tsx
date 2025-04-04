'use client';

import { ReactNode } from 'react';
import { NotesProvider } from './NotesContext';

interface NotesWrapperProps {
  children: ReactNode;
  initialNotes: any[];
}

export default function NotesWrapper({ children, initialNotes }: NotesWrapperProps) {
  return (
    <NotesProvider initialNotes={initialNotes}>
      {children}
    </NotesProvider>
  );
} 
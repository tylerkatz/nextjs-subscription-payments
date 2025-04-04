'use client';

import { format } from 'date-fns';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import DeleteNoteButton from './DeleteNoteButton';
import { useNotes } from './NotesContext';

interface Note {
  id: string;
  title: string;
  content: string;
  updated_at: string;
}

interface NoteCardProps {
  note: Note;
  deleteNote: (id: string) => Promise<{ error: any }>;
}

export default function NoteCard({ note, deleteNote }: NoteCardProps) {
  const { removeNote } = useNotes();

  const handleDelete = async () => {
    const { error } = await deleteNote(note.id);
    if (!error) {
      removeNote(note.id);
    }
  };

  return (
    <div className="relative group">
      <Card
        title={
          <div className="flex justify-between items-center">
            <span>{note.title}</span>
            <DeleteNoteButton onDelete={handleDelete} />
          </div>
        }
        description={
          <div>
            <p className="text-gray-600 line-clamp-3">{note.content}</p>
            <p className="text-sm text-gray-400 mt-2">
              Last updated: {format(new Date(note.updated_at), 'MMM d, yyyy')}
            </p>
          </div>
        }
      >
        <Link href={`/notes/${note.id}`}>
          <div className="mt-4">
            <button className="text-sm text-blue-500 hover:text-blue-400">
              View Details
            </button>
          </div>
        </Link>
      </Card>
    </div>
  );
} 
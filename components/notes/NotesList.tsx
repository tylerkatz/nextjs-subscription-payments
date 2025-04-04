import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  updated_at: string;
}

export default async function NotesList() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: notes, error } = await supabase
    .from('notes')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching notes:', error);
    return <div>Error loading notes</div>;
  }

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
        <div key={note.id} className="relative group">
          <Card
            title={
              <div className="flex justify-between items-center">
                <span>{note.title}</span>
                <form action={async () => {
                  'use server';
                  const { error } = await supabase
                    .from('notes')
                    .delete()
                    .eq('id', note.id);
                  if (error) console.error('Error deleting note:', error);
                }}>
                  <button
                    type="submit"
                    className="hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </form>
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
      ))}
    </div>
  );
} 
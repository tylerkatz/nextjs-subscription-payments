import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import NotesWrapper from '@/components/notes/NotesWrapper';

export default async function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  const { data: notes } = await supabase
    .from('notes')
    .select('*')
    .order('updated_at', { ascending: false });

  return (
    <NotesWrapper initialNotes={notes || []}>
      {children}
    </NotesWrapper>
  );
} 
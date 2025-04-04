'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function deleteNote(noteId: string) {
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

  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId);
  
  return { error };
} 
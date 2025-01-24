import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getErrorRedirect, getStatusRedirect } from '@/utils/helpers';
import { getAuthRouting } from '@/utils/auth-helpers/settings';

export async function GET(request: NextRequest) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the `@supabase/ssr` package. It exchanges an auth code for the user's session.
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        getErrorRedirect(
          `${requestUrl.origin}/signin`,
          error.name,
          "Sorry, we weren't able to log you in. Please try again."
        )
      );
    }
  }

  const { useServerRedirect } = getAuthRouting();
  
  if (useServerRedirect) {
    // Server-side redirect with toast
    return NextResponse.redirect(
      getStatusRedirect(
        new URL('/account', request.url).toString(),
        'Successfully signed in'
      )
    );
  } else {
    // Client-side redirect data
    return NextResponse.json({ redirectTo: '/account' });
  }
}

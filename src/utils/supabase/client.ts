import { createBrowserClient } from '@supabase/ssr';

const silentFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as any)?.url || '';
  const isPlaceholder = urlStr.includes('placeholder');
  
  if (isPlaceholder) {
    return new Response(JSON.stringify({ error: 'offline_mode', error_description: 'Mock/placeholder bypass active.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const res = await fetch(input, init);
    return res;
  } catch (err) {
    return new Response(JSON.stringify({ error: 'offline_mode', error_description: 'Network fetch intercepted.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export function createClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  const isMock = !rawUrl || rawUrl.includes('placeholder') || rawUrl.includes('example.com');
  const url = isMock ? 'https://placeholder.supabase.co' : rawUrl!;
  const key = isMock ? 'placeholder-key' : rawKey!;

  return createBrowserClient(
    url,
    key,
    {
      auth: {
        autoRefreshToken: !isMock,
        persistSession: !isMock,
        detectSessionInUrl: !isMock,
      },
      global: {
        fetch: silentFetch,
      }
    }
  );
}

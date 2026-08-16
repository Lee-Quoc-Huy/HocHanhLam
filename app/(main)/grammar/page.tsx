import { createClient, getCurrentUser } from '@/lib/supabase/server';
import GrammarClient from './GrammarClient';

export const dynamic = 'force-dynamic';

export default async function GrammarPage() {
  const user = await getCurrentUser();
  const supabase = createClient();

  const [{ data: profile }, { data: grammar }] = await Promise.all([
    supabase.from('profiles').select('selected_languages').eq('id', user!.id).single(),
    supabase.from('user_grammar').select('*').order('created_at', { ascending: false }),
  ]);

  return <GrammarClient selectedLanguages={profile?.selected_languages ?? []} initialGrammar={grammar ?? []} />;
}

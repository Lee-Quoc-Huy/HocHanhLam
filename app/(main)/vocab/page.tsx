import { createClient, getCurrentUser } from '@/lib/supabase/server';
import VocabClient from './VocabClient';

export const dynamic = 'force-dynamic';

export default async function VocabPage() {
  const user = await getCurrentUser();
  const supabase = createClient();

  const [{ data: profile }, { data: vocab }] = await Promise.all([
    supabase.from('profiles').select('selected_languages').eq('id', user!.id).single(),
    supabase.from('user_vocab').select('*').order('created_at', { ascending: false }),
  ]);

  return <VocabClient selectedLanguages={profile?.selected_languages ?? []} initialVocab={vocab ?? []} />;
}

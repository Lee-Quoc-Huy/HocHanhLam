import { createClient, getCurrentUser } from '@/lib/supabase/server';
import GamesClient from './GamesClient';

export const dynamic = 'force-dynamic';

export default async function GamesPage() {
  const user = await getCurrentUser();
  const supabase = createClient();
  const { data: profile } = await supabase.from('profiles').select('selected_languages').eq('id', user!.id).single();

  return <GamesClient selectedLanguages={profile?.selected_languages ?? []} />;
}

import { createClient, getCurrentUser } from '@/lib/supabase/server';
import TutorClient from './TutorClient';

export const dynamic = 'force-dynamic';

export default async function TutorPage() {
  const user = await getCurrentUser();
  const supabase = createClient();
  const { data: history } = await supabase
    .from('chat_messages')
    .select('role, content')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: true })
    .limit(50);

  return <TutorClient initialMessages={history ?? []} />;
}

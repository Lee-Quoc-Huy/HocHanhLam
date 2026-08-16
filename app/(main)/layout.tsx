import { redirect } from 'next/navigation';
import { createClient, getCurrentUser } from '@/lib/supabase/server';
import AppShell from '@/components/AppShell';

function greeting(name: string) {
  const hour = new Date().getUTCHours() + 7; // giờ VN UTC+7 — tính thô cho lời chào
  const h = hour >= 24 ? hour - 24 : hour;
  const firstOnly = name.split(' ').pop() || name;
  if (h < 11) return `Chào buổi sáng, ${firstOnly} ☀️`;
  if (h < 18) return `Chào buổi chiều, ${firstOnly} 🌤️`;
  return `Chào buổi tối, ${firstOnly} 🌙`;
}

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const supabase = createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, onboarded, selected_languages')
    .eq('id', user.id)
    .single();

  if (!profile || !profile.onboarded) redirect('/onboarding');

  const displayName = profile.display_name || 'Học viên';

  return (
    <AppShell displayName={displayName} greetTitle={greeting(displayName)}>
      {children}
    </AppShell>
  );
}

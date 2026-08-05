-- Reduce AI Center agents from 8 down to 5: vocabulary, grammar, teacher,
-- translation, flashcard. Conversation/planner/search/recommendation are
-- dropped from the UI; any existing conversations using those agent types
-- are reassigned to 'teacher' (the general-purpose agent) so old chat
-- history isn't orphaned or deleted.

update public.ai_conversations
set agent_type = 'teacher'
where agent_type in ('conversation', 'planner', 'search', 'recommendation');

alter table public.ai_conversations
  drop constraint if exists ai_conversations_agent_type_check;

alter table public.ai_conversations
  add constraint ai_conversations_agent_type_check
  check (agent_type in ('vocabulary', 'grammar', 'teacher', 'translation', 'flashcard'));

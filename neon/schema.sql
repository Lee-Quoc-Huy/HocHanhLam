-- =========================================================
-- LANG VERSE — NEON (DB PHỤ: nội dung tĩnh, dùng chung mọi user)
-- Chạy trên Neon SQL Editor / psql sau khi tạo project.
-- Đây là dữ liệu KHÔNG gắn với user_id — admin/AI nạp trước,
-- app chỉ đọc (read-only) từ phía client.
-- =========================================================

create table if not exists languages (
  code text primary key,               -- en / kr / cn / jp
  name text not null,
  track text not null,                 -- TOEIC / TOPIK / HSK / JLPT
  flag text not null,
  levels jsonb not null                -- ["Mới bắt đầu","Sơ cấp",...]
);

create table if not exists topics (
  id serial primary key,
  lang_code text not null references languages(code),
  name text not null,
  level int not null default 0
);

-- Ngân hàng câu hỏi "Hoàn thành câu"
create table if not exists fillblank_questions (
  id serial primary key,
  lang_code text not null references languages(code),
  level int not null default 0,
  topic_id int references topics(id),
  question text not null,
  options jsonb not null,              -- ["a","b","c","d"]
  answer_index int not null
);

-- Ngân hàng bài "Đọc hiểu"
create table if not exists reading_passages (
  id serial primary key,
  lang_code text not null references languages(code),
  level int not null default 0,
  topic_id int references topics(id),
  passage text not null,
  question text not null,
  options jsonb not null,
  answer_index int not null
);

-- Từ điển mẫu phục vụ tính năng Dịch (khi chưa nối AI dịch thật)
create table if not exists dictionary_seed (
  id serial primary key,
  phrase_vi text not null,
  en text, kr text, cn text, jp text
);

create index if not exists idx_topics_lang on topics(lang_code);
create index if not exists idx_fillblank_lang_level on fillblank_questions(lang_code, level);
create index if not exists idx_reading_lang_level on reading_passages(lang_code, level);

-- =========================================================
-- SEED DATA
-- =========================================================
insert into languages (code, name, track, flag, levels) values
  ('en','Tiếng Anh','TOEIC','🇬🇧','["Mới bắt đầu","Sơ cấp","Trung cấp","Nâng cao","Thành thạo"]'),
  ('kr','Tiếng Hàn','TOPIK','🇰🇷','["TOPIK I - Sơ cấp","TOPIK I","TOPIK II","TOPIK II Cao cấp","Thành thạo"]'),
  ('cn','Tiếng Trung','HSK','🇨🇳','["HSK1","HSK2","HSK3","HSK4","HSK5+"]'),
  ('jp','Tiếng Nhật','JLPT','🇯🇵','["N5","N4","N3","N2","N1"]')
on conflict (code) do nothing;

insert into topics (lang_code, name, level) values
  ('en','Giao tiếp cơ bản',0), ('en','Công sở',1), ('en','Du lịch',1),
  ('kr','Chào hỏi',0), ('kr','Gia đình',0),
  ('cn','Chào hỏi',0), ('cn','Số đếm',0),
  ('jp','Chào hỏi',0), ('jp','Trường học',0);

insert into fillblank_questions (lang_code, level, question, options, answer_index) values
  ('en',0,'She ___ to school every day.', '["go","goes","going","gone"]', 1),
  ('en',0,'I have never ___ sushi before.', '["eat","ate","eaten","eating"]', 2),
  ('en',0,'They ___ playing football when it rained.', '["were","was","are","is"]', 0),
  ('kr',0,'저는 학생___.', '["이에요","예요","이다","입니다"]', 0),
  ('cn',0,'我___学生。', '["是","有","在","很"]', 0),
  ('jp',0,'わたし___がくせいです。', '["は","が","を","に"]', 0);

insert into reading_passages (lang_code, level, passage, question, options, answer_index) values
  ('en',0,'Minh wakes up at 6 AM every day. He exercises for 30 minutes, then has breakfast before going to work.',
   'What does Minh do right after waking up?', '["Has breakfast","Exercises","Goes to work","Sleeps again"]', 1),
  ('kr',0,'저는 매일 아침 6시에 일어나요. 아침을 먹고 학교에 가요.',
   '저는 아침에 무엇을 먼저 해요?', '["학교에 간다","아침을 먹는다","일어난다","잠을 잔다"]', 2),
  ('cn',0,'我每天早上七点起床，然后去公园跑步。',
   '他起床后做什么？', '["吃早饭","去公园跑步","去上班","睡觉"]', 1),
  ('jp',0,'わたしは毎朝六時に起きます。それから朝ごはんを食べます。',
   '起きた後、何をしますか。', '["学校に行く","朝ごはんを食べる","寝る","仕事に行く"]', 1);

insert into dictionary_seed (phrase_vi, en, kr, cn, jp) values
  ('xin chào','hello','안녕하세요','你好','こんにちは'),
  ('cảm ơn','thank you','감사합니다','谢谢','ありがとう'),
  ('tạm biệt','goodbye','안녕히 가세요','再见','さようなら');

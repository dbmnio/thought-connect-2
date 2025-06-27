create extension if not exists vector with schema extensions;

alter table public.thoughts
add column ai_description text,
add column embedding_status text default 'pending',
add column embedding vector(1536);

create index on public.thoughts using hnsw (embedding vector_l2_ops); 
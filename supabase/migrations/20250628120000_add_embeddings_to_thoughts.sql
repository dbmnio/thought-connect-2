create extension if not exists vector with schema extensions;

alter table public.thoughts
add column ai_description text,
add column embedding_status text default 'pending',
add column embedding public.vector(1536);

create index on public.thoughts using hnsw (embedding public.vector_l2_ops); 
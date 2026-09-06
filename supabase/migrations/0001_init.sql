-- Initial schema for the collaborative document editor.
-- See docs/TDD.md for the design rationale.

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique not null
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles (id) on delete cascade,
  title text not null default 'Untitled document',
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table document_shares (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents (id) on delete cascade,
  shared_with_id uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (document_id, shared_with_id)
);

-- Keep documents.updated_at current on every write.
create function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger documents_set_updated_at
  before update on documents
  for each row
  execute function set_updated_at();

-- Populate profiles on signup so client code can resolve share-by-email
-- without querying auth.users directly.
create function handle_new_user() returns trigger as $$
begin
  insert into profiles (id, email) values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function handle_new_user();

alter table profiles enable row level security;
alter table documents enable row level security;
alter table document_shares enable row level security;

-- profiles: any authenticated user can look up profiles (needed to resolve
-- share-by-email); only the trigger (security definer) writes rows.
create policy "profiles are readable by authenticated users"
  on profiles for select
  to authenticated
  using (true);

-- documents: owners have full access to their own rows.
create policy "owners have full access to their documents"
  on documents for all
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- documents' and document_shares' policies each need to check the other
-- table. A plain EXISTS subquery would re-trigger the other table's RLS,
-- which re-triggers this one, looping forever ("infinite recursion
-- detected in policy"). SECURITY DEFINER functions run with the function
-- owner's privileges, which bypasses RLS for the query inside the
-- function body, breaking the cycle.
create function is_shared_with_me(doc_id uuid) returns boolean
  language sql security definer set search_path = public stable as $$
    select exists (
      select 1 from document_shares
      where document_shares.document_id = doc_id
        and document_shares.shared_with_id = auth.uid()
    );
  $$;

create function is_document_owner(doc_id uuid) returns boolean
  language sql security definer set search_path = public stable as $$
    select exists (
      select 1 from documents
      where documents.id = doc_id
        and documents.owner_id = auth.uid()
    );
  $$;

-- documents: a user shared-with can read and update (not delete) the doc.
create policy "shared users can read documents"
  on documents for select
  to authenticated
  using (is_shared_with_me(id));

create policy "shared users can update documents"
  on documents for update
  to authenticated
  using (is_shared_with_me(id))
  with check (is_shared_with_me(id));

-- document_shares: a document's owner manages who it's shared with.
create policy "owners manage shares on their documents"
  on document_shares for all
  to authenticated
  using (is_document_owner(document_id))
  with check (is_document_owner(document_id));

-- document_shares: a shared-with user can see rows naming them, so the
-- client can tell which documents are shared with the current user.
create policy "shared users can see their own share rows"
  on document_shares for select
  to authenticated
  using (shared_with_id = auth.uid());

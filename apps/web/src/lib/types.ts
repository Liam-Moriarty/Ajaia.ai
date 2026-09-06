import type { JSONContent } from '@tiptap/react';

export type TiptapDocument = JSONContent;

export interface Profile {
  id: string;
  email: string;
}

export interface DocumentRow {
  id: string;
  owner_id: string;
  title: string;
  content: TiptapDocument;
  created_at: string;
  updated_at: string;
}

export interface DocumentShareRow {
  id: string;
  document_id: string;
  shared_with_id: string;
  created_at: string;
}

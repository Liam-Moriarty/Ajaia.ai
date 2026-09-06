import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { DocumentRow } from '../lib/types';
import { useAuth } from './useAuth';

export function useDocuments() {
  const { user } = useAuth();
  const [owned, setOwned] = useState<DocumentRow[]>([]);
  const [shared, setShared] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const [ownedResult, sharedResult] = await Promise.all([
      supabase
        .from('documents')
        .select('*')
        .eq('owner_id', user.id)
        .order('updated_at', { ascending: false }),
      supabase
        .from('documents')
        .select('*, document_shares!inner(shared_with_id)')
        .eq('document_shares.shared_with_id', user.id)
        .order('updated_at', { ascending: false }),
    ]);

    if (ownedResult.error) {
      setError(ownedResult.error.message);
    } else if (sharedResult.error) {
      setError(sharedResult.error.message);
    } else {
      setOwned(ownedResult.data as DocumentRow[]);
      setShared(sharedResult.data as DocumentRow[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  async function createDocument(): Promise<string> {
    if (!user) throw new Error('Not signed in');
    const { data, error: insertError } = await supabase
      .from('documents')
      .insert({
        owner_id: user.id,
        content: { type: 'doc', content: [{ type: 'paragraph' }] },
      })
      .select('id')
      .single();
    if (insertError) throw insertError;
    await load();
    return data.id as string;
  }

  async function importDocument(
    title: string,
    content: DocumentRow['content']
  ): Promise<string> {
    if (!user) throw new Error('Not signed in');
    const { data, error: insertError } = await supabase
      .from('documents')
      .insert({ owner_id: user.id, title, content })
      .select('id')
      .single();
    if (insertError) throw insertError;
    await load();
    return data.id as string;
  }

  return {
    owned,
    shared,
    loading,
    error,
    createDocument,
    importDocument,
    reload: load,
  };
}

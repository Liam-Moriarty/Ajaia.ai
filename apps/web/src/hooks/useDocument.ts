import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { DocumentRow, TiptapDocument } from '../lib/types';

const SAVE_DEBOUNCE_MS = 1000;

export function useDocument(id: string) {
  const [document, setDocument] = useState<DocumentRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error: loadError }) => {
        if (cancelled) return;
        if (loadError) {
          setError(loadError.message);
        } else {
          setDocument(data as DocumentRow);
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  function save(partial: { title?: string; content?: TiptapDocument }) {
    setDocument((current) => (current ? { ...current, ...partial } : current));

    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      const { error: saveErr } = await supabase
        .from('documents')
        .update(partial)
        .eq('id', id);
      setSaveError(saveErr ? saveErr.message : null);
    }, SAVE_DEBOUNCE_MS);
  }

  useEffect(() => {
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, []);

  return { document, loading, error, saveError, save };
}

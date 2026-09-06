import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';

export function ShareDialog({
  documentId,
  onClose,
}: {
  documentId: string;
  onClose: () => void;
}) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile) {
        setError('No registered user found with that email.');
        return;
      }

      const { error: shareError } = await supabase
        .from('document_shares')
        .insert({ document_id: documentId, shared_with_id: profile.id });

      if (shareError) {
        if (shareError.code === '23505') {
          setError('This document is already shared with that user.');
        } else {
          setError(shareError.message);
        }
        return;
      }

      setSuccess(`Shared with ${email}.`);
      setEmail('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <h2>Share document</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Collaborator email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
          <div className="dialog-actions">
            <button type="submit" disabled={submitting}>
              Share
            </button>
            <button type="button" onClick={onClose}>
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

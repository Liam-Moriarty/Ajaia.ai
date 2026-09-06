import { useRef, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDocuments } from '../hooks/useDocuments';
import { DocumentCard } from '../components/DocumentCard';
import { ThemeToggle } from '../components/ThemeToggle';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  extractText,
  isSupportedImportFile,
  parseImport,
  SUPPORTED_IMPORT_EXTENSIONS,
} from '../lib/parseImport';
import type { DocumentRow } from '../lib/types';

export function DocumentListPage() {
  const { user, signOut } = useAuth();
  const {
    owned,
    shared,
    loading,
    error,
    createDocument,
    importDocument,
    deleteDocument,
  } = useDocuments();
  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DocumentRow | null>(null);

  async function handleCreate() {
    const id = await createDocument();
    navigate(`/documents/${id}`);
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setImportError(null);
    if (!isSupportedImportFile(file.name)) {
      setImportError(
        `Unsupported file type. Allowed: ${SUPPORTED_IMPORT_EXTENSIONS.join(', ')}. Not allowed: any other format (e.g. .doc, .rtf, .odt, images).`
      );
      return;
    }

    try {
      const text = await extractText(file);
      const content = parseImport(file.name, text);
      const title = file.name.replace(/\.(txt|md|docx)$/i, '');
      const id = await importDocument(title, content);
      navigate(`/documents/${id}`);
    } catch {
      setImportError(
        'Could not read that file. Please check it is not corrupted and try again.'
      );
    }
  }

  return (
    <div className="document-list-page">
      <header>
        <div>
          <h1>Documents</h1>
          {user?.email && (
            <p className="signed-in-as">Signed in as {user.email}</p>
          )}
        </div>
        <div className="actions">
          <button onClick={handleCreate}>New document</button>
          <button onClick={() => fileInput.current?.click()}>
            Import file
          </button>
          <input
            ref={fileInput}
            type="file"
            accept={SUPPORTED_IMPORT_EXTENSIONS.join(',')}
            hidden
            onChange={handleFileChange}
          />
          <button onClick={signOut}>Sign out</button>
          <ThemeToggle />
        </div>
      </header>

      <p className="hint">
        Allowed file types: {SUPPORTED_IMPORT_EXTENSIONS.join(', ')}. Other
        formats (e.g. .doc, .rtf, .odt, images) are not supported.
      </p>
      {importError && <p className="error">{importError}</p>}
      {error && <p className="error">{error}</p>}
      {loading && <p className="empty-state">Loading...</p>}

      <section>
        <h2>My documents</h2>
        {owned.length === 0 && !loading ? (
          <p className="empty-state">No documents yet.</p>
        ) : (
          <div className="document-list">
            {owned.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onDelete={() => setPendingDelete(doc)}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2>Shared with me</h2>
        {shared.length === 0 && !loading ? (
          <p className="empty-state">Nothing shared with you yet.</p>
        ) : (
          <div className="document-list">
            {shared.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        )}
      </section>

      {pendingDelete && (
        <ConfirmDialog
          title="Delete document"
          message={`Delete "${pendingDelete.title || 'Untitled'}"? This can't be undone.`}
          confirmLabel="Delete"
          danger
          onCancel={() => setPendingDelete(null)}
          onConfirm={async () => {
            await deleteDocument(pendingDelete.id);
            setPendingDelete(null);
          }}
        />
      )}
    </div>
  );
}

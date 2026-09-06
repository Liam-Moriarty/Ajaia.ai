import { useRef, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDocuments } from '../hooks/useDocuments';
import { DocumentCard } from '../components/DocumentCard';
import { isSupportedImportFile, parseImport } from '../lib/parseImport';

export function DocumentListPage() {
  const { signOut } = useAuth();
  const { owned, shared, loading, error, createDocument, importDocument } =
    useDocuments();
  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);

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
        'Unsupported file type. Only .txt and .md files can be imported.'
      );
      return;
    }

    const text = await file.text();
    const content = parseImport(file.name, text);
    const title = file.name.replace(/\.(txt|md)$/i, '');
    const id = await importDocument(title, content);
    navigate(`/documents/${id}`);
  }

  return (
    <div className="document-list-page">
      <header>
        <h1>Documents</h1>
        <div className="actions">
          <button onClick={handleCreate}>New document</button>
          <button onClick={() => fileInput.current?.click()}>
            Import file
          </button>
          <input
            ref={fileInput}
            type="file"
            accept=".txt,.md"
            hidden
            onChange={handleFileChange}
          />
          <button onClick={signOut}>Sign out</button>
        </div>
      </header>

      {importError && <p className="error">{importError}</p>}
      {error && <p className="error">{error}</p>}
      {loading && <p>Loading...</p>}

      <section>
        <h2>My documents</h2>
        {owned.length === 0 && !loading ? (
          <p>No documents yet.</p>
        ) : (
          <div className="document-grid">
            {owned.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2>Shared with me</h2>
        {shared.length === 0 && !loading ? (
          <p>Nothing shared with you yet.</p>
        ) : (
          <div className="document-grid">
            {shared.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

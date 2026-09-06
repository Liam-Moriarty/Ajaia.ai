import { useNavigate } from 'react-router-dom';
import type { DocumentRow } from '../lib/types';

export function DocumentCard({ document }: { document: DocumentRow }) {
  const navigate = useNavigate();

  return (
    <button
      className="document-card"
      onClick={() => navigate(`/documents/${document.id}`)}
    >
      <span className="document-card-title">{document.title}</span>
      <span className="document-card-meta">
        Updated {new Date(document.updated_at).toLocaleString()}
      </span>
    </button>
  );
}

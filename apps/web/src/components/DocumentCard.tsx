import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatUpdatedAt } from '../lib/formatUpdatedAt';
import type { DocumentRow } from '../lib/types';

export function DocumentCard({
  document,
  onDelete,
}: {
  document: DocumentRow;
  onDelete?: (id: string) => void;
}) {
  const navigate = useNavigate();

  function handleDelete(e: MouseEvent) {
    e.stopPropagation();
    onDelete?.(document.id);
  }

  return (
    <div
      className="document-row"
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/documents/${document.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') navigate(`/documents/${document.id}`);
      }}
    >
      <span className="document-row-title">{document.title || 'Untitled'}</span>
      <span className="document-row-side">
        <span className="document-row-meta">
          {formatUpdatedAt(document.updated_at)}
        </span>
        {onDelete && (
          <button
            type="button"
            className="document-row-delete"
            aria-label={`Delete ${document.title || 'Untitled'}`}
            title="Delete"
            onClick={handleDelete}
          >
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
              <path
                fill="currentColor"
                d="M9 3a1 1 0 0 0-1 1v1H4.5a1 1 0 1 0 0 2H5v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7h.5a1 1 0 1 0 0-2H16V4a1 1 0 0 0-1-1H9Zm1 2h4V4h-4v1ZM7 7h10v12H7V7Zm3 2a1 1 0 0 0-1 1v7a1 1 0 1 0 2 0v-7a1 1 0 0 0-1-1Zm4 0a1 1 0 0 0-1 1v7a1 1 0 1 0 2 0v-7a1 1 0 0 0-1-1Z"
              />
            </svg>
          </button>
        )}
      </span>
    </div>
  );
}

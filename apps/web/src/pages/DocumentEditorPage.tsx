import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { useDocument } from '../hooks/useDocument';
import { EditorToolbar } from '../components/EditorToolbar';
import { ShareDialog } from '../components/ShareDialog';
import { ThemeToggle } from '../components/ThemeToggle';

export function DocumentEditorPage() {
  const { id } = useParams<{ id: string }>();
  const { document, loading, error, saveError, save } = useDocument(id!);
  const [title, setTitle] = useState('');
  const [shareOpen, setShareOpen] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: document?.content,
    onUpdate: ({ editor }) => {
      save({ content: editor.getJSON() });
    },
  });

  useEffect(() => {
    if (document) setTitle(document.title);
  }, [document?.id]);

  useEffect(() => {
    if (editor && document) {
      editor.commands.setContent(document.content);
    }
  }, [editor, document?.id]);

  if (loading) return <p className="page-loading">Loading...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!document || !editor) return null;

  return (
    <div className="document-editor-page">
      <Link to="/" className="back-link">
        ← Documents
      </Link>
      <header>
        <input
          className="title-input"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            save({ title: e.target.value });
          }}
        />
        <div className="actions">
          <button onClick={() => setShareOpen(true)}>Share</button>
          <ThemeToggle />
        </div>
      </header>

      {saveError && <p className="error">Failed to save: {saveError}</p>}

      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} className="editor-content" />

      {shareOpen && (
        <ShareDialog
          documentId={document.id}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  );
}

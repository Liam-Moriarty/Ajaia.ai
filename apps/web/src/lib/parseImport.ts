import mammoth from 'mammoth';
import type { TiptapDocument } from './types';

export const SUPPORTED_IMPORT_EXTENSIONS = ['.txt', '.md', '.docx'] as const;

export function isSupportedImportFile(filename: string): boolean {
  const lower = filename.toLowerCase();
  return SUPPORTED_IMPORT_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export async function extractText(file: File): Promise<string> {
  const lower = file.name.toLowerCase();

  if (lower.endsWith('.docx')) {
    return extractDocxText(file);
  }

  return file.text();
}

async function extractDocxText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const { value } = await mammoth.extractRawText({ arrayBuffer: buffer });
  return value;
}

export function parseImport(filename: string, text: string): TiptapDocument {
  if (!isSupportedImportFile(filename)) {
    throw new Error(
      `Unsupported file type. Only ${SUPPORTED_IMPORT_EXTENSIONS.join(', ')} files can be imported.`
    );
  }

  return filename.toLowerCase().endsWith('.md')
    ? parseMarkdown(text)
    : parsePlainText(text);
}

function parsePlainText(text: string): TiptapDocument {
  const content = text
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => ({
      type: 'paragraph',
      content: [{ type: 'text', text: line }],
    }));

  return { type: 'doc', content };
}

const HEADING_RE = /^(#{1,6})\s+(.+)$/;
const BULLET_RE = /^-\s+(.+)$/;
const ORDERED_RE = /^(\d+)\.\s+(.+)$/;

function parseMarkdown(text: string): TiptapDocument {
  const lines = text.split('\n');
  const content: TiptapDocument['content'] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') {
      i++;
      continue;
    }

    const headingMatch = HEADING_RE.exec(line);
    if (headingMatch) {
      content!.push({
        type: 'heading',
        attrs: { level: headingMatch[1].length },
        content: parseInline(headingMatch[2]),
      });
      i++;
      continue;
    }

    if (BULLET_RE.test(line)) {
      const items: string[] = [];
      while (i < lines.length) {
        const match = BULLET_RE.exec(lines[i]);
        if (!match) break;
        items.push(match[1]);
        i++;
      }
      content!.push({
        type: 'bulletList',
        content: items.map((item) => listItem(item)),
      });
      continue;
    }

    const orderedMatch = ORDERED_RE.exec(line);
    if (orderedMatch) {
      const start = parseInt(orderedMatch[1], 10);
      const items: string[] = [];
      while (i < lines.length) {
        const match = ORDERED_RE.exec(lines[i]);
        if (!match) break;
        items.push(match[2]);
        i++;
      }
      content!.push({
        type: 'orderedList',
        attrs: { start },
        content: items.map((item) => listItem(item)),
      });
      continue;
    }

    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !HEADING_RE.test(lines[i]) &&
      !BULLET_RE.test(lines[i]) &&
      !ORDERED_RE.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    content!.push({
      type: 'paragraph',
      content: parseInline(paraLines.join(' ')),
    });
  }

  return { type: 'doc', content };
}

function listItem(text: string) {
  return {
    type: 'listItem',
    content: [{ type: 'paragraph', content: parseInline(text) }],
  };
}

const INLINE_RE = /\*\*(.+?)\*\*|\*(.+?)\*/g;

function parseInline(text: string) {
  const nodes: Array<{
    type: 'text';
    text: string;
    marks?: Array<{ type: string }>;
  }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  INLINE_RE.lastIndex = 0;
  while ((match = INLINE_RE.exec(text))) {
    if (match.index > lastIndex) {
      nodes.push({ type: 'text', text: text.slice(lastIndex, match.index) });
    }
    if (match[1] !== undefined) {
      nodes.push({ type: 'text', text: match[1], marks: [{ type: 'bold' }] });
    } else {
      nodes.push({ type: 'text', text: match[2], marks: [{ type: 'italic' }] });
    }
    lastIndex = INLINE_RE.lastIndex;
  }
  if (lastIndex < text.length) {
    nodes.push({ type: 'text', text: text.slice(lastIndex) });
  }

  return nodes;
}

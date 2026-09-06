import { describe, it, expect } from 'vitest';
import { parseImport, isSupportedImportFile } from './parseImport';

describe('isSupportedImportFile', () => {
  it('accepts .txt, .md, .pdf, and .docx filenames', () => {
    expect(isSupportedImportFile('notes.txt')).toBe(true);
    expect(isSupportedImportFile('README.md')).toBe(true);
    expect(isSupportedImportFile('NOTES.TXT')).toBe(true);
    expect(isSupportedImportFile('report.pdf')).toBe(true);
    expect(isSupportedImportFile('resume.docx')).toBe(true);
  });

  it('rejects other extensions', () => {
    expect(isSupportedImportFile('resume.doc')).toBe(false);
    expect(isSupportedImportFile('image.png')).toBe(false);
    expect(isSupportedImportFile('noextension')).toBe(false);
  });
});

describe('parseImport - unsupported files', () => {
  it('throws a descriptive error for an unsupported extension', () => {
    expect(() => parseImport('archive.zip', 'anything')).toThrow(
      /Unsupported file type/
    );
  });
});

describe('parseImport - plain text', () => {
  it('wraps each non-blank line as its own paragraph', () => {
    const doc = parseImport('notes.txt', 'first line\nsecond line');

    expect(doc).toEqual({
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'first line' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'second line' }] },
      ],
    });
  });

  it('skips blank lines', () => {
    const doc = parseImport('notes.txt', 'one\n\ntwo');

    expect(doc.content).toHaveLength(2);
  });
});

describe('parseImport - markdown', () => {
  it('maps # headings to heading nodes with the right level', () => {
    const doc = parseImport('doc.md', '# Title\n## Subtitle');

    expect(doc.content).toEqual([
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'Title' }],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Subtitle' }],
      },
    ]);
  });

  it('maps **bold** and *italic* to marks within a paragraph', () => {
    const doc = parseImport('doc.md', 'this is **bold** and *italic* text');

    expect(doc.content).toEqual([
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'this is ' },
          { type: 'text', text: 'bold', marks: [{ type: 'bold' }] },
          { type: 'text', text: ' and ' },
          { type: 'text', text: 'italic', marks: [{ type: 'italic' }] },
          { type: 'text', text: ' text' },
        ],
      },
    ]);
  });

  it('maps a run of "- " lines to a bulleted list', () => {
    const doc = parseImport('doc.md', '- one\n- two\n- three');

    expect(doc.content).toEqual([
      {
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'one' }] },
            ],
          },
          {
            type: 'listItem',
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'two' }] },
            ],
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'three' }],
              },
            ],
          },
        ],
      },
    ]);
  });

  it('maps a run of "1. " lines to a numbered list', () => {
    const doc = parseImport('doc.md', '1. one\n2. two');

    expect(doc.content).toEqual([
      {
        type: 'orderedList',
        attrs: { start: 1 },
        content: [
          {
            type: 'listItem',
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'one' }] },
            ],
          },
          {
            type: 'listItem',
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'two' }] },
            ],
          },
        ],
      },
    ]);
  });

  it('preserves a non-1 starting number for numbered lists', () => {
    const doc = parseImport('doc.md', '5. five\n6. six');

    expect(doc.content).toEqual([
      {
        type: 'orderedList',
        attrs: { start: 5 },
        content: [
          {
            type: 'listItem',
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'five' }] },
            ],
          },
          {
            type: 'listItem',
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'six' }] },
            ],
          },
        ],
      },
    ]);
  });

  it('handles a mix of headings, lists, and paragraphs in one document', () => {
    const doc = parseImport(
      'doc.md',
      '# Title\n\nSome **bold** intro.\n\n- a\n- b\n\nClosing paragraph.'
    );

    expect(doc.content?.map((node) => node.type)).toEqual([
      'heading',
      'paragraph',
      'bulletList',
      'paragraph',
    ]);
  });
});

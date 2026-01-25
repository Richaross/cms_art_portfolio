import { render, screen } from '@testing-library/react';
import RichTextEditor from '@/components/cms/RichTextEditor';

jest.mock('@tiptap/starter-kit', () => ({
  __esModule: true,
  default: {
    configure: jest.fn().mockReturnThis(),
  },
}));

jest.mock('@tiptap/extension-link', () => ({
  __esModule: true,
  default: {
    configure: jest.fn().mockReturnThis(),
  },
}));

jest.mock('@tiptap/react', () => ({
  EditorContent: ({ editor }: { editor: unknown }) => (
    <div data-testid="tiptap-editor">{(editor as { getText: () => string })?.getText()}</div>
  ),
  useEditor: () => ({
    getText: () => 'Hello World',
    getHTML: () => '<p>Hello World</p>',
    isActive: jest.fn().mockReturnValue(false),
    can: () => ({
      chain: () => ({
        focus: () => ({
          toggleBold: () => ({ run: jest.fn().mockReturnValue(true) }),
          toggleItalic: () => ({ run: jest.fn().mockReturnValue(true) }),
          toggleBulletList: () => ({ run: jest.fn().mockReturnValue(true) }),
          toggleOrderedList: () => ({ run: jest.fn().mockReturnValue(true) }),
          setLink: () => ({ run: jest.fn().mockReturnValue(true) }),
          unsetLink: () => ({ run: jest.fn().mockReturnValue(true) }),
        }),
      }),
    }),
    commands: {
      setContent: jest.fn(),
    },
    chain: () => ({
      focus: () => ({
        toggleBold: () => ({ run: jest.fn() }),
        toggleItalic: () => ({ run: jest.fn() }),
        toggleBulletList: () => ({ run: jest.fn() }),
        toggleOrderedList: () => ({ run: jest.fn() }),
        setLink: () => ({ run: jest.fn() }),
        unsetLink: () => ({ run: jest.fn() }),
      }),
    }),
  }),
}));

describe('RichTextEditor', () => {
  it('renders the editor container', () => {
    const onChange = jest.fn();
    render(<RichTextEditor content="Initial content" onChange={onChange} />);
    expect(screen.getByTestId('tiptap-editor')).toBeInTheDocument();
  });

  it('displays toolbar buttons', () => {
    render(<RichTextEditor content="" onChange={jest.fn()} />);
    expect(screen.getByTitle(/Bold/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Italic/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Link/i)).toBeInTheDocument();
  });
});

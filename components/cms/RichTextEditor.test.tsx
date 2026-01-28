import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RichTextEditor from '@/components/cms/RichTextEditor';

const mockRun = jest.fn();
const mockToggleBold = jest.fn(() => ({ run: mockRun }));
const mockToggleItalic = jest.fn(() => ({ run: mockRun }));
const mockToggleBulletList = jest.fn(() => ({ run: mockRun }));
const mockToggleOrderedList = jest.fn(() => ({ run: mockRun }));
const mockSetLink = jest.fn(() => ({ run: mockRun }));
const mockUnsetLink = jest.fn(() => ({ run: mockRun }));
const mockIsActive = jest.fn();

const mockChain = {
  focus: jest.fn(() => ({
    toggleBold: mockToggleBold,
    toggleItalic: mockToggleItalic,
    toggleBulletList: mockToggleBulletList,
    toggleOrderedList: mockToggleOrderedList,
    setLink: mockSetLink,
    unsetLink: mockUnsetLink,
  })),
};

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
    isActive: mockIsActive,
    can: () => ({
      chain: () => mockChain,
    }),
    commands: {
      setContent: jest.fn(),
    },
    chain: () => mockChain,
  }),
}));

describe('RichTextEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsActive.mockReturnValue(false);
  });

  describe('Rendering', () => {
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

  describe('Toolbar Interactions', () => {
    it('executes bold command when Bold button is clicked', async () => {
      const user = userEvent.setup();
      render(<RichTextEditor content="" onChange={jest.fn()} />);

      const boldBtn = screen.getByTitle(/Bold/i);
      await user.click(boldBtn);

      expect(mockChain.focus).toHaveBeenCalled();
      expect(mockToggleBold).toHaveBeenCalled();
      expect(mockRun).toHaveBeenCalled();
    });

    it('executes italic command when Italic button is clicked', async () => {
      const user = userEvent.setup();
      render(<RichTextEditor content="" onChange={jest.fn()} />);

      const italicBtn = screen.getByTitle(/Italic/i);
      await user.click(italicBtn);

      expect(mockChain.focus).toHaveBeenCalled();
      expect(mockToggleItalic).toHaveBeenCalled();
      expect(mockRun).toHaveBeenCalled();
    });

    it('executes bullet list command when Bullet List button is clicked', async () => {
      const user = userEvent.setup();
      render(<RichTextEditor content="" onChange={jest.fn()} />);

      const bulletBtn = screen.getByTitle(/Bullet List/i);
      await user.click(bulletBtn);

      expect(mockChain.focus).toHaveBeenCalled();
      expect(mockToggleBulletList).toHaveBeenCalled();
      expect(mockRun).toHaveBeenCalled();
    });

    it('executes ordered list command when Ordered List button is clicked', async () => {
      const user = userEvent.setup();
      render(<RichTextEditor content="" onChange={jest.fn()} />);

      const orderedBtn = screen.getByTitle(/Ordered List/i);
      await user.click(orderedBtn);

      expect(mockChain.focus).toHaveBeenCalled();
      expect(mockToggleOrderedList).toHaveBeenCalled();
      expect(mockRun).toHaveBeenCalled();
    });

    it('highlights active formatting buttons', () => {
      mockIsActive.mockImplementation((format: string) => format === 'bold');

      render(<RichTextEditor content="" onChange={jest.fn()} />);

      const boldBtn = screen.getByTitle(/Bold/i);
      expect(boldBtn).toHaveClass('is-active');
    });
  });
});

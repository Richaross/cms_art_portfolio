import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SectionEditor from '../SectionEditor';
import {
  saveSection,
  deleteSection,
  deleteSectionItemsAction,
  updateSectionItemsAction,
} from '../../../app/actions/portfolio';
import { PortfolioSection, SectionItem } from '../../../app/domain/types';

// --- Mocks ---

// Mock Server Actions
jest.mock('../../../app/actions/portfolio', () => ({
  saveSection: jest.fn(),
  deleteSection: jest.fn(),
  reorderItems: jest.fn(),
  deleteSectionItemsAction: jest.fn(),
  updateSectionItemsAction: jest.fn(),
}));

// Mock Child Components
jest.mock('../ImageUploader', () => {
  return function MockImageUploader({
    value,
    onChange,
    label,
  }: {
    value: string;
    onChange: (val: string) => void;
    label: string;
  }) {
    return (
      <div data-testid="image-uploader">
        <label>{label}</label>
        <input data-testid="image-input" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    );
  };
});

jest.mock('../ItemEditor', () => {
  return function MockItemEditor({ onCancel }: { onCancel: () => void }) {
    return (
      <div data-testid="item-editor">
        Mock Item Editor
        <button onClick={onCancel}>Cancel Item</button>
      </div>
    );
  };
});

jest.mock('../RichTextEditor', () => {
  return function MockRichTextEditor({
    content,
    onChange,
  }: {
    content: string;
    onChange: (val: string) => void;
  }) {
    return (
      <div data-testid="rich-text-editor">
        <textarea
          data-testid="rich-text-input"
          value={content}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  };
});

jest.mock('../SortableSectionItemCard', () => ({
  SortableSectionItemCard: function MockSortableSectionItemCard({
    item,
    selected,
    onSelect,
    onEdit,
  }: {
    item: SectionItem;
    selected: boolean;
    onSelect: () => void;
    onEdit: (item: SectionItem) => void;
  }) {
    return (
      <div data-testid={`item-card-${item.id}`}>
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          data-testid={`checkbox-${item.id}`}
        />
        <span>{item.title}</span>
        <button onClick={() => onEdit(item)}>Edit</button>
      </div>
    );
  },
}));

// Mock dnd-kit components
jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useSensor: jest.fn(),
  useSensors: jest.fn(() => []),
  PointerSensor: jest.fn(),
  KeyboardSensor: jest.fn(),
  closestCenter: jest.fn(),
}));

jest.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  rectSortingStrategy: jest.fn(),
  sortableKeyboardCoordinates: jest.fn(),
  arrayMove: (arr: unknown[], oldIndex: number, newIndex: number) => {
    const newArr = [...arr];
    const [removed] = newArr.splice(oldIndex, 1);
    newArr.splice(newIndex, 0, removed);
    return newArr;
  },
}));

// Mock window.alert and window.confirm
const mockAlert = jest.fn();
const mockConfirm = jest.fn();
window.alert = mockAlert;
window.confirm = mockConfirm;

// --- Test Data ---

const mockItems: SectionItem[] = [
  {
    id: 'item1',
    sectionId: '123',
    title: 'Item 1',
    description: 'Description 1',
    imageUrl: 'img1.jpg',
    price: 100,
    stockQty: 5,
    stripeLink: null,
    isSaleActive: false,
    orderRank: 0,
    isPublished: true,
    publishedAt: null,
  },
  {
    id: 'item2',
    sectionId: '123',
    title: 'Item 2',
    description: 'Description 2',
    imageUrl: 'img2.jpg',
    price: 200,
    stockQty: 3,
    stripeLink: null,
    isSaleActive: true,
    orderRank: 1,
    isPublished: true,
    publishedAt: null,
  },
];

const mockSection: PortfolioSection = {
  id: '123',
  title: 'Test Collection',
  description: 'A test description',
  imgUrl: 'test.jpg',
  orderRank: 1,
  items: mockItems,
  isPublished: true,
  publishedAt: null,
};

describe('SectionEditor Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders "New Collection" mode when section prop is null', () => {
      render(<SectionEditor section={null} onSave={jest.fn()} onCancel={jest.fn()} />);

      expect(screen.getByText('New Collection')).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /collection title/i })).toHaveValue('');
    });

    it('renders "Edit Collection" mode with existing data', () => {
      render(<SectionEditor section={mockSection} onSave={jest.fn()} onCancel={jest.fn()} />);

      expect(screen.getByText('Edit Collection')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Collection')).toBeInTheDocument();
      expect(screen.getByDisplayValue('A test description')).toBeInTheDocument();
    });
  });

  describe('Save and Delete', () => {
    it('calls saveSection with correct data on form submission', async () => {
      const user = userEvent.setup();
      const onSaveMock = jest.fn();
      (saveSection as jest.Mock).mockResolvedValue({ success: true });

      render(<SectionEditor section={null} onSave={onSaveMock} onCancel={jest.fn()} />);

      // Fill out form
      await user.type(
        screen.getByRole('textbox', { name: /collection title/i }),
        'New Masterpiece'
      );
      await user.type(screen.getByTestId('rich-text-input'), 'My best work');
      await user.type(screen.getByTestId('image-input'), 'new-image.jpg');

      // Submit
      await user.click(screen.getByRole('button', { name: /save collection/i }));

      await waitFor(() => {
        expect(saveSection).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'New Masterpiece',
            description: 'My best work',
            imgUrl: 'new-image.jpg',
          })
        );
        expect(onSaveMock).toHaveBeenCalledWith(true);
      });
    });

    it('handles save error gracefully', async () => {
      const user = userEvent.setup();
      (saveSection as jest.Mock).mockResolvedValue({ success: false, error: 'Database error' });

      render(<SectionEditor section={null} onSave={jest.fn()} onCancel={jest.fn()} />);

      await user.type(screen.getByRole('textbox', { name: /collection title/i }), 'Fail Test');
      await user.click(screen.getByRole('button', { name: /save collection/i }));

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(expect.stringContaining('Error saving collection'));
      });
    });

    it('requests confirmation before deleting', async () => {
      const user = userEvent.setup();
      render(<SectionEditor section={mockSection} onSave={jest.fn()} onCancel={jest.fn()} />);

      // Mock confirmation cancel
      mockConfirm.mockReturnValue(false);
      const deleteBtn = screen.getByText('Delete Collection');
      await user.click(deleteBtn);

      expect(mockConfirm).toHaveBeenCalled();
      expect(deleteSection).not.toHaveBeenCalled();

      // Mock confirmation confirm
      mockConfirm.mockReturnValue(true);
      (deleteSection as jest.Mock).mockResolvedValue({ success: true });

      await user.click(deleteBtn);

      await waitFor(() => {
        expect(deleteSection).toHaveBeenCalledWith('123', 'test.jpg');
      });
    });
  });

  describe('Tab Navigation', () => {
    it('renders Items tab only when section exists', () => {
      const { rerender } = render(
        <SectionEditor section={null} onSave={jest.fn()} onCancel={jest.fn()} />
      );
      expect(screen.queryByText('Metadata')).not.toBeInTheDocument();

      rerender(<SectionEditor section={mockSection} onSave={jest.fn()} onCancel={jest.fn()} />);
      expect(screen.getByText('Metadata')).toBeInTheDocument();
      expect(screen.getByText(/Collection Items/)).toBeInTheDocument();
    });

    it('switches to Items tab and displays content', async () => {
      const user = userEvent.setup();
      render(<SectionEditor section={mockSection} onSave={jest.fn()} onCancel={jest.fn()} />);

      await user.click(screen.getByText(/Collection Items/));

      expect(screen.getByText(/Quick Sort:/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add item/i })).toBeInTheDocument();
    });
  });

  describe('Bulk Actions', () => {
    it('allows selecting individual items', async () => {
      const user = userEvent.setup();
      render(<SectionEditor section={mockSection} onSave={jest.fn()} onCancel={jest.fn()} />);

      // Switch to Items tab
      await user.click(screen.getByText(/Collection Items/));

      // Select first item
      const checkbox1 = screen.getByTestId('checkbox-item1');
      await user.click(checkbox1);

      expect(checkbox1).toBeChecked();
      expect(screen.getByText('1 Selected')).toBeInTheDocument();
    });

    it('allows selecting all items', async () => {
      const user = userEvent.setup();
      render(<SectionEditor section={mockSection} onSave={jest.fn()} onCancel={jest.fn()} />);

      await user.click(screen.getByText(/Collection Items/));

      const selectAllBtn = screen.getByTitle('Select All');
      await user.click(selectAllBtn);

      expect(screen.getByText('2 Selected')).toBeInTheDocument();
    });

    it('performs bulk delete when confirmed', async () => {
      const user = userEvent.setup();
      const onSaveMock = jest.fn();
      (deleteSectionItemsAction as jest.Mock).mockResolvedValue({ success: true });
      mockConfirm.mockReturnValue(true);

      render(<SectionEditor section={mockSection} onSave={onSaveMock} onCancel={jest.fn()} />);

      await user.click(screen.getByText(/Collection Items/));

      // Select items
      await user.click(screen.getByTestId('checkbox-item1'));
      await user.click(screen.getByTestId('checkbox-item2'));

      // Click Delete
      const deleteBtn = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteBtn);

      await waitFor(() => {
        expect(mockConfirm).toHaveBeenCalled();
        expect(deleteSectionItemsAction).toHaveBeenCalledWith([
          { id: 'item1', imgUrl: 'img1.jpg' },
          { id: 'item2', imgUrl: 'img2.jpg' },
        ]);
        expect(onSaveMock).toHaveBeenCalledWith(false);
      });
    });

    it('performs bulk price update', async () => {
      const user = userEvent.setup();
      const onSaveMock = jest.fn();
      (updateSectionItemsAction as jest.Mock).mockResolvedValue({ success: true });

      render(<SectionEditor section={mockSection} onSave={onSaveMock} onCancel={jest.fn()} />);

      await user.click(screen.getByText(/Collection Items/));

      // Select items
      await user.click(screen.getByTestId('checkbox-item1'));

      // Click Update button
      const updateBtn = screen.getByRole('button', { name: /update/i });
      await user.click(updateBtn);

      // Fill in new price
      const priceInput = screen.getByPlaceholderText(/Leave empty to keep current price/i);
      await user.type(priceInput, '150');

      // Click Apply
      await user.click(screen.getByRole('button', { name: /apply changes/i }));

      await waitFor(() => {
        expect(updateSectionItemsAction).toHaveBeenCalledWith(['item1'], { price: 150 });
        expect(onSaveMock).toHaveBeenCalledWith(false);
      });
    });

    it('performs bulk sale status update', async () => {
      const user = userEvent.setup();
      const onSaveMock = jest.fn();
      (updateSectionItemsAction as jest.Mock).mockResolvedValue({ success: true });

      render(<SectionEditor section={mockSection} onSave={onSaveMock} onCancel={jest.fn()} />);

      await user.click(screen.getByText(/Collection Items/));

      // Select items
      await user.click(screen.getByTestId('checkbox-item1'));

      // Click Update button
      await user.click(screen.getByRole('button', { name: /update/i }));

      // Set sale status to "On Sale"
      await user.click(screen.getByRole('button', { name: /on sale/i }));

      // Click Apply
      await user.click(screen.getByRole('button', { name: /apply changes/i }));

      await waitFor(() => {
        expect(updateSectionItemsAction).toHaveBeenCalledWith(['item1'], { isSaleActive: true });
        expect(onSaveMock).toHaveBeenCalledWith(false);
      });
    });
  });
});

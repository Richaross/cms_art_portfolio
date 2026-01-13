import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SectionEditor from '../SectionEditor';
import { saveSection, deleteSection } from '../../../app/actions/portfolio';
import { PortfolioSection } from '../../../app/domain/types';

// --- Mocks ---

// Mock Server Actions
jest.mock('../../../app/actions/portfolio', () => ({
    saveSection: jest.fn(),
    deleteSection: jest.fn(),
}));

// Mock Child Components
jest.mock('../ImageUploader', () => {
    return function MockImageUploader({ value, onChange, label }: any) {
        return (
            <div data-testid="image-uploader">
                <label>{label}</label>
                <input
                    data-testid="image-input"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        );
    };
});

jest.mock('../ItemEditor', () => {
    return function MockItemEditor({ onCancel }: any) {
        return (
            <div data-testid="item-editor">
                Mock Item Editor
                <button onClick={onCancel}>Cancel Item</button>
            </div>
        );
    };
});

// Mock window.alert and window.confirm
const mockAlert = jest.fn();
const mockConfirm = jest.fn();
window.alert = mockAlert;
window.confirm = mockConfirm;

// --- Test Data ---

const mockSection: PortfolioSection = {
    id: '123',
    title: 'Test Collection',
    description: 'A test description',
    imgUrl: 'test.jpg',
    orderRank: 1,
    items: [],
};

describe('SectionEditor Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

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

    it('calls saveSection with correct data on form submission', async () => {
        const onSaveMock = jest.fn();
        (saveSection as jest.Mock).mockResolvedValue({ success: true });

        render(<SectionEditor section={null} onSave={onSaveMock} onCancel={jest.fn()} />);

        // Fill out form
        fireEvent.change(screen.getByRole('textbox', { name: /collection title/i }), {
            target: { value: 'New Masterpiece' }
        });
        fireEvent.change(screen.getByRole('textbox', { name: /description/i }), {
            target: { value: 'My best work' }
        });

        // Simulate Image Upload via mock
        fireEvent.change(screen.getByTestId('image-input'), {
            target: { value: 'new-image.jpg' }
        });

        // Submit
        fireEvent.click(screen.getByRole('button', { name: /save collection/i }));

        await waitFor(() => {
            expect(saveSection).toHaveBeenCalledWith(expect.objectContaining({
                title: 'New Masterpiece',
                description: 'My best work',
                imgUrl: 'new-image.jpg'
            }));
            expect(onSaveMock).toHaveBeenCalled();
        });
    });

    it('handles save error gracefully', async () => {
        (saveSection as jest.Mock).mockResolvedValue({ success: false, error: 'Database error' });

        render(<SectionEditor section={null} onSave={jest.fn()} onCancel={jest.fn()} />);

        // Fill minimum required title (assuming 'required' attribute on input)
        fireEvent.change(screen.getByRole('textbox', { name: /collection title/i }), { target: { value: 'Fail Test' } });

        fireEvent.click(screen.getByRole('button', { name: /save collection/i }));

        await waitFor(() => {
            expect(mockAlert).toHaveBeenCalledWith(expect.stringContaining('Error saving collection'));
        });
    });

    it('requests confirmation before deleting', async () => {
        render(<SectionEditor section={mockSection} onSave={jest.fn()} onCancel={jest.fn()} />);

        // Mock confirmation cancel
        mockConfirm.mockReturnValue(false);
        const deleteBtn = screen.getByText('Delete Collection');
        fireEvent.click(deleteBtn);

        expect(mockConfirm).toHaveBeenCalled();
        expect(deleteSection).not.toHaveBeenCalled();

        // Mock confirmation confirm
        mockConfirm.mockReturnValue(true);
        (deleteSection as jest.Mock).mockResolvedValue({ success: true });

        fireEvent.click(deleteBtn);

        await waitFor(() => {
            expect(deleteSection).toHaveBeenCalledWith('123', 'test.jpg');
        });
    });

    it('renders Items tab only when section exists', () => {
        // New Collection -> No Tabs
        const { rerender } = render(<SectionEditor section={null} onSave={jest.fn()} onCancel={jest.fn()} />);
        expect(screen.queryByText('Metadata')).not.toBeInTheDocument();

        // Existing Collection -> Has Tabs
        rerender(<SectionEditor section={mockSection} onSave={jest.fn()} onCancel={jest.fn()} />);
        expect(screen.getByText('Metadata')).toBeInTheDocument();
        expect(screen.getByText(/Collection Items/)).toBeInTheDocument();
    });

    it('switches to Items tab and displays content', () => {
        render(<SectionEditor section={mockSection} onSave={jest.fn()} onCancel={jest.fn()} />);

        fireEvent.click(screen.getByText(/Collection Items/));

        expect(screen.getByText('Manage individual artworks/products in this collection.')).toBeInTheDocument();
    });
});

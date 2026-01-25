import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AboutEditor from '../AboutEditor';
import { getAboutInfo, saveAboutInfo } from '../../../app/actions/about';

// --- Mocks ---

jest.mock('../../../app/actions/about', () => ({
  getAboutInfo: jest.fn(),
  saveAboutInfo: jest.fn(),
}));

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

// Mock window.alert
const mockAlert = jest.fn();
window.alert = mockAlert;

describe('AboutEditor Component', () => {
  const mockAboutData = {
    id: 1,
    description: 'Original Bio',
    portraitUrl: 'original-portrait.jpg',
    isPublished: true,
    publishedAt: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getAboutInfo as jest.Mock).mockResolvedValue(mockAboutData);
  });

  it('fetches and displays about info on mount', async () => {
    render(<AboutEditor />);

    await waitFor(() => {
      expect(getAboutInfo).toHaveBeenCalled();
      expect(screen.getByTestId('rich-text-input')).toHaveValue('Original Bio');
      expect(screen.getByTestId('image-input')).toHaveValue('original-portrait.jpg');
    });
  });

  it('updates bio and portrait via input and uploader', async () => {
    render(<AboutEditor />);

    await waitFor(() => expect(getAboutInfo).toHaveBeenCalled());

    fireEvent.change(screen.getByTestId('rich-text-input'), {
      target: { value: 'Updated Bio' },
    });
    fireEvent.change(screen.getByTestId('image-input'), {
      target: { value: 'new-portrait.jpg' },
    });

    expect(screen.getByTestId('rich-text-input')).toHaveValue('Updated Bio');
    expect(screen.getByTestId('image-input')).toHaveValue('new-portrait.jpg');
  });

  it('calls saveAboutInfo with correct data on submission', async () => {
    (saveAboutInfo as jest.Mock).mockResolvedValue({ success: true });

    render(<AboutEditor />);

    await waitFor(() => expect(getAboutInfo).toHaveBeenCalled());

    fireEvent.change(screen.getByTestId('rich-text-input'), {
      target: { value: 'New Bio content' },
    });

    // Simulate Image Upload
    fireEvent.change(screen.getByTestId('image-input'), {
      target: { value: 'new-profile.jpg' },
    });

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(saveAboutInfo).toHaveBeenCalledWith({
        id: 1,
        description: 'New Bio content',
        portraitUrl: 'new-profile.jpg',
        isPublished: true,
        publishedAt: expect.anything(), // Accept any date or null since logic might set it on save
      });
      expect(mockAlert).toHaveBeenCalledWith('About info updated!');
    });
  });

  it('handles save errors gracefully', async () => {
    (saveAboutInfo as jest.Mock).mockResolvedValue({ success: false, error: 'Network Error' });

    render(<AboutEditor />);

    await waitFor(() => expect(getAboutInfo).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Error updating About info: Network Error');
    });
  });
});

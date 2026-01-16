import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HeroEditor from '../HeroEditor';
import { HeroService } from '../../../app/lib/services/heroService';
import { HeroSettings } from '../../../app/domain/types';

// --- Mocks ---

jest.mock('../../../lib/supabase/client', () => ({
  createClient: jest.fn(() => ({})),
}));

jest.mock('../../../app/lib/repositories/heroRepository');
jest.mock('../../../app/lib/services/heroService');

jest.mock('lucide-react', () => ({
  Instagram: () => <div data-testid="instagram-icon" />,
  Linkedin: () => <div data-testid="linkedin-icon" />,
  Facebook: () => <div data-testid="facebook-icon" />,
  MessageCircle: () => <div data-testid="whatsapp-icon" />,
  X: () => <div data-testid="x-icon" />,
  Loader2: () => <div data-testid="loader" />,
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

// Mock window.alert
const mockAlert = jest.fn();
window.alert = mockAlert;

describe('HeroEditor Component', () => {
  const mockHeroSettings: HeroSettings = {
    id: 1,
    title: 'Original Title',
    bgImageUrl: 'original-bg.jpg',
    dimIntensity: 0.4,
    socialLinks: {
      instagram: true,
      linkedin: false,
      facebook: false,
      whatsapp: false,
      x: false,
    },
    socialUrls: {
      instagram: 'https://instagram.com/test',
      linkedin: '',
      facebook: '',
      whatsapp: '',
      x: '',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (HeroService.prototype.getSettings as jest.Mock).mockResolvedValue(mockHeroSettings);
  });

  it('renders loading state then settings', async () => {
    render(<HeroEditor />);

    expect(screen.getByTestId('loader')).toBeDefined(); // Lucide Loader2 check

    await waitFor(() => {
      expect(screen.getByDisplayValue('Original Title')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://instagram.com/test')).toBeInTheDocument();
    });
  });

  it('updates title and dim intensity', async () => {
    render(<HeroEditor />);

    await waitFor(() => expect(screen.getByDisplayValue('Original Title')).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText(/e.g. Art Portfolio/i), {
      target: { value: 'New Hero Title' },
    });

    // Change Dim Intensity to High (0.7)
    fireEvent.click(screen.getByText('High'));

    expect(screen.getByDisplayValue('New Hero Title')).toBeInTheDocument();
    expect(screen.getByText('High')).toHaveClass('bg-white text-black');
  });

  it('toggles social links and updates URLs', async () => {
    render(<HeroEditor />);

    await waitFor(() => expect(screen.getByDisplayValue('Original Title')).toBeInTheDocument());

    // Toggle LinkedIn on
    const linkedinCheckbox = screen.getAllByRole('checkbox')[1]; // LinkedIn is second
    fireEvent.click(linkedinCheckbox);

    // Should now show LinkedIn URL input
    const linkedinInput = screen.getByPlaceholderText(/linkedin.com/i);
    fireEvent.change(linkedinInput, {
      target: { value: 'https://linkedin.com/in/test' },
    });

    expect(linkedinInput).toHaveValue('https://linkedin.com/in/test');
  });

  it('calls HeroService.updateSettings on save', async () => {
    (HeroService.prototype.updateSettings as jest.Mock).mockResolvedValue(undefined);

    render(<HeroEditor />);

    await waitFor(() => expect(screen.getByDisplayValue('Original Title')).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText(/e.g. Art Portfolio/i), {
      target: { value: 'Final Title' },
    });

    fireEvent.click(screen.getByRole('button', { name: /save hero settings/i }));

    await waitFor(() => {
      expect(HeroService.prototype.updateSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Final Title',
        })
      );
      expect(mockAlert).toHaveBeenCalledWith('Hero settings saved successfully!');
    });
  });

  it('handles save error', async () => {
    (HeroService.prototype.updateSettings as jest.Mock).mockRejectedValue(new Error('Save Failed'));

    render(<HeroEditor />);

    await waitFor(() => expect(screen.getByDisplayValue('Original Title')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /save hero settings/i }));

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Failed to save hero settings.');
    });
  });
});

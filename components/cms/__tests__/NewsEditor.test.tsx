import { render, screen, waitFor } from '@testing-library/react';
import NewsEditor from '../NewsEditor';
import { getNewsPosts } from '../../../app/actions/news';
import { NewsPost } from '../../../app/domain/types';

// Mock the server actions
jest.mock('../../../app/actions/news', () => ({
  getNewsPosts: jest.fn(),
  saveNewsPost: jest.fn(),
  deleteNewsPost: jest.fn(),
}));

// Mock the supabase client (it was being used in useEffect previously)
jest.mock('../../../lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
  })),
}));

describe('NewsEditor', () => {
  const mockPosts: NewsPost[] = [
    {
      id: '1',
      title: 'Test Post',
      summary: 'Summary here',
      category: 'General',
      content: 'Content',
      imageUrl: null,
      externalLink: null,
      isPublished: true,
      publishedAt: new Date('2024-01-01T12:00:00Z'),
      createdAt: new Date('2024-01-01T10:00:00Z'),
      updatedAt: new Date('2024-01-01T10:00:00Z'),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render mapped news posts without crashing', async () => {
    (getNewsPosts as jest.Mock).mockResolvedValue(mockPosts);

    render(<NewsEditor />);

    // Wait for the post title to appear
    await waitFor(() => {
      expect(screen.getByText('Test Post')).toBeInTheDocument();
    });

    // Check if the date is formatted correctly (MMM d, yyyy)
    // Jan 1, 2024
    expect(screen.getByText(/Jan 1, 2024/)).toBeInTheDocument();
    expect(screen.getByText(/Published/)).toBeInTheDocument();
  });

  it('should show empty state when no posts are returned', async () => {
    (getNewsPosts as jest.Mock).mockResolvedValue([]);

    render(<NewsEditor />);

    await waitFor(() => {
      expect(screen.getByText('No news posts yet.')).toBeInTheDocument();
    });
  });
});

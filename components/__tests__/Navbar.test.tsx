import { render, screen } from '@testing-library/react';
import Navbar from '../Navbar';

describe('Navbar Component', () => {
    it('renders the logo text', () => {
        render(<Navbar />);
        const logo = screen.getByText('ArtPortfolio');
        expect(logo).toBeInTheDocument();
    });

    it('renders navigation links', () => {
        render(<Navbar />);
        const links = ['About', 'Portfolio', 'News'];
        links.forEach(linkText => {
            const link = screen.getByText(linkText);
            expect(link).toBeInTheDocument();
        });
    });
});

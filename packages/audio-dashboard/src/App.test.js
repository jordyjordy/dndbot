import React, { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
    render(<App />);
    const headerElement = screen.getByText('D&D Music bot');
    expect(headerElement).toBeInTheDocument();
});

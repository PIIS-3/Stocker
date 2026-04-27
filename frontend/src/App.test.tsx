import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Component', () => {
  it('renders the home page with hero text', () => {
    render(<App />);
    
    // Check if the hero text is present
    const heroText = screen.getByText(/Optimiza almacenes y/i);
    expect(heroText).toBeInTheDocument();
  });

  it('renders the "Empezar ahora" button', () => {
    render(<App />);
    
    const button = screen.getByRole('button', { name: /Empezar ahora/i });
    expect(button).toBeInTheDocument();
  });
});

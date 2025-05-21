// app/components/Button.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Placeholder component for testing purposes
const Button = ({ children }: { children: React.ReactNode }) => (
  <button>{children}</button>
);

describe('Button', () => {
  it('renders a button', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders add candidate action', () => {
  render(<App />);
  const actionElement = screen.getByRole('button', { name: /anadir candidato/i });
  expect(actionElement).toBeInTheDocument();
});

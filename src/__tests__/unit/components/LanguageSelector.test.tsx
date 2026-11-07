import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import LanguageSelector from '../../../components/LanguageSelector';

describe('LanguageSelector Component', () => {
  it('should render all language options', () => {
    render(<LanguageSelector selected="en" onChange={vi.fn()} />);

    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Spanish')).toBeInTheDocument();
    expect(screen.getByText('Italian')).toBeInTheDocument();
  });

  it('should call onChange when language is selected', () => {
    const handleChange = vi.fn();

    render(<LanguageSelector selected="en" onChange={handleChange} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'es' } });

    expect(handleChange).toHaveBeenCalledWith('es');
  });
});

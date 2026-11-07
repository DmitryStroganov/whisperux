import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import HistoryTable from '../../../components/HistoryTable';

describe('HistoryTable Component', () => {
  it('should render nothing when results are empty', () => {
    const { container } = render(<HistoryTable results={[]} onClear={vi.fn()} />);
    expect(container.innerHTML).toBe('');
  });

  it('should display transcription results', () => {
    const results = [{
      filename: 'test.wav',
      text: 'Hello world',
      language: 'en',
      duration: 5,
      timestamp: new Date(),
    }];

    render(<HistoryTable results={results} onClear={vi.fn()} />);

    expect(screen.getByText('test.wav')).toBeInTheDocument();
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('should call onClear when Clear All button is clicked', () => {
    const onClear = vi.fn();
    const results = [{
      filename: 'test.wav',
      text: 'Hello world',
      language: 'en',
      duration: 5,
      timestamp: new Date(),
    }];

    render(<HistoryTable results={results} onClear={onClear} />);

    const clearButton = screen.getByText('Clear All');
    fireEvent.click(clearButton);

    expect(onClear).toHaveBeenCalled();
  });

  it('should copy to clipboard when Copy button is clicked', () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
    });

    const results = [{
      filename: 'test.wav',
      text: 'Hello world',
      language: 'en',
      duration: 5,
      timestamp: new Date(),
    }];

    render(<HistoryTable results={results} onClear={vi.fn()} />);

    const copyButton = screen.getByText('Copy');
    fireEvent.click(copyButton);

    expect(writeText).toHaveBeenCalledWith('Hello world');
  });
});

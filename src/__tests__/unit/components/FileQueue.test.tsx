import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import FileQueue from '../../../components/FileQueue';

describe('FileQueue Component', () => {
  it('should render nothing when queue is empty', () => {
    const { container } = render(<FileQueue items={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('should display queued files with waiting status', () => {
    const mockFile = new File(['data'], 'test.wav', { type: 'audio/wav' });
    const items = [{ file: mockFile, status: 'waiting' as const, progress: 0 }];

    render(<FileQueue items={items} />);

    expect(screen.getByText('test.wav')).toBeInTheDocument();
    expect(screen.getByText('⏳')).toBeInTheDocument();
  });
});
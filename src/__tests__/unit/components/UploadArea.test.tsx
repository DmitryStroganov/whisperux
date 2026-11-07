import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import UploadArea from '../../../components/UploadArea';

describe('UploadArea Component', () => {
  it('should render upload area with instructions', () => {
    render(<UploadArea onFilesSelected={vi.fn()} />);

    expect(screen.getByText('Drag & drop audio files here')).toBeInTheDocument();
    expect(screen.getByText('or click to browse (MP3, WAV, OGG, WebM, MP4)')).toBeInTheDocument();
    expect(screen.getByText('Max file size: 25 MB')).toBeInTheDocument();
  });

  it('should call onFilesSelected when files are selected', () => {
    const onFilesSelected = vi.fn();

    render(<UploadArea onFilesSelected={onFilesSelected} />);

    const fileInput = screen.getByLabelText(/drag & drop/i);
    const mockFile = new File(['data'], 'test.wav', { type: 'audio/wav' });
    const mockFileList = { length: 1, item: (i: number) => i === 0 ? mockFile : null };
    Object.defineProperty(mockFileList, '0', { value: mockFile });
    Object.defineProperty(fileInput, 'files', { value: mockFileList });

    fireEvent.change(fileInput);

    expect(onFilesSelected).toHaveBeenCalledWith(mockFileList);
  });
});

import React from 'react';

interface UploadAreaProps {
  onFilesSelected: (files: FileList) => void;
}

export default class UploadArea extends React.Component<UploadAreaProps> {
  state = { isDragging: false };

  handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    this.setState({ isDragging: true });
  };

  handleDragLeave = () => {
    this.setState({ isDragging: false });
  };

  handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    this.setState({ isDragging: false });
    if (event.dataTransfer.files.length > 0) {
      this.props.onFilesSelected(event.dataTransfer.files);
    }
  };

  handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      this.props.onFilesSelected(event.target.files);
    }
  };

  render() {
    return (
      <div
        className={`upload-area ${this.state.isDragging ? 'is-drag-active' : ''}`}
        onDragOver={this.handleDragOver}
        onDragLeave={this.handleDragLeave}
        onDrop={this.handleDrop}
      >
        <input
          type="file"
          accept="audio/*,.mp3,.wav,.ogg,.webm,.mp4"
          multiple
          onChange={this.handleFileInput}
          style={{ display: 'none' }}
          id="file-input"
        />
        <label htmlFor="file-input">
          <div className="upload-area__icon">🎵</div>
          <div className="upload-area__text text-base mb-2">
            Drag &amp; drop audio files here
          </div>
          <div className="text-sm text-secondary">
            or click to browse (MP3, WAV, OGG, WebM, MP4)
          </div>
          <div className="text-xs text-muted mt-2">
            Max file size: 25 MB
          </div>
        </label>
      </div>
    );
  }
}

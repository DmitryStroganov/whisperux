import React from 'react';
import { QueueItem } from '../types';

interface FileQueueProps {
  items: QueueItem[];
}

export default class FileQueue extends React.Component<FileQueueProps> {
  getStatusIcon = (status: QueueItem['status']) => {
    switch (status) {
      case 'waiting':
        return '⏳';
      case 'processing':
        return '⚙️';
      case 'completed':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '';
    }
  };

  render() {
    if (this.props.items.length === 0) {
      return null;
    }

    return (
      <div className="mt-6">
        <h3 className="text-base text-primary mb-3">
          Processing Queue
        </h3>
        <div className="flex-column gap-2">
          {this.props.items.map((item, index) => (
            <div
              key={index}
              className={`file-queue-item ${item.status === 'processing' ? 'is-processing' : ''} ${item.status === 'completed' ? 'is-success' : ''} ${item.status === 'error' ? 'is-error' : ''}`}
            >
              <span>{this.getStatusIcon(item.status)}</span>
              <div className="file-queue-item__file">
                <div className="file-queue-item__name">{item.file.name}</div>
                {item.status === 'processing' && (
                  <div className="progress-bar">
                    <div
                      className="progress-bar__fill"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
                {item.error && (
                  <div className="text-xs text-error mt-1">
                    {item.error}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

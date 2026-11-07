import React from 'react';
import { TranscriptionResult } from '../types';

interface HistoryTableProps {
  results: TranscriptionResult[];
  onClear: () => void;
}

export default class HistoryTable extends React.Component<HistoryTableProps> {
  copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    });
  };

  render() {
    if (this.props.results.length === 0) {
      return null;
    }

    return (
      <div className="mt-6">
        <div className="flex-between mb-3">
          <h3 className="text-base text-primary">Transcription History</h3>
          <button
            onClick={this.props.onClear}
            className="btn btn-danger btn-sm"
          >
            Clear All
          </button>
        </div>
        <div className="flex-column gap-3">
          {this.props.results.map((result, index) => (
            <div key={index} className="history-table__card">
              <div className="flex-between mb-2">
                <div>
                  <span className="text-base font-semibold text-primary">
                    {result.filename}
                  </span>
                  <span className="text-xs text-secondary ml-2">
                    {result.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <button
                  onClick={() => this.copyToClipboard(result.text)}
                  className="btn-copy"
                >
                  Copy
                </button>
              </div>
              <div
                className="text-sm text-secondary text-pre-wrap"
                style={{ lineHeight: '1.6' }}
              >
                {result.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

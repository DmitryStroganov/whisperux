import React from 'react';
import { HealthStatus } from '../types';

interface HealthIndicatorProps {
  status: HealthStatus;
}

export default class HealthIndicator extends React.Component<HealthIndicatorProps> {
  render() {
    const { status } = this.props;
    const color = status.isHealthy ? '#22c55e' : '#ef4444';
    const label = status.isHealthy ? 'Online' : 'Offline';

    return (
      <div className="flex-between">
        <div
          style={{
            backgroundColor: color,
            width: '12px',
            height: '12px',
            borderRadius: '50%',
          }}
        />
        <span className="text-secondary">{label}</span>
      </div>
    );
  }
}

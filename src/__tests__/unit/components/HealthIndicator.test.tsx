import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import HealthIndicator from '../../../components/HealthIndicator';

describe('HealthIndicator Component', () => {
  it('should display green indicator when healthy', () => {
    const healthyStatus = {
      isHealthy: true,
      lastChecked: new Date(),
    };

    render(<HealthIndicator status={healthyStatus} />);

    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('should display red indicator when unhealthy', () => {
    const unhealthyStatus = {
      isHealthy: false,
      lastChecked: new Date(),
    };

    render(<HealthIndicator status={unhealthyStatus} />);

    expect(screen.getByText('Offline')).toBeInTheDocument();
  });
});

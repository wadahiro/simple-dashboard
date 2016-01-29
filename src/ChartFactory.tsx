import * as React from 'react';
import { DashboardConfig } from './Settings';

import NVD3LineWithFocusChart from './NVD3LineWithFocusChart';

export function renderChart(config: DashboardConfig) {
    if (config.type === 'nvd3/lineWithFocusChart') {
        return <NVD3LineWithFocusChart dashboardConfig={config} />;
    } else {
        // default
        return <NVD3LineWithFocusChart dashboardConfig={config} />;
    }
}
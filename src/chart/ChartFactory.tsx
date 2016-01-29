import * as React from 'react';
import { DashboardConfig } from '../Settings';

import NVD3LineWithFocusChart from './nvd3/NVD3LineWithFocusChart';
import PlotlyLineChart from './plotly/PlotlyLineChart';

export function renderChart(config: DashboardConfig) {
    switch (config.type) {
        case 'nvd3/lineWithFocusChart':
            return <NVD3LineWithFocusChart dashboardConfig={config} />;

        case 'plotly/lineChart':
            return <PlotlyLineChart dashboardConfig={config} />;

        default:
            return <NVD3LineWithFocusChart dashboardConfig={config} />;
    }
}
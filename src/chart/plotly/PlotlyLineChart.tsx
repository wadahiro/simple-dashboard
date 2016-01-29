import * as React from 'react';
import * as _ from 'lodash';
import AbstractChart from '../AbstractChart';
import Plotly from './Plotly';

const defaultHeight = 500;

interface PlotlyDataSchema {
    type: 'scatter' | 'bar';
    x: number[];
    y: number[];
    name: string;
}

export default class PlotlyLineChart extends AbstractChart {
    chart = null;

    renderChart() {
        const { dataSets } = this.state;

        const data = dataSets.map(dataSet => {
            return {
                type: 'scatter',
                x: dataSet.values.map(x => x.x),
                y: dataSet.values.map(x => x.y),
                name: dataSet.key
            };
        });

        const layout = {
            xaxis: {
                title: this.props.dashboardConfig.xAxisLabel
            },
            yaxis: {
                title: this.props.dashboardConfig.yAxisLabel
            }
        };

        const config = {
            showLink: false,
            displayModeBar: true,
            modeBarButtonsToRemove: ['sendDataToCloud'],
            displaylogo: false
        };

        return (
            <Plotly data={data} layout={layout} config={config}/>
        );
    }
}
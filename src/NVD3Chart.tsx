import * as React from 'react';
import * as _ from 'lodash';
import { Panel, Glyphicon } from 'react-bootstrap';
import { DashboardConfig, handleSource } from './Settings';
import Spinner from './Spinner';
import AbstractChart from './AbstractChart';


const d3 = require('d3');
const nv = require('nvd3');

const defaultHeight = 500;

export default class NVD3Chart extends AbstractChart {
    chart = null;

    renderChart() {
        const chartData = _.map(this.state.datasets, (v, k) => {
            return {
                key: k,
                values: (v as any).map((x, i) => {
                    return {
                        x: new Date(this.state.xLabels[i]),
                        y: x
                    };
                }).filter(x => x.y !== null)
            };
        });

        if (chartData.length > 0 && this.chart === null) {
            nv.addGraph(() => {
                this.chart = nv.models.lineWithFocusChart()
                    // .forceY([0, 100])
                    .xScale(d3.time.scale())
                    .margin({ top: 50, right: 70, bottom: 50, left: 70 })
                    // .legendRightAxisHint(' [Using Right Axis]')
                    // .showLegend(false)
                    .color(d3.scale.category10().range());
                this.chart.xAxis.tickFormat(function(d) {
                    var d = d3.time.format('%Y/%m/%d')(new Date(d))
                    return d
                })
                this.chart.x2Axis.tickFormat(function(d) {
                    var d = d3.time.format('%Y/%m/%d')(new Date(d))
                    return d
                })
                    .showMaxMin(false);

                // this.chart.legend.width(500).height(50).margin({ top: 10, right: 30, left: 80, bottom: 50 })
                // chart.y1Axis.tickFormat(function(d) { return '$' + d });

                // chart.bars.forceY([0]).padData(false);
                // chart.x2Axis.tickFormat(function(d) {
                //     return d3.time.format('%x')(new Date(d))
                // }).showMaxMin(false);
                const el = (this.refs['chart'] as any).getDOMNode();
                d3.select(el)
                    .datum(chartData)
                    // .attr('width', width)
                    .attr('height', this.props.dashboardConfig.options.height || defaultHeight)

                    .transition().duration(500).call(this.chart);

                // d3.select('.nv-legendWrap')
                //     .attr('transform', 'translate(0,750)');

                nv.utils.windowResize(this.chart.update);

                return this.chart;
            });
        }

        return (
            <div className='with-3d-shadow with-transitions'>
                <svg ref='chart' style={{ display: 'block', height: '100%', width: '100%', margin: '0px', padding: '0px' }}> </svg>
            </div>
        );
    }
}
import * as React from 'react';
import * as _ from 'lodash';
import { Panel, Glyphicon } from 'react-bootstrap';
import { DashboardConfig, handleSource } from './Settings';
import Spinner from './Spinner';

const LineChart = require('react-chartjs').Line;

interface Props extends React.Props<Chart> {
    dashboardConfig: DashboardConfig;
}

interface State {
    loading?: boolean;
    xLabels?: string[];
    datasets?: {
        [index: string]: number[];
    };
}

export default class Chart extends React.Component<Props, State> {
    state = {
        loading: false,
        xLabels: [],
        datasets: {} as any
    };

    componentDidMount() {
        const sources = this.props.dashboardConfig.sources.map(source => handleSource(source));

        this.setState({
            loading: true
        }, async () => {
            // initialize with empty data
            let xLabels = [];
            let datasets = this.props.dashboardConfig.sources.reduce((s, x) => {
                s[x.label] = [];
                return s;
            }, {} as any);

            // fetch datasets
            try {
                const results = await Promise.all(sources);

                // merge all xLabel
                xLabels = _.chain(results)
                    .map(pointers => {
                        return pointers.map(pointer => pointer.x);
                    })
                    .flatten()
                    .sortBy()
                    .uniq()
                    .value();

                results.forEach((pointers, resultIndex) => {
                    const label = this.props.dashboardConfig.sources[resultIndex].label;
                    let index = 0;
                    xLabels.forEach((xLabel) => {
                        const p = pointers[index];
                        if (p && p.x === xLabel) {
                            index++;
                            datasets[label].push(p.y);
                        } else {
                            datasets[label].push(null);
                        }
                    });
                });

            } catch (e) {
                console.error(e);
            }
            this.setState({
                loading: false,
                xLabels,
                datasets
            });
        })
    }
    
    download = (e) => {
        const labels = Object.keys(this.state.datasets);
        
        const csvHeader = ([this.props.dashboardConfig.xAxisLabel].concat(labels)).join(',');
        const csvBody = this.state.xLabels.map((x, rowIndex) => {
            return labels.reduce((s, label) => {
                s.push(this.state.datasets[label][rowIndex]);
                return s;
            }, [x]).join(',');
        }).join('\n');
        
        const blob = new Blob([ `${csvHeader}\n${csvBody}` ], { "type" : "text/plain" });
        
        if (window.navigator.msSaveBlob) { 
            window.navigator.msSaveBlob(blob, `${this.props.dashboardConfig.label}.csv`); 
        } else {
            window.URL = window.URL || window['webkitURL'];
            e.target.parentNode.href = window.URL.createObjectURL(blob);
        }
    };

    render() {
        const chartData = {
            labels: this.state.xLabels,
            datasets: _.map(this.state.datasets, (v, k) => {
                const source = this.props.dashboardConfig.sources.find(x => x.label === k.toString());
                return Object.assign({}, {
                    label: k,
                    data: v
                }, source.options);
            })
        };

        return (
            <Panel header={<div>{this.props.dashboardConfig.label}{ chartData.labels.length > 0 && <a href='#' download={`${this.props.dashboardConfig.label}.csv`} onClick={this.download} className='pull-right'><Glyphicon glyph='cloud-download' /></a>}</div>}>
                <Spinner show={this.state.loading} />
                { chartData.labels.length > 0 &&
                    <div>
                        <LineChart data={chartData} options={chartOptions} width='600' height='250' responsive />
                        <ChartLegend datasets={chartData.datasets} />
                    </div>
                }
            </Panel>
        );
    }
}


const chartOptions = {

    ///Boolean - Whether grid lines are shown across the chart
    scaleShowGridLines: true,

    //String - Colour of the grid lines
    scaleGridLineColor: 'rgba(0,0,0,.05)',

    //Number - Width of the grid lines
    scaleGridLineWidth: 1,

    //Boolean - Whether to show horizontal lines (except X axis)
    scaleShowHorizontalLines: true,

    //Boolean - Whether to show vertical lines (except Y axis)
    scaleShowVerticalLines: true,

    //Boolean - Whether the line is curved between points
    bezierCurve: true,

    //Number - Tension of the bezier curve between points
    bezierCurveTension: 0.4,

    //Boolean - Whether to show a dot for each point
    pointDot: true,

    //Number - Radius of each point dot in pixels
    pointDotRadius: 4,

    //Number - Pixel width of point dot stroke
    pointDotStrokeWidth: 1,

    //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
    pointHitDetectionRadius: 20,

    //Boolean - Whether to show a stroke for datasets
    datasetStroke: true,

    //Number - Pixel width of dataset stroke
    datasetStrokeWidth: 2,

    //Boolean - Whether to fill the dataset with a colour
    datasetFill: true,

    //String - A legend template
    legendTemplate: '<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].strokeColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>'
};

class ChartLegend extends React.Component<any, any> {
    render() {
        const datasets = _.map(this.props.datasets, function(ds: any) {
            return <li><span style={{
                    '-moz-border-radius':'7px 7px 7px 7px',
                    'border-radius':'7px 7px 7px 7px',
                    'margin-right':'10px',
                    'width':'15px',
                    'height':'15px',
                    'display':'inline-block',
                    'background-color': ds.strokeColor}
                }></span> { ds.label }</li>;
        });

        return (
            <ul style={{'list-style-type': 'none'}}>
                { datasets }
            </ul>
        );
    }
}
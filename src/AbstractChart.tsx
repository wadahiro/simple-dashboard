import * as React from 'react';
import * as _ from 'lodash';
import { Panel, Glyphicon, Alert } from 'react-bootstrap';
import { DashboardConfig, handleSource } from './Settings';
import Spinner from './Spinner';

interface Props extends React.Props<AbstractChart> {
    dashboardConfig: DashboardConfig;
}

interface State {
    loading?: boolean;
    xLabels?: string[];
    datasets?: {
        [index: string]: number[];
    };
    options?: {
        [index: string]: {
            [index: string]: string | number;
        }
    },
    error?: string;
}

const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);

abstract class AbstractChart extends React.Component<Props, State> {
    state = {
        loading: false,
        xLabels: [],
        datasets: {} as any,
        options: null,
        error: null
    };

    componentDidMount() {

        this.setState({
            loading: true,
            options: this.props.dashboardConfig.sources.reduce((s, x) => {
                if (x.label) {
                    s[x.label] = x.options;
                }
                return s;
            }, {} as any)
        }, () => {
            
            // fetch datasets
            const sources = this.props.dashboardConfig.sources.map(source => handleSource(source));
            const newOptions = Object.assign({}, this.state.options);
            
            // initialize with empty data
            let xLabels = [];
            let datasets = this.props.dashboardConfig.sources.reduce((s, x) => {
                if (x.label) {
                    s[x.label] = [];
                }
                return s;
            }, {} as any);

            Promise.all(sources)
                .then(results => {
                    // merge all xLabel
                    xLabels = _.chain(results)
                        .map(coordinates => {
                            return coordinates.map(x => x.x);
                        })
                        .flatten()
                        .sortBy()
                        .uniq()
                        .value();

                    results.forEach((coordinates, resultIndex) => {
                        const label = this.props.dashboardConfig.sources[resultIndex].label;
                        
                        if (label) {
                            let index = 0;
                            xLabels.forEach((xLabel) => {
                                const p = coordinates[index];
                                if (p && p.x === xLabel) {
                                    index++;
                                    datasets[label].push(p.y);
                                } else {
                                    datasets[label].push(null);
                                }
                            });
                        } else {
                            // dynamic kinds
                            const grouped = _.groupBy(coordinates, 'k');
                            
                            _.forEach(grouped, (v, kind) => {
                                
                                if (!datasets[kind]) {
                                    datasets[kind] = [];

                                    // add options dynamically
                                    newOptions[kind] = Object.assign({}, this.props.dashboardConfig.sources[resultIndex].options);
                                }
                                
                                let index = 0;
                                xLabels.forEach((xLabel) => {
                                    const p = v[index];
                                    if (p && p.x === xLabel) {
                                        index++;
                                        datasets[kind].push(p.y);
                                    } else {
                                        datasets[kind].push(null);
                                    }
                                });
                            });
                        }
                    });
                    this.setState({
                        loading: false,
                        xLabels,
                        datasets,
                        options: newOptions
                    });
                })
                .catch(e => {
                    
                    console.error('fetch error', e);
                    this.setState({
                        loading: false,
                        error: 'Cannot fetch data.'
                    });
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
        
        const blob = new Blob([ bom, `${csvHeader}\n${csvBody}` ], { "type" : "text/csv" });
        
        if (window.navigator.msSaveBlob) { 
            window.navigator.msSaveBlob(blob, `${this.props.dashboardConfig.label}.csv`); 
        } else {
            window.URL = window.URL || window['webkitURL'];
            e.target.parentNode.href = window.URL.createObjectURL(blob);
        }
    };

    render() {
        const xLabels = this.state.xLabels;

        return (
            <Panel header={<div>{this.props.dashboardConfig.label}{ xLabels && xLabels.length > 0 && <a href='#' download={`${this.props.dashboardConfig.label}.csv`} onClick={this.download} className='pull-right'><Glyphicon glyph='cloud-download' /></a>}</div>}>
                <Spinner show={this.state.loading} />
                { xLabels && xLabels.length > 0 &&
                    <div>
                        { this.renderChart() }
                    </div>
                }
                { this.state.error && 
                    <Alert bsStyle='danger'>
                        <h4>{ this.state.error }</h4>
                    </Alert>
                }
            </Panel>
        );
    }
    
    abstract renderChart();
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

export default AbstractChart;
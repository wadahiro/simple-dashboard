import * as React from 'react';
import * as _ from 'lodash';
import { Panel, Glyphicon, Alert } from 'react-bootstrap';
import { DashboardConfig, DataSet, handleSources } from '../Settings';
import Spinner from '../Spinner';

interface Props extends React.Props<AbstractChart> {
    dashboardConfig: DashboardConfig;
}

interface State {
    loading?: boolean;
    dataSets?: DataSet[];
    options?: {
        [index: string]: {
            [index: string]: string | number;
        }
    },
    error?: string;
}

const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);

interface CSVRows {
    [xLabel:string] : {
        [yLabel:string]: number | string
    };
}

abstract class AbstractChart extends React.Component<Props, State> {
    state = {
        loading: false,
        dataSets: [] as DataSet[],
        options: null,
        error: null
    };

    componentDidMount() {
        const { sources } = this.props.dashboardConfig;

        this.setState({
            loading: true,
            options: sources.reduce((s, x) => {
                if (x.label) {
                    s[x.label] = x.options;
                }
                return s;
            }, {} as any)
        }, async () => {
            try {
                const dataSets = await handleSources(sources);
                const newOptions = Object.assign({}, this.state.options);
                
                this.setState({
                    loading: false,
                    dataSets,
                    options: newOptions
                });
            } catch(e) {
                console.error('fetch error', e);
                this.setState({
                    loading: false,
                    error: 'Cannot fetch data.'
                });
            }
        });
    }
    
    download = (e) => {
        const { dataSets } = this.state;
        const { xAxisLabel, yAxisLabel } = this.props.dashboardConfig;
        
        const categories = dataSets.map(x => x.key);
        const csvHeader = ([xAxisLabel].concat(categories)).join(',');
        
        let rows: CSVRows = {};
        
        dataSets.forEach(dataSet => {
            dataSet.values.forEach(x => {
                let values = rows[x.x];
                if (!values) {
                    values = {
                        [dataSet.key]: x.x
                    };
                    rows[x.x] = values;
                }
                values[dataSet.key] = x.y;
            });
        });
        
        const csvBody = _.map(rows, (row, xLabel) => {
            const values: any = categories.map(category => {
                return typeof row[category] !== 'undefined' ? row[category] : '';
            })
            return [xLabel].concat(values);
        });
        
        const csvBodyText = _.sortBy(csvBody, '0').map(row => row.join(',')).join('\n');
        
        const blob = new Blob([ bom, `${csvHeader}\n${csvBodyText}` ], { "type" : "text/csv" });
        
        if (window.navigator.msSaveBlob) { 
            window.navigator.msSaveBlob(blob, `${this.props.dashboardConfig.label}.csv`); 
        } else {
            window.URL = window.URL || window['webkitURL'];
            e.target.parentNode.href = window.URL.createObjectURL(blob);
        }
    };

    render() {
        const { label } =this.props.dashboardConfig;
        const { dataSets, loading, error } = this.state;
        const hasData = dataSets.length > 0;

        return (
            <Panel header={<div>{ label }{ hasData && <a href='#' download={`${ label }.csv`} onClick={this.download} className='pull-right'><Glyphicon glyph='cloud-download' /></a>}</div>}>
                <Spinner show={this.state.loading} />
                { hasData &&
                    <div>
                        { this.renderChart() }
                    </div>
                }
                { error && 
                    <Alert bsStyle='danger'>
                        <h4>{ error }</h4>
                    </Alert>
                }
                { !hasData && !loading && !error &&
                    <Alert bsStyle='info'>
                        <h4>No data</h4>
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
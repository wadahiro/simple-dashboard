import * as React from 'react';

const plotly = require('plotly.js');

interface Props extends React.Props<Plotly> {
    data: any[];
    layout: any;
    config: any;
}

interface State {
}

export default class Plotly extends React.Component<Props, State> {
    container = null;

    resize = () => {
        plotly.Plots.resize(this.container);
    };

    componentDidMount() {
        let {data, layout, config} = this.props;
        plotly.plot(this.container, data, layout, config);

        window.addEventListener('resize', this.resize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resize);
    }

    componentDidUpdate() {
        this.container.data = this.props.data;
        this.container.layout = this.props.layout;
        plotly.redraw(this.container);
    }

    render() {
        return <div ref={(node) => this.container = node} />
    }
}
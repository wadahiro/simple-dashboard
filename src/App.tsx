import * as React from 'react';
import { PageHeader, Panel, Button, Row, Grid, Col } from 'react-bootstrap';
import * as _ from 'lodash';

import Spinner from './Spinner';
import { Settings } from './Settings';
import Chart from './Chart';

require("babelify/polyfill");
require('whatwg-fetch');


interface State {
    settings?: Settings;
}

export default class App extends React.Component<React.Props<App>, State> {

    state: State = {
        settings: null
    };

    loadSettings = async (): Promise<Settings> => {
        const response = await fetch('./settings.json');
        const settings = await response.json();
        return Promise.resolve(settings);
    };

    componentDidMount() {
        this.loadSettings()
            .then(x => {
                this.setState({
                    settings: x
                });
            });
    }

    render() {
        if (this.state.settings) {
            const { columnSize, dashboard } = this.state.settings;
            const rowCount = Math.ceil(this.state.settings.dashboard.length / columnSize);

            return (
                <Grid fluid={true}>
                    <div>
                        <PageHeader>
                            <span>{this.state.settings.title}</span>
                        </PageHeader>
                        <Grid fluid={true}>
                            {_.range(rowCount).map(row => {
                                return (
                                    <Row>
                                        {_.range(columnSize).map(x => {
                                            const config = dashboard[row * columnSize + x];
                                            if (config) {
                                                return (
                                                    <Col sm={12 / columnSize}>
                                                        <Chart dashboardConfig={config} />
                                                    </Col>
                                                );
                                            } else {
                                                return <Col sm={12 / columnSize} />;
                                            }
                                        })
                                        }
                                    </Row>
                                );
                            }) }
                        </Grid>
                    </div>
                </Grid>
            );
        } else {
            return <Spinner show={true} />;
        }
    }
}


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
        return (
            <Grid fluid={true}>
                {this.state.settings ?
                    <div>
                        <PageHeader>
                            <span>{this.state.settings.title}</span>
                        </PageHeader>
                        <Grid fluid={true}>
                            <Row>
                                {this.state.settings.dashboard.map(x => {
                                    return (
                                        <Col sm={12 / this.state.settings.columnSize}>
                                            <Chart dashboardConfig={x} />
                                        </Col>
                                    );
                                })
                                }
                            </Row>
                        </Grid>
                    </div>
                    : <Spinner show={true} />
                }
            </Grid>
        );
    }
}


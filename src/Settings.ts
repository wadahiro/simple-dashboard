export interface Settings {
    title: string;
    columnSize: number;
    dashboard: DashboardConfig[];
}

export interface DashboardConfig {
    type: 'nvd3';
    label: string;
    xAxisLabel: string;
    yAxisLabel: string;
    sources: (CSVSource | TextSource | JSONSource)[];
    options: {
        height: number;
    };
}

interface CSVSource {
    type: 'csv';
    label: string;
    url: string;
    delimiter: string;
    kind?: string;
    kinds?: string;
    x: number;
    y: number;
    options: any;
}

export interface TextSource {
    type: 'text';
    label: string;
    url: string;
    pattern: string;
    kind?: string;
    kinds?: string;
    x: number;
    y: number;
    options: any;
}

export interface JSONSource {
    type: 'json';
    label: string;
    url: string;
    kind?: string;
    x: string;
    y: string;
    options: any;
}

function isCSVSource(source: any): source is CSVSource {
    return source.type === 'csv';
}

function isTextSource(source: any): source is TextSource {
    return source.type === 'text';
}

function isJSONSource(source: any): source is JSONSource {
    return source.type === 'json';
}

export interface Coordinates {
    k?: string;
    x: string;
    y: number;
}


export function handleSource(source: CSVSource | TextSource | JSONSource): Promise<Coordinates[]> {
    if (isCSVSource(source)) {
        return handleCSVSource(source);

    } else if (isTextSource(source)) {
        return handleTextSource(source);

    } else if (isJSONSource(source)) {
        return handleJSONSource(source);

    } else {
        return Promise.resolve(undefined);
    }
}

function handleCSVSource(source: CSVSource): Promise<Coordinates[]> {
    return callFetch(source.url)
        .then(x => {
            return x.text();
        })
        .then(x => {
            return x.split('\n').map(x => {
                if (x === '') {
                    return null;
                }
                const values = x.split(source.delimiter);

                // TODO check error
                const coordinates: Coordinates = {
                    x: values[source.x],
                    y: parseInt(values[source.y])
                };

                if (source.kind) {
                    const k = values[source.kind];;
                    if (k.match(source.kinds)) {
                        coordinates.k = k;
                    } else {
                        return null;
                    }
                }

                return coordinates;
            })
                .filter(x => x !== null && x.x && x.x.length > 0);
        })
}

function handleTextSource(source: TextSource): Promise<Coordinates[]> {
    const re = new RegExp(source.pattern);

    return callFetch(source.url)
        .then(x => {
            return x.text();
        })
        .then(x => {
            return x.split('\n')
                .map(x => {
                    const matched = x.match(re);
                    return matched;
                })
                .filter(x => x !== null)
                .map(x => {
                    // TODO check error
                    return {
                        x: x[source.x + 1],
                        y: parseInt(x[source.y + 1])
                    };
                });
        })
}

function handleJSONSource(source: JSONSource): Promise<Coordinates[]> {
    throw new Error('Not implemented');
}

function callFetch<T>(url: string): Promise<Response> {
    return fetch(url, {
        credentials: 'same-origin',
        headers: {
            'If-Modified-Since': 'Tue, 01 Jun 1970 00:00:00 GMT'
        }
    })
        .then(handleErrors);
}

function handleErrors(response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}
export interface Settings {
    title: string;
    columnSize: number;
    dashboard: DashboardConfig[];
}

export interface DashboardConfig {
    label: string;
    sources: (CSVSource | TextSource | JSONSource)[]
}

interface CSVSource {
    type: 'csv';
    label: string;
    url: string;
    delimiter: string;
    x: number;
    y: number;
    options: any;
}

export interface TextSource {
    type: 'text';
    label: string;
    url: string;
    pattern: string;
    x: number;
    y: number;
    options: any;
}

export interface JSONSource {
    type: 'json';
    label: string;
    url: string;
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

export interface Pointer {
    x: string;
    y: number;
}


export function handleSource(source: CSVSource | TextSource | JSONSource): Promise<Pointer[]> {
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

function handleCSVSource(source: CSVSource): Promise<Pointer[]> {
    return fetch(source.url, {
        credentials: 'same-origin'
    })
        .then(x => {
            return x.text();
        })
        .then(x => {
            return x.split('\n').map(x => {
                const values = x.split(source.delimiter);

                // TODO check error
                return {
                    x: values[source.x],
                    y: parseInt(values[source.y])
                };
            })
                .filter(x => x.x && x.x.length > 0);
        })
}

function handleTextSource(source: TextSource): Promise<Pointer[]> {
    const re = new RegExp(source.pattern);

    return fetch(source.url, {
        credentials: 'same-origin'
    })
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

function handleJSONSource(source: JSONSource): Promise<Pointer[]> {
    throw new Error('Not implemented');
}
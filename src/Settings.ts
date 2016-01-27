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

type Source = CSVSource | TextSource | JSONSource;

interface CSVSource extends DynamicCategorySource {
    type: 'csv';
    label: string;
    url: string;
    delimiter: string;
    x: string;
    y: number;
    options: any;
}

export interface TextSource extends DynamicCategorySource {
    type: 'text';
    label: string;
    url: string;
    pattern: string;
    x: string;
    y: number;
    options: any;
}

export interface JSONSource extends DynamicCategorySource {
    type: 'json';
    label: string;
    url: string;
    x: string;
    y: number;
    options: any;
}

export interface DynamicCategorySource {
    x: string;
    y: number;
    category?: string;
    includesCategories?: string[];
}

function isDynamicCategorySource(source: any): source is DynamicCategorySource {
    return source && source.category;
}

function isCSVSource(source: any): source is CSVSource {
    return source && source.type === 'csv';
}

function isTextSource(source: any): source is TextSource {
    return source && source.type === 'text';
}

function isJSONSource(source: any): source is JSONSource {
    return source && source.type === 'json';
}


export interface DataSet {
    key: string;
    values: {
        x: string;
        y: number;
    }[];
}

export function handleSources(sources: Source[]): Promise<DataSet[]> {
    const ps = _.chain(sources)
        .map(source => {
            return handleSource(source);
        })
        .value();

    return Promise.all(ps)
        .then(results => {
            return _.chain(results)
                .flatten()
                .value();
        });
}

function handleSource(source: Source): Promise<DataSet[]> {
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

function handleCSVSource(source: CSVSource): Promise<DataSet[]> {
    return callFetch(source.url)
        .then(x => x.text())
        .then(x => {
            return x.split('\n')
                .map(x => {
                    if (x === '') {
                        return null;
                    }
                    const values = x.split(source.delimiter);
                    return values;
                })
                .filter(x => x && x.length > 0);
        })
        .then(toDataSet(source));
}


function handleTextSource(source: TextSource): Promise<DataSet[]> {
    const re = new RegExp(source.pattern);

    return callFetch(source.url)
        .then(x => x.text())
        .then(x => {
            return x.split('\n')
                .map(x => {
                    if (x === '') {
                        return null;
                    }
                    const matched = x.match(re);
                    matched.shift();
                    return matched;
                })
                .filter(x => x && x.length > 0);
        })
        .then(toDataSet(source));
}

function handleJSONSource(source: JSONSource): Promise<DataSet[]> {
    throw new Error('Not implemented');
}

function toDataSet(source: Source) {
    return (rows: string[][]): DataSet[] => {

        if (isDynamicCategorySource(source)) {
            const groups = _.chain(rows)
                .map(row => {
                    const category: string = row[source.category];
                    const x: string = row[source.x];
                    const y = parseInt(row[source.y]);
                    return { category, x, y };
                })
                .filter(x => {
                    if (!source.includesCategories || source.includesCategories.length === 0) {
                        return true;
                    }
                    return _.contains(source.includesCategories, x.category);
                })
                .groupBy('category')
                .value();

            return Object.keys(groups).map(key => {
                const rowsOfCategory = groups[key];
                const dataSet: DataSet = _.chain(rowsOfCategory)
                    .reduce<any>((s, row) => {
                        s.values.push({
                            x: row.x,
                            y: row.y
                        });
                        return s;
                    }, {
                        key,
                        values: []
                    })
                    .value();

                return dataSet;
            });

        } else {
            const dataSet = _.chain(rows)
                .sortBy('0')
                .reduce<any>((s, row) => {
                    const x = row[source.x];
                    const y = parseInt(row[source.y]);
                    s.values.push({ x, y });
                    return s;
                }, {
                    key: source.label,
                    values: []
                } as DataSet)
                .value();
console.log(dataSet)
            // always return one
            return [dataSet];
        }
    };
}

function callFetch<T>(url: string): Promise<Response> {
    return fetch(url,
        {
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
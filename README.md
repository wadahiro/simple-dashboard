# Simple Dashboard

- [About](#about)
- [Quick Start](#quick-start)
- [License](#license)

## About

This is a simple dashboard application that is made only by a static files.

Features:

* Fetching and Parsing csv source data.
* Generating chart. Currently, support line chart only.
* The configuration by JSON file.

## Quick Start

@TODO

## How to configure dashboard

You can customize you dashboard by changing [settings.json](/public/settings.json).

### Title & Layout configuration

You can change the title of dashboard and column size.

```json
{
    "title": "Simple Dashboard",
    "columnSize": 2,
    "dashboard": [
    ...
    ]
}
```

### Dashboard configuration

Simple example.

```json
    "dashboard": [
        {
            "type": "nvd3",
            "label": "Unique Users",
            "xAxisLabel": "Date",
            "yAxisLabel": "Unique Users",
            "sources": [
                {
                    "url": "./example/unique-users.log",
                    "label": "Unique Users",
                    "type": "csv",
                    "delimiter": " ",
                    "x": 0,
                    "y": 1
                }
            ],
            "options" : {
                "height": 300
            }
        },
        ...
    ]
```

You can add more source into a chart.

```json
    "dashboard": [
        {
            "type": "nvd3",
            "label": "HTTP",
            "xAxisLabel": "Date",
            "yAxisLabel": "HTTP Access",
            "sources": [
                {
                    "url": "./example/access-home.log",
                    "label": "/home",
                    "type": "csv",
                    "delimiter": " ",
                    "x": 0,
                    "y": 1
                },
                {
                    "url": "./example/access-search.log",
                    "label": "/search",
                    "type": "csv",
                    "delimiter": " ",
                    "x": 0,
                    "y": 1
                }
            ],
            "options" : {
                "height": 300
            }
        },
        ...
    ]
```


## For Developer

```bash
npm install
npm run api & npm run dev
```

Open `http://localhost:9000` in your browser, you can see a sample dashboard.
If you want to change test source data, please modify [server.js](/server.js). 
It will take effect immediately when you save the file (restart test server automatically).
In addition, it will take effect immediately if you change the source code under `src` directory.

## License

Licensed under the [MIT](/LICENSE.txt) license.
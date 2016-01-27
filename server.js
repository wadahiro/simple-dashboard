var fs = require('fs');
var path = require('path');
var express = require('express');

var app = express();
var COMMENTS_FILE = path.join(__dirname, 'comments.json');
app.set('port', (process.env.PORT || 3000));
app.use('/', express.static(path.join(__dirname, 'public')));


app.get('/example/unique-users.log', function (req, res) {
    setTimeout(function () {
        res.setHeader('Cache-Control', 'no-cache');
        res.send('2016-01-19 14\n2016-01-20 25\n2016-01-21 10\n2016-01-22 40\n');
    }, 20);
});

app.get('/example/access-home.log', function (req, res) {
    setTimeout(function () {
        res.setHeader('Cache-Control', 'no-cache');
        res.send(`
2016-01-19 10
2016-01-21 0
2016-01-22 20
`);
    }, 10);
});

app.get('/example/access-search.log', function (req, res) {
    setTimeout(function () {
        res.setHeader('Cache-Control', 'no-cache');
        res.send(`
2016-01-19 20
2016-01-20 23
2016-01-21 10
2016-01-22 50
`);
    }, 10);
});

app.get('/example/access-update.log', function (req, res) {
    setTimeout(function () {
        res.setHeader('Cache-Control', 'no-cache');
        res.send(`
2016-01-19 25
2016-01-20 23
2016-01-21 10
2016-01-22 60
`);
    }, 10);
});

app.get('/example/new-users.log', function (req, res) {
    setTimeout(function () {
        res.setHeader('Cache-Control', 'no-cache');
        var sb = '';
        var x;
        for (var i = 0; i < 365 * 5; i++) {
            x = 1425096000 + i * 60 * 60 * 24 * 1000; // +1day
            x = new Date(x)
            x = formatDate(x, 'YYYY-MM-DD')
            sb += x + ' ' + Math.floor(Math.random() * (50 - 10) + 10) + '\n';
        }
        res.send(sb);
    }, 10);
});

app.get('/example/delete-users.log', function (req, res) {
    setTimeout(function () {
        res.setHeader('Cache-Control', 'no-cache');
        var sb = '';
        var x;
        for (var i = 0; i < (365 * 5)/2; i++) {
            x = 1425096000 + (i * 2) * 60 * 60 * 24 * 1000; // +1day
            x = new Date(x)
            x = formatDate(x, 'YYYY-MM-DD')
            sb += x + ' ' + Math.floor(Math.random() * (20 - 10) + 10) + '\n';
        }
        res.send(sb);
    }, 10);
});

app.get('/example/access-projects.log', function (req, res) {
    setTimeout(function () {
        res.setHeader('Cache-Control', 'no-cache');
        res.send(`
2016-01-14 ABC 100
2016-01-14 OPQ 50
2016-01-14 XYZ 200
2016-01-15 ABC 120
2016-01-15 OPQ 30
2016-01-15 XYZ 150
2016-01-16 ABC 130
2016-01-16 OPQ 80
2016-01-16 XYZ 90
`);
    }, 10);
});


app.listen(app.get('port'), function () {
    console.log('Server started: http://localhost:' + app.get('port') + '/');
});

function sleep(time, callback) {
    var stop = new Date().getTime();
    while (new Date().getTime() < stop + time) {
        ;
    }
    callback();
}

var formatDate = function (date, format) {
    if (!format) format = 'YYYY-MM-DD hh:mm:ss.SSS';
    format = format.replace(/YYYY/g, date.getFullYear());
    format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
    format = format.replace(/DD/g, ('0' + date.getDate()).slice(-2));
    format = format.replace(/hh/g, ('0' + date.getHours()).slice(-2));
    format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
    format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
    if (format.match(/S/g)) {
        var milliSeconds = ('00' + date.getMilliseconds()).slice(-3);
        var length = format.match(/S/g).length;
        for (var i = 0; i < length; i++) format = format.replace(/S/, milliSeconds.substring(i, i + 1));
    }
    return format;
};
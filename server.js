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
        res.send('2016-01-19 10\n2016-01-21 0\n2016-01-22 20\n');
    }, 10);
});

app.get('/example/access-search.log', function (req, res) {
    setTimeout(function () {
        res.setHeader('Cache-Control', 'no-cache');
        res.send('2016-01-19 20\n2016-01-20 23\n2016-01-21 10\n2016-01-22 50\n');
    }, 10);
});

app.get('/example/access-update.log', function (req, res) {
    setTimeout(function () {
        res.setHeader('Cache-Control', 'no-cache');
        res.send('2016-01-19 25\n2016-01-20 23\n2016-01-21 10\n2016-01-22 60\n');
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

app.get('/example/access-projects.log', function (req, res) {
    setTimeout(function () {
        res.setHeader('Cache-Control', 'no-cache');
        res.send(`
2016-01-14 338
2016-01-15 327
2016-01-16 28
2016-01-17 13
2016-01-18 315
2016-01-19 328
2016-01-20 331
2016-01-21 330
2016-01-22 307
2016-01-23 22
2016-01-24 13
2016-01-25 312
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
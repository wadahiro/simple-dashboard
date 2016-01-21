var fs = require('fs');
var path = require('path');
var express = require('express');

var app = express();
var COMMENTS_FILE = path.join(__dirname, 'comments.json');
app.set('port', (process.env.PORT || 3000));
app.use('/', express.static(path.join(__dirname, 'public')));


app.get('/example/unique-users.log', function(req, res) {
    setTimeout(function() {
        res.setHeader('Cache-Control', 'no-cache');
        res.send('2016-01-19 14\n2016-01-20 25\n2016-01-21 10\n2016-01-22 40\n');
    }, 2000);
});

app.get('/example/access-home.log', function(req, res) {
    setTimeout(function() {
        res.setHeader('Cache-Control', 'no-cache');
        res.send('2016-01-19 10\n2016-01-21 0\n2016-01-22 20\n');
    }, 10);
});

app.get('/example/access-search.log', function(req, res) {
    setTimeout(function() {
        res.setHeader('Cache-Control', 'no-cache');
        res.send('2016-01-19 20\n2016-01-20 23\n2016-01-21 10\n2016-01-22 50\n');
    }, 10);
});

app.get('/example/access-update.log', function(req, res) {
    setTimeout(function() {
        res.setHeader('Cache-Control', 'no-cache');
        res.send('2016-01-19 25\n2016-01-20 23\n2016-01-21 10\n2016-01-22 60\n');
    }, 10);
});

app.get('/example/new-users.log', function(req, res) {
    setTimeout(function() {
        res.setHeader('Cache-Control', 'no-cache');
        res.send('2016-01-19 30\n2016-01-20 45\n2016-01-21 21\n2016-01-22 70\n');
    }, 10);
});



app.listen(app.get('port'), function() {
    console.log('Server started: http://localhost:' + app.get('port') + '/');
});

function sleep(time, callback) {
    var stop = new Date().getTime();
    while(new Date().getTime() < stop + time) {
        ;
    }
    callback();
}
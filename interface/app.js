
var path = require('path');

var express = require('express');

var routes = require('./routes')

module.exports = function createApplication() {
    var app = express();

    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');

    app.use(express.favicon());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));

    routes(app);

    return app;
};

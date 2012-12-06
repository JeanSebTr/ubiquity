var path = require('path');

var express = require('express');

var routes = require('./routes')

module.exports = function createApplication() {
    var app = express();

    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');

    app.use(app.router);

    routes(app);

    return app;
};

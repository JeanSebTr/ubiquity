
var fs = require('fs');
var http = require('http');
var path = require('path');
var EventEmitter = require('events').EventEmitter;

var async = require('async');
var mkdirp = require('mkdirp');

var UbiquityClient = require('./client.js');

function UbiquityService(opts) {
    // events
    EventEmitter.call(this);
    this.on('msg', this.onMessage.bind(this));

    opts = opts || {};
    opts.dbfile = opts.dbfile || '/var/lib/xpensia/ubiquity.sqlite';
    opts.adminSocket = opts.adminSocket || '/var/run/ubiquity/admin.socket';
    this.publicPath = opts.publicSocket || '/var/run/ubiquity/public.socket';
    this.srv = null;
    this.waitFinish = [];

    async.waterfall([
        mkdirp.bind(null, path.dirname(this.publicPath)),
        startService.bind(this)
    ], function(err) {
        if(err) {
            if(err.code == 'EADDRINUSE') {
                console.log('Service already running');
                process.exit(2);
            }
            else {
                console.error('Error starting ubiquity service', err);
                console.error(err.stack);
                process.exit(1);
            }
        }
        else {
            console.log('ubiquity service started');
        }
    });
}
var $ = UbiquityService.prototype = Object.create(EventEmitter.prototype);
module.exports = UbiquityService;

UbiquityService.launch = function() {
    var service = Object.create(UbiquityService.prototype);
    UbiquityService.apply(service, arguments);
};

function startService(cb) {
    var self = this;
    srv = http.createServer(this.onConnection.bind(this));
    srv.on('error', cb);
    srv.listen(this.publicPath, function() {
        srv.removeListener('error', cb);
        srv.on('error', self.emit.bind(self, 'error'));
        process.setgid(-2);
        process.setuid(-2);
        cb(null);
    });
    this.srv = srv;
    process.on('SIGTERM', stopService.bind(this));
}

function stopService() {
    this.srv.close(this.emit.bind(this, 'close'));
    this.emit('stop');
}



$.onConnection = function(stream) {
    stream.write(JSON.stringify({
        type: 'info',
        pid: process.pid
    })+'\r\n');
    stream.buf = '';
    stream.on('data', this.onData.bind(this, stream));
    var disconnect = function() {
        stream.end(JSON.stringify({type:'stop'})+'\r\n');
    };
    this.on('stop', disconnect);
    stream.on('end', this.removeListener.bind(this,
        'disconnect', disconnect));

    // TODO moaarrr
};

$.onData = function(stream, data) {
    stream.buf += data.toString('utf8');
    var p, str;
    while((p=stream.buf.indexOf('\r\n')) != -1) {
        str = stream.buf.substring(0, p);
        stream.buf = stream.buf.substr(p+2);
        try {
            this.emit('msg', JSON.parse(str), stream);
        }
        catch(e) {
            console.error('Invalid JSON: >%s<', str);
            console.error(e.stack);
        }
    }
};

$.onMessage = function(msg, stream) {
    if(msg.type == 'expose') {
        this.exposeService(msg.domain, msg.port, stream);
    }
};

$.exposeService = function(domain, port, stream) {
    //
};



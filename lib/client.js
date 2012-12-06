
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var net = require('net');

function UbiquityClient(path) {
    EventEmitter.call(this);
    
    this.stream = net.connect({
        path: path
    }, this.onConnect.bind(this));
    this.stream.on('error', this.emit.bind(this, 'error'));
    this.stream.on('connect', this.emit.bind(this, 'connect'));
    this.stream.on('data', this.onData.bind(this));
    this.stream.on('close', this.emit.bind(this, 'close'));

    this.buf = '';
}
var $ = UbiquityClient.prototype = Object.create(EventEmitter.prototype);
module.exports = UbiquityClient;

$.onConnect = function() {
    //
};

$.onData = function(data) {
    this.buf += data.toString('utf8');
    var p, str;
    while((p=this.buf.indexOf('\r\n')) != -1) {
        str = this.buf.substring(0, p);
        this.buf = this.buf.substr(p+2);
        try {
            this.emit('msg', JSON.parse(str));
        }
        catch(e) {
            console.error('Invalid JSON: >%s<', str);
            console.error(e.stack);
        }
    }
};

$.send = function(data) {
    var str = JSON.stringify(data);
    console.log('Send data to service:', str);
    this.stream.write(str+'\r\n');
};

$.close = function() {
    this.stream.end();
};

#!/usr/bin/env node

var parser = require('optimist')
    .boolean('service');
    //.string('install-user')

if(parser.argv.service) {
    // check prerequisites to start services
    if(process.getuid() !== 0) {
        console.error('"ubiquity --service" must be run as root');
        process.exit(1);
    }
    else {
        require('./service.js').launch();
    }
}
else {
    //
}


var $ = module.exports = {};

Accessor($, 'Interface')
Accessor($, 'UbiquityService', './lib/service.js');

$.services = {};
Accessor($.services, 'http', './lib/services/http.js');
Accessor($.services, 'dns', './lib/services/dns.js');

function Accessor(obj, name, file) {
    Object.defineProperty(obj, name, {
        get: function() {
            return require(file);
        }
    });
}


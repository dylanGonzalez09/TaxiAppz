// http-status v2 exports { default, status }; v1 exports the object directly.
const lib = require('http-status');

module.exports = lib.default || lib.status || lib;

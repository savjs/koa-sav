// require('babel-helpers')
// require("babel-core").buildExternalHelpers()
require('babel-register')
require('babel-polyfill')
require('babel-plugin-external-helpers')
require('./server.js')
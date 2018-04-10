const _ = require('lodash')
const reports = require('./reports')

reports.methods(['get', 'post', 'put', 'delete'])

module.exports = reports
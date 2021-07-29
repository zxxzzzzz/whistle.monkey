
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./mock-monkey.cjs.production.min.js')
} else {
  module.exports = require('./mock-monkey.cjs.development.js')
}

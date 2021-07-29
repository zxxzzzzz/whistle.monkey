
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./mock-monkey-core.cjs.production.min.js')
} else {
  module.exports = require('./mock-monkey-core.cjs.development.js')
}

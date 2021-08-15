
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./whistle.monkey.cjs.production.min.js')
} else {
  module.exports = require('./whistle.monkey.cjs.development.js')
}

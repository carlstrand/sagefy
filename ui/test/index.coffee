global.document = require('jsdom').jsdom()
global.window = document.parentWindow
global.Element = window.Element
global.XMLHttpRequest = window.XMLHttpRequest

chai = require('chai')
global.expect = chai.expect
global.sinon = require('sinon')
chai.use(require('sinon-chai'))

require('./basic')
require('./initialize')

require('./actions')
require('./modules')
require('./schemas')
require('./views')

const merge = require('lodash.merge')
const { required } = require('../../helpers/validations')
const cardSchema = require('../card')

module.exports = merge({}, cardSchema, {
  'data.body': {
    type: 'textarea',
    validations: [required],
  },
  'data.options': {
    type: 'list',
    validations: [required],
    columns: [
      {
        name: 'correct',
        type: 'select',
        options: [{ value: 'true' }, { value: 'false' }],
      },
      { name: 'value', type: 'text' },
      { name: 'feedback', type: 'text' },
    ],
  },
  'data.order': {
    type: 'select',
    validations: [required],
    options: [{ value: 'random' }, { value: 'set' }],
    default: 'random',
  },
  'data.max_options_to_show': {
    type: 'number',
    validations: [required],
    default: 4,
  },
})

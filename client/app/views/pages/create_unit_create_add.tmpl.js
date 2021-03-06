/* eslint-disable no-underscore-dangle */

const {
  div,
  h1,
  form,
  input,
  button,
  a,
  ul,
  li,
  p,
} = require('../../helpers/tags')
const icon = require('../components/icon.tmpl')
const previewUnitHead = require('../components/preview_unit_head.tmpl')
const { getIsLoggedIn } = require('../../selectors/base')
const spinner = require('../components/spinner.tmpl')
const goLogin = require('../../helpers/go_login')

module.exports = function createSubjectAdd(data) {
  if (getIsLoggedIn(data) === null) {
    return spinner()
  }

  if (!getIsLoggedIn(data)) {
    return goLogin()
  }

  const { searchResults } = data
  const inputOpts = {
    type: 'text',
    placeholder: 'Search Units',
    name: 'search',
    size: 40,
  }
  inputOpts.value = data.searchQuery || null

  return div(
    { id: 'create', className: 'page create--unit-create-add' },
    h1('Find Requires for New Unit'),
    a(
      { href: '/create/unit/create' },
      icon('back'),
      ' Back to Create Unit form'
    ),
    form(
      { className: 'form--horizontal create--unit-create-add__form' },
      div({ className: 'form-field form-field--search' }, input(inputOpts)),
      button(
        {
          type: 'submit',
          className: 'create--unit-create-add__search',
        },
        icon('search'),
        ' Search'
      )
    ),
    searchResults && searchResults.length
      ? ul(
          { className: 'create--unit-create-add__results' },
          searchResults.map(result =>
            li(
              a(
                {
                  href: '/create/unit/create',
                  className: 'create--unit-create-add__add',
                  'data-id': result._id,
                  'data-name': result._source.name,
                  'data-body': result._source.body,
                },
                icon('create'),
                ' Require this Unit'
              ),
              previewUnitHead({
                name: result._source.name,
                body: result._source.body,
              })
            )
          )
        )
      : p('No results.')
  )
}

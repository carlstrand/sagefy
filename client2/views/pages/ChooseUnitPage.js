/*
const { div, h1, ul, li, a, h3, span, hgroup } = require('../../helpers/tags')
// const c = require('../../helpers/content').get
const spinner = require('../components/spinner.tmpl')
const icon = require('../components/icon.tmpl')
const previewUnitHead = require('../components/preview_unit_head.tmpl')
const { getIsLoggedIn } = require('../../selectors/base')
const goLogin = require('../../helpers/go_login')

module.exports = data => {
  if (getIsLoggedIn(data) === null) {
    return spinner()
  }

  if (!getIsLoggedIn(data)) {
    return goLogin()
  }
  if (!Object.keys(data.chooseUnit).length) {
    return spinner()
  }
  return div(
    { id: 'choose-unit', className: 'page' },
    Object.keys(data.unitLearned).length
      ? hgroup(
          h1('What\'s next?'),
          h3(
            icon('good'),
            ' You just finished a unit! Pick the next one to learn:'
          )
        )
      : h1('Where should we start?'),
    ul(
      { id: data.chooseUnit.subject.entity_id, className: 'units' },
      data.chooseUnit.units.slice(0, 5).map((unit, index) =>
        li(
          { className: index === 0 ? 'recommended' : null },
          a(
            {
              id: unit.entity_id,
              className: `choose-unit__engage${
                index === 0 ? ' choose-unit__engage--first' : ''
              }`,
            },
            'Engage ',
            icon('next')
          ),
          div(
            index === 0
              ? span(
                  { className: 'choose-unit__recommended' },
                  icon('learn'),
                  ' Recommended'
                )
              : null,
            previewUnitHead({
              name: unit.name,
              body: unit.body,
            })
            // TODO-2 % learned
          )
        )
      )
    )
  )
}




const closest = require('../../helpers/closest')

module.exports = (store, broker) => {
  const { getTasks } = store
  broker.add({
    'click .choose-unit__engage'(e, el) {
      if (e) {
        e.preventDefault()
      }
      const ul = closest(el, 'ul')
      getTasks().chooseUnit(ul.id, el.id)
    },
  })
}
*/
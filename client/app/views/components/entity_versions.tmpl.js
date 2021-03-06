const capitalize = require('lodash.capitalize')
const { h2, ul, li, span, a } = require('../../helpers/tags')
const timeago = require('./timeago.tmpl')
const icon = require('./icon.tmpl')

module.exports = (kind, entityID, versions) => [
  h2('Versions'),
  ul(
    { className: 'entity-versions' },
    versions &&
      versions.map(version =>
        li(
          timeago(version.created, { right: true }),
          span(
            {
              className: `entity-versions__status--${version.status}`,
            },
            capitalize(version.status)
          ),
          ' ',
          version.name
        )
      ),
    li(
      a(
        { href: `/${kind}s/${entityID}/versions` },
        '... See more version history ',
        icon('next')
      )
    )
  ),
]

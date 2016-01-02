{div, h1, form, input, button, img,
 i, ul, li, strong, a, p, span} = require('../../modules/tags')
c = require('../../modules/content').get
{truncate, timeAgo, ucfirst} = require('../../modules/auxiliaries')

# TODO-0 populate using location query parameters
# TODO-0 "result._source.topic is undefined" when searching for "doris"

module.exports = (data) ->
    loading = data.searchQuery and not data.searchResults
    asLearner = data.route.indexOf('as_learner') > -1

    return div(
        {id: 'search', className: 'col-8'}
        h1('Search')
        # TODO-2 add search filtering / ordering
        form(
            {className: 'form--horizontal'}
            div(
                {className: 'form-field form-field--search'}
                input({
                    type: 'search'
                    placeholder: 'Search'
                    name: 'search'
                    size: 40
                })
            )
            button(
                {type: 'submit'}
                i({className: 'fa fa-search'})
                ' Search'
            )
        )
        div({className: 'spinner'}) if loading
        ul(
            li(
                r[result._type + 'Result'](result, asLearner)
            ) for result in data.searchResults
        ) if data.searchResults?.length
        p('No results found.') if data.searchResults?.length is 0
    )

    # TODO-2 pagination

r = {}

r.userResult = (result) ->
    return [
        strong('User')
        ': '
        a(
            {href: "/users/#{result._source.id}"}
            img({className: 'avatar', src: result._source.avatar})
            ' '
            result._source.name
        )
    ]

r.topicResult = (result) ->
    return [
        span(
            {className: 'timeago'}
            timeAgo(result._source.created)
        )
        strong('Topic')
        ': '
        a(
            {href: "/topics/#{result._source.id}"}
            result._source.name
        )
        ', '
        a(
            {href: "/#{result._source.entity.kind}/#{result._source.entity.id}"}
            result._source.entity.name
        )
        # TODO-2 no of posts     ???
    ]

r.postResult = (result) ->
    href = "/topics/#{result._source.topic_id}##{result._source.id}"
    return [
        span(
            {className: 'timeago'}
            timeAgo(result._source.created)
        )
        strong(ucfirst(result._source.kind))
        ': '
        a(
            {href}
            truncate(result._source.body, 40)
        )
        ' by '
        a(
            {href: "/users/#{result._source.user.id}"}
            result._source.user.name
        )
        ' in topic: '
        a(
            {href: "/topics/#{result._source.topic.id}"}
            result._source.topic.name
        )
        # TODO-3 entity kind       result._source.topic_id > ????
        # TODO-3 entity name       result._source.topic_id > ????
    ]

r.cardResult = (result) ->
    return [
        strong('Card')
        ': '
        a(
            {href: "/cards/#{result._source.entity_id}"}
            result._source.name
        )
        # TODO-3 unit name   result._source.unit_id > ???
        # TODO-3 contents    ???
    ]

r.unitResult = (result) ->
    return [
        strong('Unit')
        ': '
        a(
            {href: "/units/#{result._source.entity_id}"}
            result._source.name
        )
        ' – '
        truncate(result._source.body, 40)
    ]

r.setResult = (result, asLearner = false) ->
    return [
        a(  # TODO-2 if already in sets, don't show this button
            {
                id: result._source.entity_id
                href: '#'
                className: 'add-to-my-sets'
            }
            'Add to My Sets'
        ) if asLearner
        strong('Set')
        ': '
        a(
            {href: "/sets/#{result._source.entity_id}"}
            result._source.name
        )
        ' – '
        truncate(result._source.body, 40)
        ' ' if asLearner
        a(
            {
                href: "/sets/#{result._source.entity_id}/tree"
                className: 'view-units'
            }
            'View Units'
        ) if asLearner
    ]

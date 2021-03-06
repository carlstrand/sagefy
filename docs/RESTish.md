---
layout: docs
title: RESTish
---

General REST ideas, but made more practical.

- Requests
  - URL format is `/s/noun/id/noun/id?params`
    - Use plural, all lowercase, nouns.
    - Concrete is better than abstract.
    - ID can be reference.
      - Current, recent...
    - Everything else in query string.
    - Search, sort, filter, fields (embed), paginate...
    - Use SSL if possible.
    - If no resource, pseudo resource or root level verb.
  - Verbs: GET, POST, PUT, DELETE, OPTIONS
    - Get: GET `/bunnies/id`
    - List: GET `/bunnies`
    - Create: POST `/bunnies`
    - Update: PUT `/bunnies/id`
    - Delete: DELETE `/bunnies/id`
    - Methods: OPTIONS `/bunnies`
  - Parameters
    - Use database or HTTP words over invention.
    - Pagination: use `limit` and `skip`.
    - method=x with POST for PUT, and DELETE.
    - Use OAuth latest.
    - Stateless except for authorization.
    - Version: use `?version=`. Defaults to latest version.
- Responses
  - Assume JSON.
  - Fields in lower camelCase.
  - No root level arrays.
  - Use [ISO8601](http://en.wikipedia.org/wiki/ISO_8601) for dates and times.
  - Use [response codes](https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html). In order...
    - 301: Is the resource somewhere else?
    - 401: Does the user need to be logged in?
    - 404: Can we find what they are asking for?
    - 403: Do they have permission?
    - 409: Can they take this action?
    - 400: Are the parameters good?
    - 201: Was something created?
    - 204: Is there no body?
    - 200: Success
  - Success: Wrap objects in type of object. Return `{bunnies:[]}` or `{bunny:{}}`
    - Provide full resources.
    - Updates (POST, PUT) should return object as well.
    - Include links to related requests. [RFC5988](https://tools.ietf.org/html/rfc5988)
      - `{bunnies:[{id:1,links:[]}],links:[]}`
      - Give kind: get, list, create, update, delete, next, prev, self, parent, child
    - Aim for orthogonal updates and deletes (PUT, DELETE).
    - Return all parameters under `parameters:`.
  - Errors: return `{errors:[ {message: ""} ]}`.
  - GZip everything.
  - Cache everything.
  - Document each point.

RESTish References
------------------

- http://info.apigee.com/Portals/62317/web%20api.pdf
- [Best Practices for Designing a Pragmatic RESTful API](http://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api)
- [Google JSON Style Guide](https://google-styleguide.googlecode.com/svn/trunk/jsoncstyleguide.xml)
- [Best practices for designing pragmatic RESTful api](http://www.slideshare.net/mario_cardinal/best-practices-for-designing-pragmatic-restful-api)
- [HTTP API Design Guide](https://github.com/interagent/http-api-design)

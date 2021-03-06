const matchesRoute = require('../helpers/matches_route')
const request = require('../helpers/request')

module.exports = store => {
  const { getTasks, dispatch } = store
  store.addTasks({
    getSubject(id) {
      dispatch({ type: 'GET_SUBJECT', id })
      return request({
        method: 'GET',
        url: `/s/subjects/${id}`,
        data: {},
        rq: store.requestCookie, // SSR only
      })
        .then(response => {
          const { subject } = response
          subject.unit = response.unit
          dispatch({
            type: 'ADD_SUBJECT',
            message: 'get subject success',
            subject,
          })
        })
        .catch(errors => {
          dispatch({
            type: 'SET_ERRORS',
            message: 'get subject failure',
            errors,
          })
        })
    },

    getRecommendedSubjects() {
      dispatch({ type: 'GET_RECOMMENDED_SUBJECTS' })
      return request({
        method: 'GET',
        url: '/s/subjects/recommended',
        data: {},
        rq: store.requestCookie, // SSR only
      })
        .then(response => {
          dispatch({
            type: 'SET_RECOMMENDED_SUBJECTS',
            message: 'get recommended subjects success',
            recommendedSubjects: response.subjects,
          })
        })
        .catch(errors => {
          dispatch({
            type: 'SET_ERRORS',
            message: 'get recommended subjects failure',
            errors,
          })
        })
    },

    listSubjectVersions(id) {
      dispatch({ type: 'LIST_SUBJECT_VERSIONS', id })
      return request({
        method: 'GET',
        url: `/s/subjects/${id}/versions`,
        data: {},
        rq: store.requestCookie, // SSR only
      })
        .then(response => {
          dispatch({
            type: 'ADD_SUBJECT_VERSIONS',
            versions: response.versions,
            entity_id: id,
            message: 'list subject versions success',
          })
        })
        .catch(errors => {
          dispatch({
            type: 'SET_ERRORS',
            message: 'list subject versions failure',
            errors,
          })
        })
    },

    getSubjectTree(id) {
      dispatch({ type: 'GET_SUBJECT_TREE', id })
      return request({
        method: 'GET',
        url: `/s/subjects/${id}/tree`,
        data: {},
        rq: store.requestCookie, // SSR only
      })
        .then(response => {
          dispatch({
            type: 'ADD_SUBJECT_TREE',
            message: 'get subject tree success',
            tree: response,
            id,
          })
        })
        .catch(errors => {
          dispatch({
            type: 'SET_ERRORS',
            message: 'get subject tree failure',
            errors,
          })
        })
    },

    selectTreeUnit(id) {
      dispatch({
        type: 'SET_CURRENT_TREE_UNIT',
        id,
      })
    },

    getSubjectUnits(id) {
      dispatch({ type: 'GET_SUBJECT_UNITS', id })
      return request({
        method: 'GET',
        url: `/s/subjects/${id}/units`,
        data: {},
        rq: store.requestCookie, // SSR only
      })
        .then(response => {
          dispatch({
            type: 'SET_CHOOSE_UNIT',
            chooseUnit: response,
            message: 'get subject units success',
          })
          dispatch({
            type: 'SET_NEXT',
            next: response.next,
          })
        })
        .catch(errors => {
          dispatch({
            type: 'SET_ERRORS',
            message: 'get subject units failure',
            errors,
          })
        })
    },

    chooseUnit(subjectId, unitId) {
      dispatch({ type: 'CHOOSE_UNIT', subjectId, unitId })
      return request({
        method: 'POST',
        url: `/s/subjects/${subjectId}/units/${unitId}`,
        data: {},
        rq: store.requestCookie, // SSR only
      })
        .then(response => {
          dispatch({ type: 'CHOOSE_UNIT_SUCCESS', subjectId, unitId })
          const { next } = response
          dispatch({
            type: 'SET_NEXT',
            next,
          })
          getTasks().updateMenuContext({
            subject: subjectId,
            unit: unitId,
            card: false,
          })
          const args = matchesRoute(next.path, '/s/cards/{id}/learn')
          if (args) {
            getTasks().route(`/cards/${args[0]}/learn`)
          }
        })
        .catch(errors => {
          dispatch({
            type: 'SET_ERRORS',
            message: 'choose unit failure',
            errors,
          })
        })
    },

    getMyRecentSubjects() {
      dispatch({ type: 'GET_MY_RECENT_SUBJECTS' })
      return request({
        method: 'GET',
        url: '/s/subjects:get_my_recently_created',
        data: {},
        rq: store.requestCookie, // SSR only
      })
        .then(response => {
          dispatch({
            type: 'SET_MY_RECENT_SUBJECTS',
            subjects: response.subjects,
          })
        })
        .catch(errors => {
          dispatch({
            type: 'SET_ERRORS',
            message: 'get my recent subjects failure',
            errors,
          })
        })
    },

    createNewSubjectVersion(data) {
      dispatch({ type: 'CREATE_NEW_SUBJECT_VERSION' })
      return request({
        method: 'POST',
        url: '/s/subjects/versions',
        data,
        rq: store.requestCookie, // SSR only
      })
        .then(response => {
          dispatch({ type: 'CREATE_NEW_SUBJECT_VERSION_SUCCESS' })
          return response
        })
        .catch(errors => {
          dispatch({
            type: 'SET_ERRORS',
            message: 'create new subject version failure',
            errors,
          })
        })
    },

    createExistingSubjectVersion(data) {
      dispatch({ type: 'CREATE_EXISTING_SUBJECT_VERSION' })
      return request({
        method: 'POST',
        url: `/s/subjects/${data.entity_id}/versions`,
        data,
        rq: store.requestCookie, // SSR only
      })
        .then(response => {
          dispatch({ type: 'CREATE_EXISTING_SUBJECT_VERSION_SUCCESS' })
          return response
        })
        .catch(errors => {
          dispatch({
            type: 'SET_ERRORS',
            message: 'create existing subject version failure',
            errors,
          })
        })
    },
  })
}

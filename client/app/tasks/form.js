const { validateFormData } = require('../helpers/forms')

module.exports = store => {
  const { dispatch } = store
  store.addTasks({
    updateFormData(data) {
      dispatch({
        data,
        message: 'update form data',
        type: 'SET_FORM_DATA',
      })
    },

    validateForm(data, schema, fields) {
      const errors = validateFormData(data, schema, fields)
      if (errors.length) {
        dispatch({
          type: 'SET_ERRORS',
          message: 'validate form - invalid',
          errors,
        })
        return errors
      }
      dispatch({ type: 'FORM_IS_VALID' })
      return null
    },

    addListFieldRow(values, name, columns) {
      dispatch({
        type: 'ADD_LIST_FIELD_ROW',
        message: 'add list field row',
        values,
        name,
        columns,
      })
    },

    removeListFieldRow(values, name, index) {
      dispatch({
        type: 'REMOVE_LIST_FIELD_ROW',
        message: 'remove list field row',
        values,
        name,
        index,
      })
    },
  })
}

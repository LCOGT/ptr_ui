/**
 *  This module stores state related to development tools.
 */

// initial state
const state = {
  /* Prod API urls are used by default by both the prod and dev branches currently,
    except in cases (calendar, projects, status) where the dev endpoint is in use.

    Eventual switch to prod site using prod endpoints, dev site using dev endpoints,
    and all other testing on test endpoints to come.

    Endpoints listed as 'nonexistent currently' have not yet been defined in their
    respective backend repositories.
    */

  active_api: 'https://api.photonranch.org/api', // prod
  // active_api: 'https://api.photonranch.org/dev', // dev

  jobs_api: 'https://jobs.photonranch.org/jobs', // prod
  // jobs_api: 'https://jobs.photonranch.org/dev', // dev

  calendar_api: 'https://calendar.photonranch.org/calendar', // prod
  // calendar_api: 'https://calendar.photonranch.org/dev', // dev

  projects_endpoint: 'https://projects.photonranch.org/projects', // prod
  // projects_endpoint: 'https://projects.photonranch.org/dev', // dev

  logs_endpoint: 'https://logs.photonranch.org/logs', // prod
  // logs_endpoint: 'https://logs.photonranch.org/dev',  // dev

  quickanalysis_endpoint: 'https://quickanalysis.photonranch.org',
  // quickanalysis_endpoint: 'http://localhost:5000',

  status_endpoint: 'https://status.photonranch.org/status', // prod
  // status_endpoint: 'https://status.photonranch.org/dev' // dev

  observationPortalApiUrl: 'http://127.0.0.1:8000/api'
}

// getters
const getters = {
  api: state => state.active_api
}

// actions
const actions = {
  set_active_api ({ commit }, api_name) {
    commit('active_api', api_name)
  }
}

// mutations
const mutations = {
  active_api (state, api_name) {
    state.active_api = api_name
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations

}

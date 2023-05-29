
import axios from 'axios'
import moment from 'moment'
import { ToastProgrammatic as Toast } from 'buefy'
import { getInstance } from '../../auth/index' // get user object: getInstance().user

async function getAuthRequestHeader () {
  let token
  try {
    const instance = await getInstance()
    token = await instance.getTokenSilently()
  } catch (err) {
    console.warn('Token request stopped.')
  }

  const header = {
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      'Authorization': `Bearer ${token}`
    }
  }

  return header
}

// initial state
const state = {

  user_events: [],
  user_events_is_loading: false,

  user_projects: [],
  user_projects_is_loading: false,

  all_projects: [],
  all_projects_is_loading: false,

  // Available to admin users only: if true, fetch and display projects from all users
  show_everyones_projects: false
}

// getters
const getters = {
  api: state => state.active_api
}

// actions
const actions = {

  // refreshProjectsTableData automatically chooses whether to run fetchUserProjects or fetchAllProjects
  // based on whether the projects table is set to show everyones projects or just
  // the current user's.
  async refreshProjectsTableData ({ state, dispatch }, user_id) {
    if (state.show_everyones_projects) {
      dispatch('fetchAllProjects')
    } else {
      dispatch('fetchUserProjects', user_id)
    }
  },

  async fetchUserProjects ({ commit, rootState }, user_id) {
    // This happens when the method is called before the current user is loaded.
    if (user_id === undefined) return

    commit('user_projects_is_loading', true)

    const url = rootState.api_endpoints.projects_endpoint + '/get-user-projects'
    const body = { user_id }
    const header = await getAuthRequestHeader()

    axios.post(url, body, header).then(response => {
      commit('user_projects_is_loading', false)
      commit('user_projects', response.data)
    }).catch(err => {
      commit('user_projects_is_loading', false)
      console.warn('error fetching user projects: ', err)
      console.warn('user: ', user_id)
    })
  },
  async fetchAllProjects ({ commit, rootState }) {
    commit('all_projects_is_loading', true)

    const url = rootState.api_endpoints.projects_endpoint + '/get-all-projects'
    const body = {}
    const header = await getAuthRequestHeader()

    axios.post(url, body, header).then(response => {
      commit('all_projects_is_loading', false)
      commit('all_projects', response.data)
    }).catch(err => {
      commit('all_projects_is_loading', false)
      console.warn('error fetching user projects: ', err)
    })
  },

  fetchUserEvents ({ commit, rootState }, user_id) {
    commit('user_events_is_loading', true)

    const url = rootState.api_endpoints.calendar_api + '/user-events-ending-after-time'
    const header = {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      }
    }
    const body = {
      time: moment().utc().format(),
      user_id
    }
    axios.post(url, body, header).then(response => {
      commit('user_events_is_loading', false)
      commit('user_events', response.data)
    }).catch(err => {
      commit('user_events_is_loading', false)
      console.warn('error fetching user events: ', err)
      console.warn('user: ', user_id)
    })
  },

  async deleteProject ({ state, commit, dispatch, rootState }, { project_name, created_at }) {
    // Start the projects table loading animation
    if (state.show_everyones_projects) {
      commit('all_projects_is_loading', true)
    } else {
      commit('user_projects_is_loading', true)
    }

    // Prepare the projects api request
    const url = rootState.api_endpoints.projects_endpoint + '/delete-project'
    const header = await getAuthRequestHeader()
    const body = {
      project_name,
      created_at
    }

    axios.post(url, body, header).then(async response => {
      // If success, refresh the list of projects
      const user = await getInstance().user.sub
      dispatch('refreshProjectsTableData', user)

      // Notify user with small success message
      Toast.open({
        duration: 5000,
        message: 'Successfully deleted project ' + project_name,
        position: 'is-bottom',
        type: 'is-info'
      })
    }).catch(err => {
      // End the projects table loading animation.
      // Note: no need to end in the successful block above
      // because it will be covered during refresh. Additionally,
      // we want to avoid ending the loading and immediately restarting it
      // when the refresh action is dispatched.
      if (state.show_everyones_projects) {
        commit('all_projects_is_loading', false)
      } else {
        commit('user_projects_is_loading', false)
      }

      // Notify user of failure with small message
      Toast.open({
        duration: 5000,
        message: "Couldn't delete project.",
        position: 'is-bottom',
        type: 'is-danger'
      })
      console.warn('error deleting project ', err)
      console.warn(err)
    })
  },

  updateProjectInEvent ({ dispatch, rootState }, { event, project_name, created_at }) {
    /* arg 'event' is the event object we want to update. Must include 'event_id' and 'start' */

    const url = rootState.api_endpoints.calendar_api + '/add-projects-to-events'

    const header = {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      }
    }
    const project_id = (project_name == 'none') ? 'none' : `${project_name}#${created_at}`
    const body = {
      project_id,
      events: [event]
    }
    axios.post(url, body, header).then(async response => {
      const user = await getInstance().user.sub
      dispatch('fetchUserEvents', user)
    }).catch(err => {
      console.warn('error fetching user events: ', err)
    })
  }

}

// mutations
const mutations = {
  user_events (state, val) { state.user_events = val },
  user_events_is_loading (state, val) { state.user_events_is_loading = val },

  user_projects (state, val) { state.user_projects = val },
  user_projects_is_loading (state, val) { state.user_projects_is_loading = val },

  all_projects (state, val) { state.all_projects = val },
  all_projects_is_loading (state, val) { state.all_projects_is_loading = val },

  show_everyones_projects (state, val) { state.show_everyones_projects = val }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}

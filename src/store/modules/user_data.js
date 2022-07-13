
import axios from "axios"
import moment from "moment"
import { ToastProgrammatic as Toast } from 'buefy'
import { getInstance } from '../../auth/index' // get user object: getInstance().user


async function getAuthRequestHeader() {
    let token, configWithAuth;
    try {
        let instance = await getInstance()
        token = await instance.getTokenSilently(); 
    } catch(err) {
        console.warn("Token request stopped.")
    }

    let header = {
        'headers': {
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
}

// getters
const getters = {
    api: state => state.active_api,
}

// actions
const actions = {

    async fetchUserProjects({ commit, rootState }, user_id) {
        
        // This happens when the method is called before the current user is loaded.
        if (user_id===undefined) return;

        commit('user_projects_is_loading', true)

        const url = rootState.api_endpoints.projects_endpoint + '/get-user-projects'
        const body = {user_id: user_id}
        let header = await getAuthRequestHeader()


        axios.post(url, body, header).then(response => {
            commit('user_projects_is_loading', false)
            commit('user_projects', response.data)
        }).catch(err => {
            commit('user_projects_is_loading', false)
            console.warn('error fetching user projects: ', err)
            console.warn("user: ",user_id)
        })
    },
    async fetchAllProjects({ commit, rootState}) {
        
        commit('all_projects_is_loading', true)

        const url = rootState.api_endpoints.projects_endpoint + '/get-all-projects'
        const body = {}
        let header = await getAuthRequestHeader()

        axios.post(url, body, header).then(response => {
            commit('all_projects_is_loading', false)
            commit('all_projects', response.data)
        }).catch(err => {
            commit('all_projects_is_loading', false)
            console.warn('error fetching user projects: ', err)
        })
    },

    fetchUserEvents({ commit, rootState }, user_id) {
        commit('user_events_is_loading', true)

        const url = rootState.api_endpoints.calendar_api + '/user-events-ending-after-time'
        const header = {
            'headers': {
                'Content-Type': 'application/json;charset=UTF-8',
            }
        }
        let body = {
            "time": moment().utc().format(),
            "user_id": user_id,
        }
        axios.post(url, body, header).then(response => {
            commit('user_events_is_loading', false)
            commit('user_events', response.data)
        }).catch(err => {
            commit('user_events_is_loading', false)
            console.warn("error fetching user events: ", err)
            console.warn("user: ",user_id)
        })
    },

    async deleteProject({ dispatch, rootState }, {project_name,created_at}) {
        const url = rootState.api_endpoints.projects_endpoint + '/delete-project'
        let header = await getAuthRequestHeader()
        let body = {
            project_name:project_name,
            created_at: created_at
        }

        axios.post(url, body, header).then(async response => {
            let user = await getInstance().user.sub
            dispatch('fetchUserProjects', user)
            Toast.open({
                duration: 5000,
                message: "Successfully deleted project "+project_name,
                position: 'is-bottom',
                type: 'is-info' ,
            })
        }).catch(err => {
            Toast.open({
                duration: 5000,
                message: "Couldn't delete project.",
                position: 'is-bottom',
                type: 'is-danger' ,
            })
            console.warn('error deleting project ', err)
            console.warn(err)
        })
    },

    updateProjectInEvent({ dispatch, rootState }, {event, project_name,created_at}) {
        /* arg 'event' is the event object we want to update. Must include 'event_id' and 'start' */

        const url = rootState.api_endpoints.calendar_api + '/add-projects-to-events'

        const header = {
            'headers': {
                'Content-Type': 'application/json;charset=UTF-8',
            }
        }
        let project_id = (project_name=="none") ? "none" : `${project_name}#${created_at}`
        let body = {
            "project_id": project_id,
            "events": [event],
        }
        axios.post(url, body, header).then(async response => {
            let user = await getInstance().user.sub
            dispatch('fetchUserEvents', user)
        }).catch(err => {
            console.warn("error fetching user events: ", err)
        })
    },

}

// mutations
const mutations = {
    user_events(state, val) { state.user_events = val},
    user_events_is_loading(state, val) { state.user_events_is_loading = val},

    user_projects(state, val) { state.user_projects = val},
    user_projects_is_loading(state, val) { state.user_projects_is_loading = val},

    all_projects(state, val) { state.all_projects = val},
    all_projects_is_loading(state, val) { state.all_projects_is_loading = val},
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}

import axios from "axios"
import moment from "moment"
import { ToastProgrammatic as Toast } from 'buefy'
import { getInstance } from '../../auth/index' // get user object: getInstance().user


async function getAuthRequestHeader() {
    let token, configWithAuth;
    try {
        let instance = await getInstance()
        token = instance.getTokenSilently(); 
    } catch(err) {
        console.error(err)
        console.warn('Did not acquire the needed token. Stopping request.')
        
        //// small popup notification
        //Toast.open({
            //duration: 5000,
            //message: "Oops! You aren't authorized to do that.",
            //position: 'is-bottom',
            //type: 'is-danger' ,
        //})
    }

    let header = {
        'headers': {
        'Content-Type': 'application/json;charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
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
}

// getters
const getters = {
    api: state => state.active_api,
}

// actions
const actions = {

    async fetchUserProjects({ commit }, user_id) {
        commit('user_projects_is_loading', true)

        let url = 'https://projects.photonranch.org/dev'
        url += '/get-user-projects'
        
        let header = await getAuthRequestHeader()

        let body = {user_id: user_id}

        axios.post(url, body, header).then(response => {
            commit('user_projects_is_loading', false)
            commit('user_projects', response.data)
        }).catch(err => {
            commit('user_projects_is_loading', false)
            console.log('error fetching user projects: ', err)
            console.log("user: ",user_id)
        })
    },

    fetchUserEvents({ commit }, user_id) {
        commit('user_events_is_loading', true)

        let url = 'https://calendar.photonranch.org'
        url += '/dev/user-events-ending-after-time'

        const header = {
            'headers': {
                'Content-Type': 'application/json;charset=UTF-8',
                'Access-Control-Allow-Origin': '*',
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
            console.log("error fetching user events: ", err)
            console.log("user: ",user_id)
        })
    },

    async deleteProject({ dispatch }, {project_name,created_at}) {
        let url = 'https://projects.photonranch.org/dev'
        url += '/delete-project'
        
        let header = await getAuthRequestHeader()

        let body = {
            project_name:project_name,
            created_at: created_at
        }

        axios.post(url, body, header).then(async response => {
            console.log(response)
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
            console.log('error deleting project ', err)
            console.log(err)
        })
    },

    updateProjectInEvent({dispatch}, {event, project_name,created_at}) {
        /* arg 'event' is the event object we want to update. Must include 'event_id' and 'start' */

        let url = 'https://calendar.photonranch.org'
        url += '/dev/add-projects-to-events'

        const header = {
            'headers': {
                'Content-Type': 'application/json;charset=UTF-8',
                'Access-Control-Allow-Origin': '*',
            }
        }
        let project_id = (project_name=="none") ? "none" : `${project_name}#${created_at}`
        let body = {
            "project_id": project_id,
            "events": [event],
        }
        console.log(body)
        axios.post(url, body, header).then(async response => {
            let user = await getInstance().user.sub
            dispatch('fetchUserEvents', user)
            console.log(response.data)
        }).catch(err => {
            console.log("error fetching user events: ", err)
        })
    },

}

// mutations
const mutations = {
    user_events(state, val) { state.user_events = val},
    user_events_is_loading(state, val) { state.user_events_is_loading = val},

    user_projects(state, val) { state.user_projects = val},
    user_projects_is_loading(state, val) { state.user_projects_is_loading = val},
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
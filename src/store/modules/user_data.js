/**
 *  This module stores state related to development tools. 
 */

import axios from "axios"
import moment from "moment"
import { ToastProgrammatic as Toast } from 'buefy'
import { getInstance } from '../../auth/index' // get user object: getInstance().user


async function getAuthRequestHeader() {
    let token, configWithAuth;
    try {
        token = await getInstance().getTokenSilently(); 
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
    console.log('header', header)

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

        let url = 'https://a85vsflfd2.execute-api.us-east-1.amazonaws.com/dev'
        url += '/get-user-projects'
        
        let header = await getAuthRequestHeader()

        let body = {user_id: user_id}

        axios.post(url, body, header).then(response => {
            commit('user_projects_is_loading', false)
            commit('user_projects', response.data)
        }).catch(err => {
            commit('user_projects_is_loading', false)
            console.log('error fetching user projects: ', err)
        })
    },

    fetchUserEvents({ commit }, user_id) {
        commit('user_events_is_loading', true)

        let url = 'https://m1vw4uqnpd.execute-api.us-east-1.amazonaws.com'
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
            console.log(response.data)
        }).catch(err => {
            commit('user_events_is_loading', false)
            console.log("error fetching user events: ", err)
        })
    },

    async deleteProject({ dispatch }, project_id) {
        let url = 'https://a85vsflfd2.execute-api.us-east-1.amazonaws.com/dev'
        url += '/delete-project-by-id'
        
        let header = await getAuthRequestHeader()

        let body = {project_id: project_id}

        axios.post(url, body, header).then(async response => {
            console.log(response)
            let user = await getInstance().user.sub
            dispatch('fetchUserProjects', user)
            Toast.open({
                duration: 5000,
                message: "Successfully deleted project "+project_id.split('#')[0],
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

    }

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
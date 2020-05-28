/**
 *  This module stores state related to development tools. 
 */

import axios from "axios"
import moment from "moment"


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

    fetchUserProjects({ commit }, user_id) {
        commit('user_projects_is_loading', true)

        let url = 'https://a85vsflfd2.execute-api.us-east-1.amazonaws.com/dev'
        url += '/get-user-projects'

        let body = {user_id: user_id}

        axios.post(url, body).then(response => {
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
/**
 *  This module stores state related to development tools. 
 */

// Get the saved value of the api to use (local or not).
function init_active_api() {
    let active_api = localStorage.getItem('ptrui-active-api') || APIs.ptr_api.endpoint;
    return active_api
}

const APIs = {
    ptr_api: {
        // This is the production api.
        name: "ptr-api",
        endpoint: "https://api.photonranch.org",
        //custom_header: async () => {
            //return { Authorization: 'Bearer '+(await Auth.currentSession()).accessToken.jwtToken }
        //}
    },
    ptr_api_local: {
        // This is a copy of the production api running locally. Used for testing.
        name: "ptr-api-local",
        endpoint: "http://localhost:5000",
        //custom_header: async () => {
        //  return { Authorization: 'Bearer '+(await Auth.currentSession()).accessToken.jwtToken }
        //}
    },
}

// initial state
const state = {
    active_api: init_active_api(), 
}

// getters
const getters = {
    api: state => state.active_api,
}

// actions
const actions = {
    set_active_api({ commit }, api_name) {
        localStorage.setItem('ptrui-active-api', api_name)
        commit('active_api', api_name)
    }
}

// mutations
const mutations = {
    active_api(state, api_name) {
        state.active_api = api_name
    },
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
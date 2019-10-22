/**
 *  This module stores state related to development tools. 
 */

// Get the saved value of the api to use (local or not).
function init_active_api() {
    let active_api = localStorage.getItem('ptrui-active-api') || 'ptr-api';
    return active_api
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
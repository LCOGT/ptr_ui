/**
 *  This module stores state related to development tools. 
 */


// initial state
const state = {
    //active_api: "https://api.photonranch.org", 
    active_api: "https://api.photonranch.org/api", 
}

// getters
const getters = {
    api: state => state.active_api,
}

// actions
const actions = {
    set_active_api({ commit }, api_name) {
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
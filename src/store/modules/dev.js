/**
 *  This module stores state related to development tools. 
 */


// initial state
const state = {
    active_api: "https://api.photonranch.org/api", 
    //active_api: "https://api.photonranch.org/test", 
    jobs_api: "https://jobs.photonranch.org/jobs",
    //jobs_api: "https://jobs.photonranch.org/test",
    calendar_api: "https://calendar.photonranch.org/dev",

    projects_endpoint: "https://projects.photonranch.org/dev", // prod endpoint

    logs_endpoint: "https://logs.photonranch.org/logs",  // prod
    //logs_endpoint: "https://logs.photonranch.org/dev",  // dev

    logs_ws_endpoint: "wss://l932c9n1r3.execute-api.us-east-1.amazonaws.com/prod",  // prod
    //logs_ws_endpoint: "wss://8t7v3l1ok5.execute-api.us-east-1.amazonaws.com/dev", // dev

    quickanalysis_endpoint: "http://quickanalysis.photonranch.org",
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

// initial state
const state = {
    active_api: 'ptr-api', 
}

// getters
const getters = {
    api: state => state.active_api,
}

// actions
const actions = {
    use_local_api({ commit }) {
        commit('active_api','ptr-api-local')
    },
    use_production_api({ commit }) {
        commit('active_api','ptr-api')
    },
}

// mutations
const mutations = {
    active_api(state, api_name) {
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
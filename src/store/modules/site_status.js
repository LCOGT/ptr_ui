import axios from 'axios'

// initial state
const state = {
    status: {
        observing_conditions: {},
    },
}

// getters
const getters = {
    status: state => state.status,

    sky_temp: (state, rootGetters) => state.status.observing_conditions[rootGetters['site_config/weather']].temperature_C || '-'

}

// mutations
const mutations = {
    status: (state,val) => {state.status = val}, 
}

// actions
const actions = {
    newStatus({ commit }, status) {
        console.log(status)
    },

}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}



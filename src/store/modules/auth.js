
// initial state
const state = {
    user: ''
}

// getters
const getters = {
    user: state => state.user,
    username: state => state.user.username,
    isLoggedIn: state => state.user !== '',
    getToken: state => {
        try {
            return state.user.signInUserSession.idToken.jwtToken
        } catch {
            return ''
        }
    }
}

// actions
const actions = {
    log_in_user({ commit, dispatch }, user) {
        commit('setUser', user)
        dispatch('observatory_configuration/update_config', null, {root: true})
    }
}

// mutations
const mutations = {
    setUser(state, user) {
        state.user = user
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
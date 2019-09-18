import { Auth } from 'aws-amplify'

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
        dispatch('images/refresh_latest_images', null, {root: true})
    },

    logInUser({ commit, dispatch }, user_credentials) {
        let username = user_credentials.username
        let password = user_credentials.password
        Auth.signIn({ username: username, password: password, region: 'us-west-2' })
            .then(user => {
                console.log(user)
                commit('setUser', user)
                dispatch('observatory_configuration/update_config', null, {root: true})
                dispatch('images/refresh_latest_images', null, {root: true})
            })
            .catch(err => console.log(err))
    },

    logInAdmin({ dispatch }) {
        let user_credentials = {
            "username": "wmd_admin",
            "password": "Password1!",
        }
        dispatch('logInUser', user_credentials)
    },

    logOutUser({ commit }) {
        Auth.signOut()
            .then(data => {
            console.log(data)
            commit('setUser', '')
            })
            .catch(err => console.log(err))
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
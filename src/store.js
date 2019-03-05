import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    user: ''

  },
  plugins: [createPersistedState()],
  mutations: {
    setUser (state, user) {
      state.user = user
    }

  },
  actions: {

  },
  getters: {
    user (state) {
      return state.user
    }
  }
})

export default store

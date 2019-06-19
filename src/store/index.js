import Vue from 'vue'
import Vuex from 'vuex'
import auth from './modules/auth'
import observatory from './modules/observatory'
import device_selection from './modules/device_selection'
import skyChart from './modules/skyChart'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

export default new Vuex.Store({
    modules: {
        auth,
        observatory,
        device_selection,
        skyChart,
    },
})

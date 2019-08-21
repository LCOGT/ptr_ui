import Vue from 'vue'
import Vuex from 'vuex'
import auth from './modules/auth'
import instrument_state from './modules/instrument_state'
import observatory_configuration from './modules/observatory_configuration'
import skyChart from './modules/skyChart'
import images from './modules/images'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

export default new Vuex.Store({
    modules: {
        auth,
        instrument_state,
        observatory_configuration,
        skyChart,
        images,
    },
})

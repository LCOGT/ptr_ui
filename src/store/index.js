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
    // This commented code: Saves state to localstorage. Needed to remember if user is logged in, but that is handled in the router now.
    //plugins: [createPersistedState({
    //    paths: [ 'auth' ],
    //    reducer: (state) => {

    //        try {
    //            delete state.auth.user.storage.vuex
    //            console.log('deleted')
    //        } catch { 
    //            console.log('not deleted')
    //        }

    //        return state.auth
    //    },
    //    filter: mutation => (
    //        mutation.type !== 'observatory/setObservatoryState'
    //    ),
    //})]
})

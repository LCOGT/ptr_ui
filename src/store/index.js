import Vue from 'vue'
import Vuex from 'vuex'
import auth from './modules/auth'
import observatory_configuration from './modules/observatory_configuration'
import skyChart from './modules/skyChart'
import images from './modules/images'
import script_settings from './modules/script_settings'
import dev from './modules/dev'
import js9 from './modules/js9'
import command_params from './modules/command_params'

Vue.use(Vuex)

export default new Vuex.Store({
    plugins: [
        // Vuex normally doesn't save between page reloads.
        // Use this plugin to save state for the duration of a browser session.
        //createPersistedState({
        //    paths: [
        //        'script_settings'
        //    ]
        //})
    ],
    modules: {
        auth,
        observatory_configuration,
        skyChart,
        images,
        script_settings,
        dev,
        command_params,
        js9,
    },
})

import Vue from 'vue'
import Vuex from 'vuex'
import auth from './modules/auth'
import site_config from './modules/site_config'
import skyChart from './modules/skyChart'
import images from './modules/images'
import script_settings from './modules/script_settings'
import dev from './modules/dev'
import js9 from './modules/js9'
import command_params from './modules/command_params'
import user_data from './modules/user_data'
import calendar from './modules/calendar'
import drawshapes from './modules/drawshapes'
import sitestatus from './modules/sitestatus'
import starprofile from './modules/analysistools/starprofile'
import userstatus from './modules/userstatus'

Vue.use(Vuex)

const store = new Vuex.Store({
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
        site_config,
        command_params,
        script_settings,
        skyChart,
        images,
        user_data,
        dev,
        js9,
        auth,
        calendar,
        drawshapes,
        sitestatus,
        starprofile,
        userstatus
    },
})

store.dispatch('sitestatus/startClock')

export default store

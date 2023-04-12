import Vue from 'vue'
import Vuex from 'vuex'
import site_config from './modules/site_config'
import images from './modules/images'
import scriptSettings from './modules/scriptSettings'
import api_endpoints from './modules/api_endpoints'
import js9 from './modules/js9'
import command_params from './modules/command_params'
import user_data from './modules/user_data'
import calendar from './modules/calendar'
import drawshapes from './modules/drawshapes'
import sitestatus from './modules/sitestatus'
import starprofile from './modules/analysistools/starprofile'
import userstatus from './modules/userstatus'
import user_interface from './modules/user_interface'

Vue.use(Vuex)

const store = new Vuex.Store({
  plugins: [
    // Vuex normally doesn't save between page reloads.
    // Use this plugin to save state for the duration of a browser session.
    // createPersistedState({
    //    paths: [
    //        'scriptSettings'
    //    ]
    // })
  ],
  modules: {
    site_config,
    command_params,
    scriptSettings,
    images,
    user_data,
    api_endpoints,
    js9,
    calendar,
    drawshapes,
    sitestatus,
    starprofile,
    userstatus,
    user_interface
  }
})

store.dispatch('sitestatus/startClock')

export default store

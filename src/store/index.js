import Vue from 'vue'
import Vuex from 'vuex'
import site_config from './modules/site_config'
import images from './modules/images'
import scriptSettings from './modules/scriptSettings'
import api_endpoints from './modules/api_endpoints'
import command_params from './modules/command_params'
import project_params from './modules/project_params'
import user_data from './modules/user_data'
import calendar from './modules/calendar'
import drawshapes from './modules/drawshapes'
import sitestatus from './modules/sitestatus'
import starprofile from './modules/analysistools/starprofile'
import userstatus from './modules/userstatus'
import user_interface from './modules/user_interface'
// import uiSync from './modules/uiSync'

// import UiSyncPlugin from './plugins/ui_sync'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

/**
 * Todo: research more into other state variables could benefit from a persisted
 * state and seperate into a module persisting this state to save api calls when page refreshes
 */
const dataState = createPersistedState({
  paths: ['sitestatus.siteOwmReports']
})

const store = new Vuex.Store({
  plugins: [
    // UiSyncPlugin,
    dataState
  ],
  modules: {
    site_config,
    command_params,
    project_params,
    scriptSettings,
    images,
    user_data,
    api_endpoints,
    calendar,
    drawshapes,
    sitestatus,
    starprofile,
    userstatus,
    user_interface,
    // uiSync
  }
})

store.dispatch('sitestatus/startClock')

export default store

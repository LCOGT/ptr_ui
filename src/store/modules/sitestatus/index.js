import Axios from "axios"

import { statusAgeDisplay, STALE_AGE_MS } from './getters/status_utils'

import enclosure_getters from './getters/enclosure_getters'
import weather_getters from './getters/weather_getters'
import mount_getters from './getters/mount_getters'
import telescope_getters from "./getters/telescope_getters"
import camera_getters from "./getters/camera_getters"
import filter_wheel_getters from "./getters/filter_wheel_getters"
import focuser_getters from "./getters/focuser_getters"
import rotator_getters from "./getters/rotator_getters"
import screen_getters from "./getters/screen_getters"
import sequencer_getters from "./getters/sequencer_getters"
import selector_getters from "./getters/selector_getters"
import accumulated_getters from "./getters/accumulated_getters"

const hasKey = (obj, key) => { return Object.keys(obj).includes(key) }

// Used to reset the status to an empty state
const empty_status = {
  weather: {},
  enclosure: {},
  screen: {},
  focuser: {},
  camera: {},
  telescope: {},
  mount: {},
  rotator: {},
  filter_wheel: {},
  sequencer: {},
}

const state = {
  site: 'no site',
  status: {},
  timestamp: '',
  now: Date.now(),
  site_open_status: {},

  /* new status stuff */
  weather_status_age: 1e8,
  enclosure_status_age: 1e8,
  device_status_age: 1e8,
  
  /* end new */

  weather: {},
  enclosure: {},

  screen: {},
  focuser: {},
  camera: {},
  telescope: {},
  mount: {},
  rotator: {},
  filter_wheel: {},
  sequencer: {},
  selector: {},
}

const getters = {

  site: state => state.site,
  now: state => state.now,

  /**
   *  Site operational status:
   *    operational: recieving all status (weather, enclosure device), none are stale
   *    technical difficulty: recieving some but not all status
   *    offline: all status is stale
   */
  site_is_online: (state, getters) => {
    const stale_age_s = STALE_AGE_MS / 1000
    if (
      getters.weather_status_age < stale_age_s
      && getters.enclosure_status_age < stale_age_s
      && getters.device_status_age < stale_age_s
    ) {
      return true
    }
    //(getters.device_status_age * 1000) < STALE_AGE_MS
  },

  /**
   *  Site operational status:
   *    operational: recieving all status (weather, enclosure device), none are stale
   *    technical difficulty: recieving some but not all status
   *    offline: all status is stale
   */
  site_operational_status(state, getters) {
    const stale_age_s = STALE_AGE_MS / 1000
    const weather_not_stale = getters.weather_status_age < stale_age_s
    const device_not_stale = getters.device_status_age < stale_age_s
    const enclosure_not_stale = getters.enclosure_status_age < stale_age_s

    if ( weather_not_stale && device_not_stale && enclosure_not_stale) {
      return 'operational'
    } else if ( weather_not_stale || device_not_stale || enclosure_not_stale) {
      return 'technical difficulty'
    } else {
      return 'offline'
    }
  },

  weather_status_age: state => (state.now - state.weather_timestamp) / 1000,
  enclosure_status_age: state => (state.now - state.enclosure_timestamp) / 1000,
  device_status_age: state => (state.now - state.device_timestamp) / 1000,

  weather_status_age_display: (state, getters) => statusAgeDisplay(getters.weather_status_age),
  enclosure_status_age_display: (state, getters) => statusAgeDisplay(getters.enclosure_status_age),
  device_status_age_display: (state, getters) => statusAgeDisplay(getters.device_status_age),

  ...weather_getters,
  ...enclosure_getters,
  ...mount_getters,
  ...telescope_getters,
  ...camera_getters,
  ...filter_wheel_getters,
  ...focuser_getters,
  ...rotator_getters,
  ...screen_getters,
  ...sequencer_getters,
  ...selector_getters,
  ...accumulated_getters,
}

const mutations = {
  site(state, val) { state.site = val },

  //latest_status_timestamp_ms(state, time) { state.timestamp = time },

  latest_device_timestamp_ms(state, time) { state.device_timestamp = time },
  latest_weather_timestamp_ms(state, time) { state.weather_timestamp = time },
  latest_enclosure_timestamp_ms(state, time) { state.enclosure_timestamp = time },

  updateLocalClock(state, time) { state.now = time },

  siteOpenStatus(state, val) { state.site_open_status = val },

  new_weather_status(state, status) {
    state.weather = status['observing_conditions']
  },
  new_enclosure_status(state, status) {
    state.enclosure = status['enclosure']
  },
  new_device_status(state, status) {
    let device_types = [
      'screen',
      'focuser',
      'camera',
      'telescope',
      'mount',
      'rotator',
      'filter_wheel',
      'sequencer',
			'selector',
    ]
    // Set the status for each device-type
    device_types.forEach(device_type => {
      if (hasKey(status,device_type) && status[device_type] != null) {
      	state[device_type] = status[device_type]
			}
    })
  },

  status(state, status) {
    state.status = status
    let device_types = [
      //'observing_conditions',
      //'enclosure',
      'screen',
      'focuser',
      'camera',
      'telescope',
      'mount',
      'rotator',
      'filter_wheel',
      'sequencer',
			'selector',
    ]

    // Set the status for each device-type
    device_types.forEach(device_type => {
      if (hasKey(status,device_type) && status[device_type] != null) {
      	state[device_type] = status[device_type]
			}
    })
  },
  
  resetStatus(state) {
    const device_types = [
      'weather',
      'enclosure',
      'screen',
      'focuser',
      'camera',
      'telescope',
      'mount',
      'rotator',
      'filter_wheel',
      'sequencer',
			'selector',
    ]
    device_types.forEach(device_type => {
      state[device_type] = {}
    })
  }

}

const actions = {

  // Get and update the 'open' status of all sites. Used for the global map site indicators. 
  async getSiteOpenStatus({commit, rootState }) {
    const url = rootState.api_endpoints.status_endpoint + '/allopenstatus'
    const response = await Axios.get(url)
    commit('siteOpenStatus', response.data)
  },

  // Get a single status object for a site. Used to initialize values when loading a new site. 
  async getLatestStatus({ state, commit, dispatch, rootState }) {
    const current_site = rootState.site_config.selected_site

    // Clear the existing status if we load a new site
    if (state.site != current_site) {
      dispatch('clearStatus')
    }

    let url = rootState.api_endpoints.status_endpoint + `/${current_site}/complete_status`
    let response = await Axios.get(url)

    // If the site has no status available, commit a default empty status to the store
    if (Object.keys(response.data).includes('status')) {
      let status = response.data.status

      // Set the status ages
      commit('latest_device_timestamp_ms', response.data.status_age_timestamps_ms.device)
      commit('latest_weather_timestamp_ms', response.data.status_age_timestamps_ms.weather)
      commit('latest_enclosure_timestamp_ms', response.data.status_age_timestamps_ms.enclosure)

      // Set the status content
      commit('new_device_status', status) 
      commit('new_weather_status', status) 
      commit('new_enclosure_status', status) 

      commit('site', current_site)
    } else {
      console.warn(`Status not available for ${current_site}.`)
    }
  },

  // Reset to empty values. Used for sites without any status available.
  clearStatus({commit}) {
    //commit('status',empty_status)
    commit('resetStatus')
    commit('latest_weather_timestamp_ms', 0)
    commit('latest_enclosure_timestamp_ms', 0)
    commit('latest_device_timestamp_ms', 0)
  },

  // Keeps track of current time, used to calculate the status age. 
  startClock({commit}) {
    setInterval(() => {
      let now = Date.now()
      commit('updateLocalClock', now)
    }, 1000)
  },

}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}

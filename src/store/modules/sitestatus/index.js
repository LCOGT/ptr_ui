import axios from 'axios'

import { statusAgeDisplay, STALE_AGE_MS } from './getters/status_utils'

import enclosure_getters from './getters/enclosure_getters'
import weather_getters from './getters/weather_getters'
import forecast_getters from './getters/forecast_getters'
import mount_getters from './getters/mount_getters'
import telescope_getters from './getters/telescope_getters'
import camera_getters from './getters/camera_getters'
import filter_wheel_getters from './getters/filter_wheel_getters'
import focuser_getters from './getters/focuser_getters'
import rotator_getters from './getters/rotator_getters'
import screen_getters from './getters/screen_getters'
import sequencer_getters from './getters/sequencer_getters'
import selector_getters from './getters/selector_getters'
import wema_settings_getters from './getters/wema_settings_getters'
import obs_settings_getters from './getters/obs_settings_getters'
import accumulated_getters from './getters/accumulated_getters'
import moment from 'moment'

const hasKey = (obj, key) => { return Object.keys(obj).includes(key) }

const state = {
  site: 'no site',
  status: {},
  timestamp: '',
  now: Date.now(),
  site_open_status: {},
  stale_age_ms: STALE_AGE_MS,

  weather: {},
  enclosure: {},
  siteOwmReports: {},
  forecast: [],

  screen: {},
  focuser: {},
  camera: {},
  telescope: {},
  mount: {},
  rotator: {},
  filter_wheel: {},
  sequencer: {},
  selector: {},

  obs_settings: {},
  wema_settings: {}
}

const getters = {

  site: state => state.site,
  now: state => state.now,
  owmReport: (state, getters, rootState, rootGetters) => {
    const wema_name = rootGetters['site_config/wema_name']
    if (wema_name) {
      return JSON.parse(state.siteOwmReports[wema_name].report)
    }
  },

  /**
   *  Site operational status:
   *    operational: recieving all status (weather, enclosure device), none are stale
   *    technical difficulty: recieving some but not all status
   *    offline: all status is stale
   */
  site_is_online: (state, getters) => {
    const stale_age_s = STALE_AGE_MS / 1000
    if (
      getters.weather_status_age < stale_age_s &&
      getters.enclosure_status_age < stale_age_s &&
      getters.device_status_age < stale_age_s
    ) {
      return true
    }
    // (getters.device_status_age * 1000) < STALE_AGE_MS
  },

  /**
   *  Site operational status for obs platforms:
   *    operational: recieving all status (weather, enclosure, device), none are stale
   *    technical difficulty: recieving some but not all status
   *    offline: all status is stale
   *  Site operational status for wemas:
   *    operational: recieving enclosure status
   *    offline: enclosure status is stale
   */
  site_operational_status (state, getters, rootState, rootGetters) {
    const stale_age_s = STALE_AGE_MS / 1000
    const device_not_stale = getters.device_status_age < stale_age_s
    const enclosure_not_stale = getters.enclosure_status_age < stale_age_s
    const weather_not_stale = getters.weather_status_age < stale_age_s

    // First handle WEMA sites
    // if (rootState.site_config.global_config[rootState.site_config.selected_site].instance_type == 'wema') {
    if (rootGetters['site_config/site_is_wema']) {
      // enclosure and weather both online
      if (enclosure_not_stale && weather_not_stale) {
        return {
          text: 'operational',
          colorClass: 'is-green'
        }
        // enclosure and weather both stale
      } else if (!enclosure_not_stale && !weather_not_stale) {
        return {
          text: 'offline',
          colorClass: 'is-grey'
        }
        // enclosure is stale
      } else if (!enclosure_not_stale && weather_not_stale) {
        return {
          text: 'enclosure not reporting',
          colorClass: 'is-yellow'
        }
        // weather is stale
      } else if (!enclosure_not_stale && weather_not_stale) {
        return {
          text: 'enclosure not reporting',
          colorClass: 'is-yellow'
        }
      }
    }

    // non-wema sites below:

    // if all status is stale: OFFLINE
    if (!device_not_stale && !enclosure_not_stale) {
      return {
        text: 'offline',
        colorClass: 'is-grey'
      }
    }

    // if some of the status is stale: Technical Difficulty
    if (!device_not_stale || !enclosure_not_stale) {
      return {
        text: 'technical difficulty',
        colorClass: 'is-yellow'
      }
    }

    // if all status reporting and enclosure is open: Operational
    const enclosure_is_open = getters.enclosure_open_status.val.toLowerCase() == 'open'
    if (device_not_stale && enclosure_not_stale) {
      if (enclosure_is_open) {
        return {
          text: 'operational',
          colorClass: 'is-green'
        }
      } else {
        return {
          text: 'enclosure closed',
          colorClass: 'is-blue'
        }
      }
    }
  },

  all_sites_status_color (state, getters, rootState) {
    const site_status_colors = {}
    const status_age_max = STALE_AGE_MS / 1000
    for (const site in state.site_open_status) {
      const enclosure_not_stale = state.site_open_status[site]?.enclosure?.status_age_s < status_age_max
      const weather_not_stale = state.site_open_status[site]?.weather?.status_age_s < status_age_max
      const device_not_stale = state.site_open_status[site]?.device?.status_age_s < status_age_max
      const site_is_wema = rootState.site_config.global_config[site]?.instance_type == 'wema'
      let color = ''

      if (site_is_wema) {
        if (enclosure_not_stale && weather_not_stale) {
          color = 'status-green'
        } else if (!enclosure_not_stale && !weather_not_stale) {
          color = 'status-grey'
        } else {
          color = 'status-yellow'
        }
      }

      if (!site_is_wema) {
        if (enclosure_not_stale && device_not_stale) {
          color = 'status-green'
        } else if (!enclosure_not_stale && !device_not_stale) {
          color = 'status-grey'
        } else {
          color = 'status-yellow'
        }
      }

      site_status_colors[site] = color
    }
    return site_status_colors
  },

  weather_status_age: state => (state.now - state.weather_timestamp) / 1000 || Infinity,
  enclosure_status_age: state => (state.now - state.enclosure_timestamp) / 1000 || Infinity,
  device_status_age: state => (state.now - state.device_timestamp) / 1000 || Infinity,
  forecast_status_age: state => (state.now - state.forecast_timestamp) / 1000 || Infinity,
  obs_settings_status_age: state => (state.now - state.obs_settings_timestamp) / 1000 || Infinity,
  wema_settings_status_age: state => (state.now - state.wema_settings_timestamp) / 1000 || Infinity,

  weather_status_age_display: (state, getters) => statusAgeDisplay(getters.weather_status_age),
  enclosure_status_age_display: (state, getters) => statusAgeDisplay(getters.enclosure_status_age),
  device_status_age_display: (state, getters) => statusAgeDisplay(getters.device_status_age),
  forecast_status_age_display: (state, getters) => statusAgeDisplay(getters.forecast_status_age),
  wema_settings_status_age_display: (state, getters) => statusAgeDisplay(getters.wema_settings_status_age),
  obs_settings_status_age_display: (state, getters) => statusAgeDisplay(getters.obs_settings_status_age),

  ...weather_getters,
  ...forecast_getters,
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
  ...wema_settings_getters,
  ...obs_settings_getters,
  ...accumulated_getters
}

const mutations = {
  site (state, val) { state.site = val },

  // latest_status_timestamp_ms(state, time) { state.timestamp = time },

  latest_device_timestamp_ms (state, time) { state.device_timestamp = time },
  latest_weather_timestamp_ms (state, time) { state.weather_timestamp = time },
  latest_enclosure_timestamp_ms (state, time) { state.enclosure_timestamp = time },
  latest_forecast_timestamp_ms (state, time) { state.forecast_timestamp = time },
  latest_wema_settings_timestamp_ms (state, time) { state.wema_settings_timestamp = time },
  latest_obs_settings_timestamp_ms (state, time) { state.obs_settings_timestamp = time },

  updateLocalClock (state, time) { state.now = time },

  siteOpenStatus (state, val) { state.site_open_status = val },

  new_weather_status (state, status) {
    state.weather = status.observing_conditions
  },
  new_forecast_status (state, status) {
    state.forecast = status?.forecast || []
  },
  new_enclosure_status (state, status) {
    state.enclosure = status.enclosure
  },
  new_device_status (state, status) {
    const device_types = [
      'screen',
      'focuser',
      'camera',
      'telescope',
      'mount',
      'rotator',
      'filter_wheel',
      'sequencer',
      'selector'
    ]
    // Set the status for each device-type
    device_types.forEach(device_type => {
      if (hasKey(status, device_type) && status[device_type] != null) {
        state[device_type] = status[device_type]
      }
    })
  },
  new_wema_settings_status (state, status) {
    state.wema_settings = status.wema_settings
  },
  new_obs_settings_status (state, status) {
    state.obs_settings = status.obs_settings
  },

  storeNewOwmReport (state, { wema_name, newReport, newTimestamp }) {
    state.siteOwmReports[wema_name] = { report: newReport, timestamp: newTimestamp }
  },

  status (state, status) {
    state.status = status
    const device_types = [
      // 'observing_conditions',
      // 'enclosure',
      'screen',
      'focuser',
      'camera',
      'telescope',
      'mount',
      'rotator',
      'filter_wheel',
      'sequencer',
      'selector'
    ]

    // Set the status for each device-type
    device_types.forEach(device_type => {
      if (hasKey(status, device_type) && status[device_type] != null) {
        state[device_type] = status[device_type]
      }
    })
  },

  resetStatus (state) {
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
      'selector'
    ]
    device_types.forEach(device_type => {
      state[device_type] = {}
    })

    state.forecast = []
  }
}

const actions = {

  // Get and update the 'open' status of all sites. Used for the global map site indicators.
  async getSiteOpenStatus ({ commit, rootState }) {
    const url = rootState.api_endpoints.status_endpoint + '/allopenstatus'
    const response = await axios.get(url)
    commit('siteOpenStatus', response.data)
    return response.data
  },

  // Get a single status object for a site. Used to initialize values when loading a new site.
  async getLatestStatus ({ state, commit, dispatch, rootState }) {
    const current_site = rootState.site_config.selected_site

    // Get this separately because the wema settings aren't included in the `complete_status` endpoint
    dispatch('getLatestWemaSettings')
    dispatch('getLatestForecast')

    // Clear the existing status if we load a new site
    if (state.site != current_site) {
      dispatch('clearStatus')
    }

    const url = rootState.api_endpoints.status_endpoint + `/${current_site}/complete_status`
    const response = await axios.get(url)

    // If the site has no status available, commit a default empty status to the store
    if (Object.keys(response.data).includes('status')) {
      const status = response.data.status

      // Set the status ages
      commit('latest_device_timestamp_ms', response.data.status_age_timestamps_ms.device)
      commit('latest_weather_timestamp_ms', response.data.status_age_timestamps_ms.weather)
      commit('latest_forecast_timestamp_ms', response.data.status_age_timestamps_ms.forecast)
      commit('latest_enclosure_timestamp_ms', response.data.status_age_timestamps_ms.enclosure)

      // Set the status content
      commit('new_device_status', status)
      commit('new_weather_status', status)
      commit('new_forecast_status', status)
      commit('new_enclosure_status', status)
      commit('new_obs_settings_status', status)

      commit('site', current_site)

      dispatch('getLatestForecast')
    } else {
      console.warn(`Status not available for ${current_site}.`)
    }
  },

  getLatestObsSettings ({ state, commit, rootState, rootGetters }) {
    const wema_name = rootGetters['site_config/wema_name']
    if (wema_name) {
      const url = rootState.api_endpoints.status_endpoint + `/${wema_name}/obs_settings`
      axios.get(url).then(response => {
        commit('latest_obs_settings_timestamp_ms', response.data.server_timestamp_ms)
        commit('new_obs_settings_status', response.data.status)
      }).catch(e => {
        console.log(e)
      })
    }
  },
  getLatestWemaSettings ({ state, commit, rootState, rootGetters }) {
    const wema_name = rootGetters['site_config/wema_name']
    if (wema_name) {
      const url = rootState.api_endpoints.status_endpoint + `/${wema_name}/wema_settings`
      axios.get(url).then(response => {
        commit('latest_wema_settings_timestamp_ms', response.data.server_timestamp_ms)
        commit('new_wema_settings_status', response.data.status)
      }).catch(e => {
        console.log(e)
      })
    }
  },

  getLatestForecast ({ state, commit, rootState, rootGetters }) {
    const wema_name = rootGetters['site_config/wema_name']
    if (wema_name) {
      const url = rootState.api_endpoints.status_endpoint + `/${wema_name}/forecast`
      axios.get(url).then(response => {
        commit('latest_forecast_timestamp_ms', response.data.server_timestamp_ms)
        commit('new_forecast_status', response.data.status)
      }).catch(e => {
        console.log(e)
      })
    }
  },

  getLatestOwmReport ({ commit, rootState, rootGetters, state }) {
    const wema_name = rootGetters['site_config/wema_name']
    if (wema_name) {
      // request and store a new report if not cached or cached more than 1 hour ago
      if (!(wema_name in state.siteOwmReports) || moment(state.siteOwmReports[wema_name].timestamp).isBefore(moment().subtract(1, 'hours'))) {
        return new Promise((resolve, reject) => {
          const url = rootState.api_endpoints.status_endpoint + `/${wema_name}/owm_report`
          axios.get(url).then(response => {
            commit('storeNewOwmReport', { wema_name, newReport: response.data.status.owm_report, newTimestamp: moment() })
            resolve()
          }).catch(e => {
            console.log(e)
            reject(e)
          })
        })
      }
    }
  },

  // Reset to empty values. Used for sites without any status available.
  clearStatus ({ commit }) {
    // commit('status',empty_status)
    commit('resetStatus')
    commit('latest_weather_timestamp_ms', 0)
    commit('latest_forecast_timestamp_ms', 0)
    commit('latest_enclosure_timestamp_ms', 0)
    commit('latest_device_timestamp_ms', 0)
  },

  // Keeps track of current time, used to calculate the status age.
  startClock ({ commit }) {
    setInterval(() => {
      const now = Date.now()
      commit('updateLocalClock', now)
    }, 1000)
  }

}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}

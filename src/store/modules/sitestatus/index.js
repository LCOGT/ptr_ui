import Axios from "axios"

import enclosure_getters from './enclosure_getters'
import observing_conditions_getters from './observing_conditions_getters'
import mount_getters from './mount_getters'
import telescope_getters from "./telescope_getters"
import camera_getters from "./camera_getters"
import filter_wheel_getters from "./filter_wheel_getters"
import focuser_getters from "./focuser_getters"
import rotator_getters from "./rotator_getters"
import screen_getters from "./screen_getters"
import sequencer_getters from "./sequencer_getters"
import selector_getters from "./selector_getters"

const hasKey = (obj, key) => { return Object.keys(obj).includes(key) }

// Used to reset the status to an empty state
const empty_status = {
  observing_conditions: {},
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
  weather_timestamp: '',
  device_timestamp: '',
  now: Date.now(),
  site_open_status: {},

  observing_conditions: {},
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
  status_age: state => (state.now - state.timestamp) / 1000,
  wx_status_age: state => (state.now - state.weather_timestamp) / 1000,
  device_status_age: state => (state.now - state.device_timestamp) / 1000,
  ...observing_conditions_getters,
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
}

const mutations = {
  site(state, val) { state.site = val },

  serverTimestampMs(state, time) { state.timestamp = time },
  deviceServerTimestampMs(state, time) { state.device_timestamp = time },
  weatherServerTimestampMs(state, time) { state.weather_timestamp = time },
  updateLocalClock(state, time) { state.now = time },

  siteOpenStatus(state, val) { state.site_open_status = val },

  status(state, status) {

    state.status = status

    let device_types = [
      'observing_conditions',
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

    // Set the status for each device-type
    device_types.forEach(device_type => {
      if (hasKey(status,device_type)) {
      	state[device_type] = status[device_type]
			}
    })
  }
}

const actions = {

  // Get and update the 'open' status of all sites. Used for the global map site indicators. 
  async getSiteOpenStatus({commit, rootState }) {
    const url = rootState.dev.status_endpoint + '/allopenstatus'
    const response = await Axios.get(url)
    commit('siteOpenStatus', response.data)
  },

  // Get a single status object for a site. Used to initialize values when loading a new site. 
  async getLatestStatus({ state, commit, dispatch, rootState }) {
    console.log('getting latest status for site ', rootState.site_config.selected_site)
    let url = rootState.dev.status_endpoint + `/${rootState.site_config.selected_site}/complete_status`
    let response = await Axios.get(url)
    console.log(url)
    console.log(response)
    console.log(response.data)

    // If the site has no status available, commit a default empty status to the store
    if (!Object.keys(response.data).includes('status')) {
      dispatch('clearStatus')
      return
    }
    let status = response.data.status

    // Set the global status age to the most recent timestamp
    commit('serverTimestampMs', response.data.server_timestamp_ms)

    // Get the deviceStatus age specifically 
    dispatch('getDeviceStatusAge')

    // For now, assume the weather status timestamp is the same as the most recent timestamp.
    // TODO: fetch weather status timestamp explicitly.
    commit('weatherServerTimestampMs', response.data.server_timestamp_ms) 
    commit('status', status)
  },

  async getDeviceStatusAge({ commit, rootState }) {
    let url = rootState.dev.status_endpoint + `/${rootState.site_config.selected_site}/device_status`
    let response = await Axios.get(url)
    commit('deviceServerTimestampMs', response.data.server_timestamp_ms)
  },

  // Reset to empty values. Used for sites without any status available.
  clearStatus({commit}) {
    commit('status',empty_status)
    commit('serverTimestampMs', 0)
    commit('weatherServerTimestampMs', 0)
    commit('deviceServerTimestampMs', 0)
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

/* Example Status:
{
  "observing_conditions":{
    "observing_conditions1":{
      "solar_flux_w/m^2":"NA",
      "meas_sky_mpsas":"-11.56",
      "open_ok":"No",
      "dewpoint_C":"3.0",
      "wind_m/s":"2.86",
      "temperature_C":"11.4",
      "humidity_%":"56.0",
      "calc_HSI_lux":"439.939",
      "rain_rate":"0.0",
      "calc_sky_mpsas":"-11.37",
      "last_sky_update_s":"4.16",
      "pressure_mbar":"784.0",
      "sky_temp_C":"-29.5",
      "wx_ok":"No"
    }
  },
  "enclosure":{
    "enclosure1":{
      "enclosure_mode":"Manual",
      "dome_azimuth":"316.0",
      "dome_slewing":"False",
      "enclosure_message":"Closed. Initialized class property value.",
      "shutter_status":"Closed",
      "enclosure_slaving":"False"
    }
  },
  "screen":{
    "screen1":{
      "bright_setting":"0",
      "dark_setting":"screen is off"
    }
  },
  "focuser":{
    "focuser1":{
      "focus_temperature":"7.0",
      "focus_moving":"false",
      "focus_position":"9415.3"
    }
  },
  "camera":{
    "camera1":{
      "busy_lock":"false",
      "status":"not implemented yet"
    }
  },
  "telescope":{
    "telescope1":{
      "altitude":"-0.002",
      "right_ascension":"4.28786",
      "sidereal_time":"4.29609",
      "azimuth":"180.001",
      "message":"-",
      "pointing_instrument":"tel1",
      "zenith_distance":"90.0",
      "declination":"-54.4978",
      "coordinate_system":"J.now",
      "tracking_declination_rate":"0.0",
      "tracking_right_ascension_rate":"0.0",
      "airmass":" >> 5 ",
      "equinox":"J2020.68",
      "timestamp":"1617128709"
    }
  },
  "mount":{
    "mount1":{
      "is_slewing":"false",
      "message":"-",
      "is_parked":"true",
      "is_tracking":"false",
      "pointing_telescope":"tel1",
      "timestamp":"1617128709"
    }
  },
  "rotator":{
    "rotator1":{
      "rotator_moving":"false",
      "position_angle":"190.001"
    }
  },
  "send_heartbeat":"false",
  "filter_wheel":{
    "filter_wheel1":{
      "filter_number":"0",
      "filter_name":"none",
      "filter_offset":"0.0",
      "wheel_is_moving":"false"
    }
  },
  "sequencer":{
    "sequencer1":{
      "active_script":"none",
      "sequencer_busy":"false"
    }
  },
  "timestamp":"1617128709",
  "server_timestamp_ms":1617129036000
}
*/

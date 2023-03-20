/**
 * @fileoverview This is the vuex store that maintains the state of devices
 * that are either available for selection or currently selected and active.
 */

import _ from 'lodash'
import axios from 'axios'

const state = {
  test_sites: ['tst', 'tst001', 'dht'],

  global_config: {},
  is_site_selected: false,
  did_config_load_yet: false,

  selected_site: '',
  selected_enclosure: '',
  selected_mount: '',
  selected_telescope: '',
  selected_rotator: '',
  selected_focuser: '',
  selected_filter_wheel: '',
  selected_camera: '',
  selected_screen: '',
  selected_weather: '',
  selected_sequencer: '',

  selector_exists: false,
  selected_selector: ''
}

const getters = {

  site_config: state => {
    return state.global_config[state.selected_site]
  },

  available_devices: state => (deviceType, site) => {
    return Object.keys(state.global_config?.[site]?.[deviceType]) ?? []
  },

  available_sites: state => {
    return Object.keys(state.global_config)
  },

  // Array of sitecodes for real observatory sites
  available_sites_real: state => {
    return Object.keys(state.global_config).filter(s => state.test_sites.indexOf(s.toLowerCase()) == -1)
  },
  // Array of sitecodes for simulated/test observatory sites
  available_sites_simulated: state => {
    return Object.keys(state.global_config).filter(s => state.test_sites.indexOf(s.toLowerCase()) != -1)
  },

  all_sites: state => {
    let sites = []
    Object.keys(state.global_config).forEach(site => {
      const s = {
        name: state.global_config[site].name.toString(),
        site: state.global_config[site].site.toString(),
        latitude: parseFloat(state.global_config[site].latitude),
        longitude: parseFloat(state.global_config[site].longitude),
        TZ_database_name: state.global_config[site].TZ_database_name
      }
      sites.push(s)
    })
    sites = _.orderBy(sites, [s => s.site], ['asc'])
    return sites
  },
  all_sites_real: (state, getters) => {
    let sites = getters.all_sites.filter(s => !state.test_sites.includes(s.site.toLowerCase()))
    // sort by longitude
    sites = sites.sort((a, b) => a.longitude - b.longitude)
    return sites
  },
  all_sites_simulated: (state, getters) => {
    let sites = getters.all_sites.filter(s => state.test_sites.includes(s.site.toLowerCase()))
    // sort by longitude
    sites = sites.sort((a, b) => a.longitude - b.longitude)
    return sites
  },

  selected_enclosure_config: (state, getters) => {
    return getters.site_config?.enclosure?.[state.selected_enclosure] ?? {}
  },
  selected_mount_config: (state, getters) => {
    return getters.site_config?.mount?.[state.selected_mount] ?? {}
  },
  selected_telescope_config: (state, getters) => {
    return getters.site_config?.telescope?.[state.selected_telescope] ?? {}
  },
  selected_rotator_config: (state, getters) => {
    return getters.site_config?.rotator?.[state.selected_rotator] ?? {}
  },
  selected_focuser_config: (state, getters) => {
    return getters.site_config?.focuser?.[state.selected_focuser] ?? {}
  },
  selected_filter_wheel_config: (state, getters) => {
    return getters.site_config?.filter_wheel?.[state.selected_filter_wheel] ?? {}
  },
  selected_camera_config: (state, getters) => {
    return getters.site_config?.camera?.[state.selected_camera] ?? {}
  },
  selected_screen_config: (state, getters) => {
    return getters.site_config?.screen?.[state.selected_screen] ?? {}
  },
  selected_weather_config: (state, getters) => {
    return getters.site_config?.observing_conditions?.[state.selected_weather] ?? {}
  },
  selected_sequencer_config: (state, getters) => {
    return getters.site_config?.sequencer?.[state.selected_sequencer] ?? {}
  },
  selected_selector_config: (state, getters) => {
    return getters.site_config?.selector?.[state.selected_selector] ?? {}
  },

  /* Getters for specific device attributes (implemented here as needed) */
  // TODO: better process for setting default fallback values

  enclosure_is_dome: (state, getters) => {
    return getters.selected_enclosure_config.is_dome ?? false
  },

  focuser_reference: (state, getters) => {
    return parseFloat(getters.selected_focuser_config.reference) // ?? '';
  },
  focuser_min: (state, getters) => {
    return parseFloat(getters.selected_focuser_config.minimum) ?? 0
  },
  focuser_max: (state, getters) => {
    return parseFloat(getters.selected_focuser_config.maximum) ?? 1
  },
  focuser_step_size: (state, getters) => {
    return parseFloat(getters.selected_focuser_config.step_size) ?? 1
  },
  rotator_min: (state, getters) => {
    return parseFloat(getters.selected_rotator_config.minimum) ?? 0
  },
  rotator_max: (state, getters) => {
    return parseFloat(getters.selected_rotator_config.maximum) ?? 1
  },
  rotator_step_size: (state, getters) => {
    return parseFloat(getters.selected_rotator_config.step_size) ?? 1
  },

  telescope_has_flip_flat: (state, getters) => {
    return getters.selected_telescope_config.has_flip_flat ?? false
  },

  /* Site properties */
  site_name: (state, getters) => {
    return getters.site_config.name
  },
  site_latitude: (state, getters) => {
    return parseFloat(getters.site_config?.latitude) ?? 0
  },
  site_longitude: (state, getters) => {
    return parseFloat(getters.site_config?.longitude) ?? 0
  },
  timezone: (state, getters) => {
    return getters.site_config?.TZ_database_name
  },

  /* These getters are used to customize the control form fields. */
  // Available camera areas
  camera_areas: (state, getters) => {
    return getters.selected_camera_config.settings?.areas_implemented ?? []
  },
  camera_default_area: (state, getters) => {
    return getters.selected_camera_config.settings?.default_area ?? []
  },
  camera_bin_options: (state, getters) => {
    return getters.selected_camera_config.settings?.bin_modes ?? []
  },
  // Does the camera bin or not? Returns string 'True' or 'False'.
  camera_can_bin: (state, getters) => {
    return getters.selected_camera_config.settings?.bin_modes?.length
  },
  camera_has_darkslide: (state, getters) => {
    return getters.selected_camera_config.settings?.has_darkslide ?? false
  },

  // Available filters
  filter_wheel_options: (state, getters) => {
    const fwo = getters.selected_filter_wheel_config.settings?.filter_data
    if (fwo == undefined) return [[]]
    return fwo
  },

  // Available automatic 3-color image options
  auto_color_options: (state, getters) => {
    const fwo = getters.selected_filter_wheel_config.settings?.auto_color_options
    if (fwo == undefined) return [[]]
    return fwo
  },

  // Get the site events from the selected config (things like nautical dark start, etc)
  site_events: (state, getters) => {
    return getters.site_config.events ?? {}
  }

}

const mutations = {
  setGlobalConfig (state, config) {
    state.global_config = config
    state.did_config_load_yet = true
  },
  setActiveSite (state, site) {
    state.selected_site = site
    state.is_site_selected = true
  },
  removeActiveSite (state) {
    state.selected_site = ''
    state.is_site_selected = false
  },
  setActiveEnclosure (state, enclosure) { state.selected_enclosure = enclosure },
  setActiveMount (state, mount) { state.selected_mount = mount },
  setActiveTelescope (state, telescope) { state.selected_telescope = telescope },
  setActiveRotator (state, rotator) { state.selected_rotator = rotator },
  setActiveFocuser (state, focuser) { state.selected_focuser = focuser },
  setActiveFilterWheel (state, filter_wheel) { state.selected_filter_wheel = filter_wheel },
  setActiveCamera (state, camera) { state.selected_camera = camera },
  setActiveScreen (state, screen) { state.selected_screen = screen },
  setActiveWeather (state, weather) { state.selected_weather = weather },
  setActiveSequencer (state, sequencer) { state.selected_sequencer = sequencer },
  setActiveSelector (state, selector) {
    if (selector == '') {
      state.selector_exists = false
      state.selected_selector = ''
    } else {
      state.selector_exists = true
      state.selected_selector = selector
    }
  }

}

const actions = {

  /**
     * This action gets the most recent config from AWS, which applies to all
     * observatories in the network.
     */
  async update_config ({ commit, rootState }) {
    const url = `${rootState.api_endpoints.active_api}/all/config`
    const response = await axios.get(url)
    commit('setGlobalConfig', response.data)
    return response.data
  },

  set_default_filter_option ({ commit, getters }) {
    commit('command_params/filter_wheel_options_selection',
      getters.filter_wheel_options[0],
      { root: true }
    )
  },

  set_default_active_devices ({ state, commit, getters, rootGetters }, site) {
    const defaults = state.global_config[site].defaults

    commit('setActiveSite', site)
    commit('setActiveWeather', defaults.observing_conditions)
    commit('setActiveEnclosure', defaults.enclosure)
    commit('setActiveMount', defaults.mount)
    commit('setActiveTelescope', defaults.telescope)
    commit('setActiveCamera', defaults.camera)
    commit('setActiveFilterWheel', defaults.filter_wheel)
    commit('setActiveFocuser', defaults.focuser)
    commit('setActiveRotator', defaults.rotator)
    commit('setActiveSequencer', defaults.sequencer)
    commit('setActiveScreen', defaults.screen)

    // handle optional instrument selector
    if (Object.keys(state.global_config[site]).includes('selector') &&
          Object.keys(state.global_config[site].defaults).includes('selector') &&
          state.global_config[site].defaults.selector !== null) {
      commit('setActiveSelector', defaults.selector)
    }
    else {
      commit('setActiveSelector', '')
    }

    // Set initial values in command fields
    if (rootGetters['command_params/filter_wheel_options_selection'] == '') {
      const filterSelection = getters.filter_wheel_options[0][0]
      commit('command_params/filter_wheel_options_selection',
        filterSelection,
        { root: true }
      )
    }

    if (rootGetters['command_params/camera_areas_selection'] == '' && getters.camera_areas != undefined) {
      const areaSelection = getters.camera_areas[0]
      commit('command_params/camera_areas_selection',
        areaSelection,
        { root: true }
      )
    }

    if (rootGetters['command_params/camera_bin'] == '' && getters.camera_can_bin) {
      const bin_selection = getters.camera_bin_options[0]
      commit('command_params/camera_bin',
        bin_selection,
        { root: true }
      )
    }
  },

  remove_active_site ({ commit }) {
    commit('setActiveSite', '')
    commit('setActiveWeather', '')
    commit('setActiveEnclosure', '')
    commit('setActiveMount', '')
    commit('setActiveTelescope', '')
    commit('setActiveCamera', '')
    commit('setActiveFilterWheel', '')
    commit('setActiveFocuser', '')
    commit('setActiveRotator', '')
    commit('setActiveSequencer', '')
    commit('setActiveScreen', '')
    commit('setActiveSelector', '')
  }

}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}

/**
 * @fileoverview This is the vuex store that maintains the state of devices
 * that are either available for selection or currently selected and active.
 */

import _ from 'lodash'
import axios from 'axios'
import helpers from '../../utils/helpers'

const state = {
  test_sites: ['tst', 'tst001', 'dht'],

  global_config: {},
  is_site_selected: false,
  did_config_load_yet: false,

  selected_site: '',
  prev_selected_site: '',

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

  get_site_attribute: state => site => attribute => {
    return state.global_config[site][attribute]
  },

  site_config: state => {
    return state.global_config[state.selected_site]
  },

  get_camera_config: state => {
    // '&&' is for existence checks so that if some values don't exist, we can return safely
    const global_config = state.global_config
    const site_config = global_config && global_config[state.selected_site]
    const camera_config = site_config && site_config.camera && site_config.camera.camera_1_1
    if (camera_config) {
      return camera_config
    }
  },

  site_is_wema: state => {
    return state.global_config[state.selected_site]?.instance_type == 'wema'
  },

  wema_name: state => {
    return state.global_config[state.selected_site]?.wema_name || null
  },

  wema_config: (state, getters) => {
    return state.global_config[getters.wema_name]
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
      // Get some basic info for each site, and add it to our array constituting "all sites"
      try {
        const config = state.global_config[site]
        if (!config) { throw new Error('Site configuration not found.', site) }

        const name = config.name?.toString() || config.site_description?.toString() || 'missing name'
        const latitude = parseFloat(config?.latitude || config.site_latitude)
        const longitude = parseFloat(config.longitude || config.site_longitude)
        const TZ_database_name = config.TZ_database_name

        if (isNaN(latitude)) { throw new Error('Latitude is missing or invalid.', site) }
        if (isNaN(longitude)) { throw new Error('Longitude is missing or invalid.', site) }
        if (!TZ_database_name) { throw new Error('TZ_database_name is missing.', site) }

        const site_info = {
          site,
          name,
          latitude,
          longitude,
          TZ_database_name
        }
        sites.push(site_info)
      } catch (error) {
        console.error(error.message)
      }
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
    return getters.selected_camera_config.settings?.bin_modes?.map(o => String(o[0])) ?? []
  },
  // Does the camera bin or not? Returns string 'True' or 'False'.
  camera_can_bin: (state, getters) => {
    return getters.selected_camera_config.settings?.bin_modes?.length || false
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
  default_filter_selection: (state, getters) => {
    return getters.selected_filter_wheel_config.settings?.default_filter || getters.filter_wheel_options[0][0]
  },

  // Get the site events from the selected config (things like nautical dark start, etc)
  // convert the times from dublin julian days (the config format) to unix timestamps
  site_events: (state, getters) => {
    const site_events = { ...getters.site_config.events } ?? {}
    for (const e in site_events) {
      // convert dublin julian days to julian days
      const jd = site_events[e] + 2415020
      // convert julian days to unix
      site_events[e] = helpers.jd2unix(jd)
    }
    return site_events
  },
  site_events_observing_start_time: (state, getters) => {
    return getters.site_events['Observing Begins']
  },
  site_events_observing_end_time: (state, getters) => {
    return getters.site_events['Observing Ends']
  }

}

const mutations = {
  setGlobalConfig (state, config) {
    state.global_config = config
    state.did_config_load_yet = true
  },
  selected_site (state, site) {
    state.prev_selected_site = state.selected_site
    state.selected_site = site
    state.is_site_selected = true
  },

  remove_selected_site (state) {
    state.selected_site = ''
    state.is_site_selected = false
  },
  selected_enclosure (state, enclosure) { state.selected_enclosure = enclosure },
  selected_mount (state, mount) { state.selected_mount = mount },
  selected_telescope (state, telescope) { state.selected_telescope = telescope },
  selected_rotator (state, rotator) { state.selected_rotator = rotator },
  selected_focuser (state, focuser) { state.selected_focuser = focuser },
  selected_filter_wheel (state, filter_wheel) { state.selected_filter_wheel = filter_wheel },
  selected_camera (state, camera) { state.selected_camera = camera },
  selected_screen (state, screen) { state.selected_screen = screen },
  selected_weather (state, weather) { state.selected_weather = weather },
  selected_sequencer (state, sequencer) { state.selected_sequencer = sequencer },
  selected_selector (state, selector) {
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
     * It also saves the config to localstorage, which acts as a fallback if the config endpoint fails.
     */
  async update_config ({ commit, rootState }) {
    const url = `${rootState.api_endpoints.active_api}/all/config`
    let globalConfig

    try {
      const response = await axios.get(url)
      globalConfig = response.data

      // Add wema-only values into obs configs
      Object.keys(globalConfig).forEach(site => {
        const wemaName = globalConfig[site].wema_name || site
        if (wemaName != site) {
          globalConfig[site].latitude = globalConfig[wemaName].latitude
          globalConfig[site].longitude = globalConfig[wemaName].longitude
          globalConfig[site].TZ_database_name = globalConfig[wemaName].TZ_database_name
        }
      })

      // Save globalConfig to localStorage
      localStorage.setItem('globalConfig', JSON.stringify(globalConfig))
    } catch (error) {
      console.error(error)

      // Load globalConfig from localStorage
      const loadedConfig = localStorage.getItem('globalConfig')
      if (loadedConfig) {
        globalConfig = JSON.parse(loadedConfig)
      } else {
        // Handle situation where there's neither API data nor localStorage data
        throw error
      }
    }

    commit('setGlobalConfig', globalConfig)
    return globalConfig
  },

  // Define actions (not just mutations) to change the active device when we also need to set default
  // values for config-based options
  selected_camera ({ commit, getters }, selectedCamera) {
    commit('selected_camera', selectedCamera)
    if (selectedCamera == '') return

    // set default camera area
    const areaSelection = getters.camera_areas[0]
    commit('command_params/camera_areas_selection',
      areaSelection,
      { root: true }
    )

    // set default bin setting if binning is enabled
    const bin_selection = getters.camera_bin_options[0]
    if (getters.camera_can_bin) {
      commit('command_params/camera_bin',
        bin_selection,
        { root: true }
      )
    }
  },

  selected_filter_wheel ({ commit, getters }, selectedFilterWheel) {
    commit('selected_filter_wheel', selectedFilterWheel)
    if (selectedFilterWheel == '') return

    // set default filter selection
    const filterSelection = getters.default_filter_selection
    commit('command_params/filter_wheel_options_selection',
      filterSelection,
      { root: true }
    )
  },

  set_default_active_devices ({ state, commit, getters, rootGetters, dispatch }, site) {
    const defaults = state.global_config[site].defaults

    commit('selected_site', site)
    commit('selected_weather', defaults.observing_conditions || 'observing_conditions1')
    commit('selected_enclosure', defaults.enclosure || 'enclosure1')
    commit('selected_mount', defaults.mount)
    commit('selected_telescope', defaults.telescope)
    dispatch('selected_camera', defaults.camera)
    dispatch('selected_filter_wheel', defaults.filter_wheel)
    commit('selected_focuser', defaults.focuser)
    commit('selected_rotator', defaults.rotator)
    commit('selected_sequencer', defaults.sequencer)
    commit('selected_screen', defaults.screen)

    // handle optional instrument selector
    commit('selected_selector', '')
    if (Object.keys(state.global_config[site]).includes('selector') &&
          Object.keys(state.global_config[site].defaults).includes('selector') &&
          state.global_config[site].defaults.selector !== null) {
      commit('selected_selector', defaults.selector)
    }
  },

  remove_active_site ({ commit }) {
    commit('selected_site', '')
    commit('selected_weather', '')
    commit('selected_enclosure', '')
    commit('selected_mount', '')
    commit('selected_telescope', '')
    commit('selected_camera', '')
    commit('selected_filter_wheel', '')
    commit('selected_focuser', '')
    commit('selected_rotator', '')
    commit('selected_sequencer', '')
    commit('selected_screen', '')
    commit('selected_selector', '')
  }

}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}

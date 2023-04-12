// import { API } from 'aws-amplify'
import axios from 'axios'
import { SnackbarProgrammatic as Snackbar } from 'buefy'

// initial vuex state
const state = {

  // The currently active script. This is sent when 'run script' is clicked.
  selectedScript: 'none',

  // This is where the params for each script are held.
  // Actual values are initialized in main.js, as soon as the site configs are loaded.
  focusAuto: {},
  focusExtensive: {},
  focusFine: {},
  restackLocalCalibrations: {},
  collectBiasesAndDarks: {},
  collectScreenFlats: {},
  collectSkyFlats: {},
  takeLRGBStack: {},
  takeO3HaS2N2Stack: {},
  takeUGRIZSStack: {},
  takePlanetStack: {},
  takeLunarStack: {},
  pointingRun: {},

  // If a script is not in this list, the UI settings button will be disabled.
  scriptsWithSettings: [
    'focusAuto',
    'focusExtensive',
    'focusFine',
    'restackLocalCalibrations',
    'collectBiasesAndDarks',
    'collectScreenFlats',
    'collectSkyFlats',
    'takeLRGBStack',
    'takeO3HaS2N2Stack',
    'takeUGRIZSStack',
    'takePlanetStack',
    'takeLunarStack',
    'pointingRun'
  ],

  // This is used to populate the dropdown list where users select a script in the UI
  readableScriptNames: {
    focusAuto: 'Focus Auto',
    focusExtensive: 'Focus Extensive',
    focusFine: 'Focus Fine',
    restackLocalCalibrations: 'Restack Local Calibrations',
    collectBiasesAndDarks: 'Collect Biases and Darks',
    collectScreenFlats: 'Collect Screen Flats',
    collectSkyFlats: 'Collect Sky Flats',
    takeLRGBStack: 'Take L/R/G/B Stack',
    takeO3HaS2N2Stack: 'Take O3/Ha/N2/S2 Stack',
    takeUGRIZSStack: 'Take u/g/r/i/zs Stack',
    takePlanetStack: 'Take Planet Stack',
    takeLunarStack: 'Take Lunar Stack',
    pointingRun: 'Pointing Run'
  }
}

// vuex getters
const getters = {

  /* General script settings getters */
  selectedScript: state => state.selectedScript,

  selectedScriptHasSettings: state => state.scriptsWithSettings.includes(state.selectedScript),

  getGeneralScriptParam: state => payload => state[payload.script_name][payload.script_param],
  getAllParamsFromScript: state => script_name => state[script_name],

  readableScriptNames: state => state.readableScriptNames
}

// vuex mutations
const mutations = {

  updateScriptParam (state, { scriptName, paramName, value }) {
    state[scriptName][paramName] = value
  },

  selectedScript (state, script) { state.selectedScript = script }
}

// vuex actions
const actions = {
  /**
     *  Send a command to the observatory to stop any current running script.
     *  The command is sent to a specific mount at the site (like all commands).
     */
  async scriptRunCommand ({ getters, rootState }, { header, user_name, user_id, user_roles }) {
    const url = `${rootState.api_endpoints.jobs_api}/newjob?site=${rootState.site_config.selected_site}`

    // Command to send
    const script_name = getters.selectedScript
    const command = {
      site: rootState.site_config.selected_site,
      mount: rootState.site_config.selected_mount,
      device: 'sequencer',
      instance: rootState.site_config.selected_sequencer,
      user_name,
      user_id,
      user_roles,
      timestamp: parseInt(Date.now() / 1000),
      action: 'run',
      required_params: {
        script: script_name,
        ...getters.getAllParamsFromScript(script_name)
      },
      optional_params: {
        instrument_selector_position: rootState.command_params.selector_position,
        telescope_selection: rootState.command_params.telescope_selection
      }
    }

    // Send the command and log the output
    axios.post(url, command, header).then(response => {
      response = response.data
      // Small UI success notification
      Snackbar.open({
        duration: 5000,
        message: `Script <span class="has-text-weight-bold">${script_name}</span> sent successfully!`,
        type: 'is-success',
        position: 'is-top',
        queue: false,
        actionText: null
      })
    }).catch(error => {
      // Small UI error notification
      Snackbar.open({
        duration: 5000,
        message: `Script <span class="has-text-weight-bold">${script_name}</span> failed to send. <br> ${error}`,
        type: 'is-danger',
        position: 'is-top',
        queue: false,
        actionText: null
      })
    })
  },

  /**
     *  Send a command to the observatory to stop any current running script.
     *  The command is sent to a specific mount at the site (like all commands).
     */
  async scriptStopCommand ({ rootState }, { header, user_name, user_id, user_roles }) {
    // API parameters
    const url = `${rootState.api_endpoints.jobs_api}/newjob`// ?site=${rootState.site_config.selected_site}`
    const site = rootState.site_config.selected_site
    const mount = rootState.site_config.selected_mount

    // Command to send
    const command = {
      site,
      mount,
      device: 'sequencer',
      instance: 'sequencer',
      user_name,
      user_id,
      user_roles,
      timestamp: parseInt(Date.now() / 1000),
      action: 'stop',
      required_params: {},
      optional_params: {}
    }

    // Send the command and log the output
    axios.post(url, command, header).then(response => {
      response = response.data
      // Small UI success notification
      Snackbar.open({
        duration: 5000,
        message: '<span class="has-text-weight-bold"> Stop Script </span> has been sent successfully',
        type: 'is-success',
        position: 'is-top',
        queue: false,
        actionText: null
      })
    }).catch(error => {
      console.warn('error sending script.')
      console.warn(error)
      // Small UI error notification
      Snackbar.open({
        duration: 5000,
        message: `<span class="has-text-weight-bold"> Stop Script </span> failed to send. <br> ${error}`,
        type: 'is-danger',
        position: 'is-top',
        queue: false,
        actionText: null
      })
    })
  },

  /**
     * This action reverts script parameters to their default values for the
     * given script.
     * @param {string} script_name defines the script to reset
     */
  async setScriptDefaults ({ commit, dispatch }, script_name) {
    const defaults = await dispatch('defineScriptDefaults')
    const default_params = defaults[script_name]()

    for (const [paramName, value] of Object.entries(default_params)) {
      commit('updateScriptParam', { scriptName: script_name, paramName, value })
    }
  },

  async setAllDefaults ({ dispatch }) {
    const defaults = await dispatch('defineScriptDefaults')
    Object.keys(defaults).forEach(script => dispatch('setScriptDefaults', script))
  },

  defineScriptDefaults ({ rootGetters }) {
    const camera_config = rootGetters['site_config/selected_camera_config']
    // Set some defaults using the config, with fallbacks in case the config doesn't specify
    // Fallback values were given by Wayne a long time ago... I guess powers of 2 are significant here somehow.
    const number_of_bias_to_collect = camera_config?.settings?.number_of_bias_to_collect || 511
    const number_of_dark_to_collect = camera_config?.settings?.number_of_dark_to_collect || 127
    const number_of_flat_to_collect = camera_config?.settings?.number_of_flat_to_collect || 15
    const dark_exposure_time = camera_config?.settings?.dark_exposure || 120

    return {
      focusAuto () {
        return {
          target: 'near_tycho_star', // alternative: 'use_field'
          bin: 1, // integer: 1, 2, or 4
          area: '100%' // percent, from 0 to 1
        }
      },
      focusExtensive () {
        return {
          target: 'near_tycho_star', // alternative: 'use_field'
          bin: 1, // integer: 1, 2, or 4
          area: '100%' // percent, from 0 to 1
        }
      },
      focusFine () {
        return {
          target: 'near_tycho_star', // alternative: 'use_field'
          bin: 1, // integer: 1, 2, or 4
          area: '100%' // percent, from 0 to 1
        }
      },
      restackLocalCalibrations () {
        return {
          numOfBias: number_of_bias_to_collect,
          darkTime: dark_exposure_time,
          numOfDark: number_of_dark_to_collect,
          coldMap: true,
          hotMap: true
        }
      },
      collectBiasesAndDarks () {
        return {
          numOfBias: number_of_bias_to_collect,
          darkTime: dark_exposure_time,
          numOfDark: number_of_dark_to_collect,
          coldMap: true,
          hotMap: true
        }
      },
      collectScreenFlats () {
        return {
          numFrames: number_of_flat_to_collect,
          gainCalc: true,
          shutterCompensation: true
        }
      },
      collectSkyFlats () {
        return {
          numFrames: number_of_flat_to_collect
        }
      },
      takeLRGBStack () {
        return {
          numFrames: 1,
          skipL: false,
          exposureTime: 30,
          useSloane: false
        }
      },
      takeO3HaS2N2Stack () {
        return {
          numFrames: 1,
          skipO3: false,
          skipHa: false,
          skipS2: false,
          skipN2: false,
          addRGB: false,
          addCR: false,
          addSloane: false,
          addL: false,
          exposureTime: 30
        }
      },
      takeUGRIZSStack () {
        return {
          numFrames: 1,
          skipU: true,
          skipZS: true
        }
      },
      takePlanetStack () {
        return {
          numFrames: 127
        }
      },
      takeLunarStack () {
        return {
          numFrames: 127
        }
      },
      pointingRun () {
        return {
          gridType: 'medium',
          numGridRuns: 1
        }
      }
    }
  }

}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}

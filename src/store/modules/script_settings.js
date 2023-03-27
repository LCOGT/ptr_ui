// import { API } from 'aws-amplify'
import axios from 'axios'
import { SnackbarProgrammatic as Snackbar } from 'buefy'
import { getInstance } from '../../auth/index' // get user object: getInstance().user

// Get username if user is logged in
function username () {
  if (getInstance().user) {
    return getInstance().user.name
  }
  else {
    return 'anonymous'
  }
}
function user_id () {
  if (getInstance().user) {
    return getInstance().user.sub
  }
  else {
    return 'anonymous'
  }
}
function user_roles () {
  if (getInstance().user) {
    const user = getInstance().user
    const roles = user['https://photonranch.org/user_metadata'].roles
    return roles
  } else {
    return []
  }
}
// Get axios request config object (the headers) with auth token
async function getAuthHeader () {
  let token
  try {
    token = await getInstance().getTokenSilently()
  } catch (err) {
    console.error(err)
    console.warn('Did not acquire the needed token. Stopping request.')
  }
  return {
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      'Authorization': `Bearer ${token}`
    }
  }
}

// These default values (organized per script) are used to initialize values,
// and also used when the user wishes to revert back to defaults.
const defaults = {
  collectBiasesAndDarks () {
    return {
      numOfBias: 511,
      darkTime: 120,
      numOfDark: 127,
      dark2Time: 60,
      numOfDark2: 0,
      coldMap: true,
      hotMap: true,
      bin1: true,
      bin2: false,
      bin3: false,
      bin4: false
    }
  },
  collectScreenFlats () {
    return {
      numFrames: 15,
      gainCalc: true,
      shutterCompensation: true
    }
  },
  takeUGRIZSStack () {
    return {
      numFrames: 1,
      skipU: true,
      skipZS: true
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
  collectSkyFlats () {
    return {
      numFrames: 15
    }
  },
  pointingRun () {
    return {
      gridType: 'medium',
      numGridRuns: 1
    }
  },
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
  }
}

// initial vuex state
const state = {

  // The currently active script. This is sent when 'run script' is clicked.
  selectedScript: 'none',

  collectBiasesAndDarks: defaults.collectBiasesAndDarks(),
  collectScreenFlats: defaults.collectScreenFlats(),
  takeUGRIZSStack: defaults.takeUGRIZSStack(),
  takeLRGBStack: defaults.takeLRGBStack(),
  takeO3HaS2N2Stack: defaults.takeO3HaS2N2Stack(),
  takePlanetStack: defaults.takePlanetStack(),
  takeLunarStack: defaults.takeLunarStack(),
  collectSkyFlats: defaults.collectSkyFlats(),
  pointingRun: defaults.pointingRun(),
  focusAuto: defaults.focusAuto(),
  focusExtensive: defaults.focusExtensive(),
  focusFine: defaults.focusFine(),

  // If a script is not in this list, the UI settings button will be disabled.
  scriptsWithSettings: [
    'collectBiasesAndDarks',
    'collectScreenFlats',
    'takeUGRIZSStack',
    'takeLRGBStack',
    'takeO3HaS2N2Stack',
    'takePlanetStack',
    'takeLunarStack',
    'collectSkyFlats',
    'pointingRun',
    'focusAuto',
    'focusExtensive',
    'focusFine'
  ],

  // This is used to fetch a user-friendly name in the UI.
  readableScriptNames: {
    takeLRGBStack: 'Take L/R/G/B Stack',
    takeO3HaS2N2Stack: 'Take O3/Ha/N2/S2 Stack',
    takeUGRIZSStack: 'Take u/g/r/i/zs Stack',
    takePlanetStack: 'Take Planet Stack',
    takeLunarStack: 'Take Lunar Stack',
    collectBiasesAndDarks: 'Collect Biases and Darks',
    collectScreenFlats: 'Collect Screen Flats',
    collectSkyFlats: 'Collect Sky Flats',
    pointingRun: 'Pointing Run',
    focusAuto: 'Focus Auto',
    focusExtensive: 'Focus Extensive',
    focusFine: 'Focus Fine'
  }
}

// vuex getters
const getters = {

  /* General script settings getters */
  selectedScript: state => state.selectedScript,

  scriptHasSettings: state => state.scriptsWithSettings.includes(state.selectedScript),

  getGeneralScriptParam: state => payload => state[payload.script_name][payload.script_param],
  getAllParamsFromScript: state => script_name => state[script_name],

  readableScriptNames: state => state.readableScriptNames,

  /* Specific script getters */
  collectBiasesAndDarks: state => state.collectBiasesAndDarks,
  collectBiasesAndDarks_numOfBias: state => state.collectBiasesAndDarks.numOfBias,
  collectBiasesAndDarks_darkTime: state => state.collectBiasesAndDarks.darkTime,
  collectBiasesAndDarks_numOfDark: state => state.collectBiasesAndDarks.numOfDark,
  collectBiasesAndDarks_dark2Time: state => state.collectBiasesAndDarks.dark2Time,
  collectBiasesAndDarks_numOfDark2: state => state.collectBiasesAndDarks.numOfDark2,
  collectBiasesAndDarks_coldMap: state => state.collectBiasesAndDarks.coldMap,
  collectBiasesAndDarks_hotMap: state => state.collectBiasesAndDarks.hotMap,
  collectBiasesAndDarks_bin1: state => state.collectBiasesAndDarks.bin1,
  collectBiasesAndDarks_bin2: state => state.collectBiasesAndDarks.bin2,
  collectBiasesAndDarks_bin3: state => state.collectBiasesAndDarks.bin3,
  collectBiasesAndDarks_bin4: state => state.collectBiasesAndDarks.bin4,

  collectScreenFlats: state => state.collectScreenFlats,
  collectScreenFlats_numFrames:
        state => state.collectScreenFlats.numFrames,
  collectScreenFlats_gainCalc:
        state => state.collectScreenFlats.gainCalc,
  collectScreenFlats_shutterCompensation:
        state => state.collectScreenFlats.shutterCompensation,

  takeUGRIZSStack: state => state.takeUGRIZSStack,
  takeUGRIZSStack_numFrames: state => state.takeUGRIZSStack.numFrames,
  takeUGRIZSStack_skipU: state => state.takeUGRIZSStack.skipU,
  takeUGRIZSStack_skipZS: state => state.takeUGRIZSStack.skipZS,

  takeLRGBStack: state => state.takeLRGBStack,
  takeLRGBStack_numFrames: state => state.takeLRGBStack.numFrames,
  takeLRGBStack_skipL: state => state.takeLRGBStack.skipL,
  takeLRGBStack_exposureTime: state => state.takeLRGBStack.exposureTime,
  takeLRGBStack_useSloane: state => state.takeLRGBStack.useSloane,

  takeO3HaS2N2Stack: state => state.takeO3HaS2N2Stack,
  takeO3HaS2N2Stack_numFrames: state => state.takeO3HaS2N2Stack.numFrames,
  takeO3HaS2N2Stack_skipO3: state => state.takeO3HaS2N2Stack.skipO3,
  takeO3HaS2N2Stack_skipHa: state => state.takeO3HaS2N2Stack.skipHa,
  takeO3HaS2N2Stack_skipS2: state => state.takeO3HaS2N2Stack.skipS2,
  takeO3HaS2N2Stack_skipN2: state => state.takeO3HaS2N2Stack.skipN2,
  takeO3HaS2N2Stack_addRGB: state => state.takeO3HaS2N2Stack.addRGB,
  takeO3HaS2N2Stack_addCR: state => state.takeO3HaS2N2Stack.addCR,
  takeO3HaS2N2Stack_addSloane: state => state.takeO3HaS2N2Stack.addSloane,
  takeO3HaS2N2Stack_addL: state => state.takeO3HaS2N2Stack.addL,
  takeO3HaS2N2Stack_exposureTime: state => state.takeO3HaS2N2Stack.exposureTime,

  takePlanetStack: state => state.takePlanetStack,
  takePlanetStack_numFrames: state => state.takePlanetStack.numFrames,

  takeLunarStack: state => state.takeLunarStack,
  takeLunarStack_numFrames: state => state.takeLunarStack.numFrames,

  collectSkyFlats: state => state.collectSkyFlats,
  collectSkyFlats_numFrames: state => state.collectSkyFlats.numFrames,

  pointingRun_gridType: state => state.pointingRun.gridType,
  pointingRun_numGridRuns: state => state.pointingRun.numGridRuns,

  focusAuto_target: state => state.focusAuto.target,
  focusAuto_bin: state => state.focusAuto.bin,
  focusAuto_area: state => state.focusAuto.area,

  focusExtensive_target: state => state.focusExtensive.target,
  focusExtensive_bin: state => state.focusExtensive.bin,
  focusExtensive_area: state => state.focusExtensive.area,

  focusFine_target: state => state.focusFine.target,
  focusFine_bin: state => state.focusFine.bin,
  focusFine_area: state => state.focusFine.area
}

// vuex mutations
const mutations = {

  selectedScript (state, script) { state.selectedScript = script },

  // Set a script param defined by the script_name, script_param, and val.
  // Set these three key/val pairs in 'payload'.
  generalScriptParam (state, payload) {
    state[payload.script_name][payload.script_param] = payload.val
  },

  collectBiasesAndDarks_numOfBias (state, val) { state.collectBiasesAndDarks.numOfBias = val },
  collectBiasesAndDarks_darkTime (state, val) { state.collectBiasesAndDarks.darkTime = val },
  collectBiasesAndDarks_numOfDark (state, val) { state.collectBiasesAndDarks.numOfDark = val },
  collectBiasesAndDarks_dark2Time (state, val) { state.collectBiasesAndDarks.dark2Time = val },
  collectBiasesAndDarks_numOfDark2 (state, val) { state.collectBiasesAndDarks.numOfDark2 = val },
  collectBiasesAndDarks_coldMap (state, val) { state.collectBiasesAndDarks.coldMap = val },
  collectBiasesAndDarks_hotMap (state, val) { state.collectBiasesAndDarks.hotMap = val },
  collectBiasesAndDarks_bin1 (state, val) { state.collectBiasesAndDarks.bin1 = val },
  collectBiasesAndDarks_bin2 (state, val) { state.collectBiasesAndDarks.bin2 = val },
  collectBiasesAndDarks_bin3 (state, val) { state.collectBiasesAndDarks.bin3 = val },
  collectBiasesAndDarks_bin4 (state, val) { state.collectBiasesAndDarks.bin4 = val },

  collectScreenFlats_numFrames (state, val) { state.collectScreenFlats.numFrames = val },
  collectScreenFlats_gainCalc (state, val) { state.collectScreenFlats.gainCalc = val },
  collectScreenFlats_shutterCompensation (state, val) { state.collectScreenFlats.shutterCompensation = val },

  takeUGRIZSStack_numFrames (state, val) { state.takeUGRIZSStack.numFrames = val },
  takeUGRIZSStack_skipU (state, val) { state.takeUGRIZSStack.skipU = val },
  takeUGRIZSStack_skipZS (state, val) { state.takeUGRIZSStack.skipZS = val },

  takeLRGBStack_numFrames (state, val) { state.takeLRGBStack.numFrames = val },
  takeLRGBStack_skipL (state, val) { state.takeLRGBStack.skipL = val },
  takeLRGBStack_exposureTime (state, val) { state.takeLRGBStack.exposureTime = val },
  takeLRGBStack_useSloane (state, val) { state.takeLRGBStack.useSloane = val },

  takeO3HaS2N2Stack_numFrames (state, val) { state.takeO3HaS2N2Stack.numFrames = val },
  takeO3HaS2N2Stack_skipO3 (state, val) { state.takeO3HaS2N2Stack.skipO3 = val },
  takeO3HaS2N2Stack_skipHa (state, val) { state.takeO3HaS2N2Stack.skipHa = val },
  takeO3HaS2N2Stack_skipS2 (state, val) { state.takeO3HaS2N2Stack.skipS2 = val },
  takeO3HaS2N2Stack_skipN2 (state, val) { state.takeO3HaS2N2Stack.skipN2 = val },
  takeO3HaS2N2Stack_addRGB (state, val) { state.takeO3HaS2N2Stack.addRGB = val },
  takeO3HaS2N2Stack_addCR (state, val) { state.takeO3HaS2N2Stack.addCR = val },
  takeO3HaS2N2Stack_addSloane (state, val) { state.takeO3HaS2N2Stack.addSloane = val },
  takeO3HaS2N2Stack_addL (state, val) { state.takeO3HaS2N2Stack.addL = val },
  takeO3HaS2N2Stack_exposureTime (state, val) { state.takeO3HaS2N2Stack.exposureTime = val },

  takePlanetStack_numFrames (state, val) { state.takePlanetStack.numFrames = val },

  takeLunarStack_numFrames (state, val) { state.takeLunarStack.numFrames = val },

  collectSkyFlats_numFrames (state, val) { state.collectSkyFlats.numFrames = val },

  pointingRun_gridType (state, val) { state.pointingRun.gridType = val },
  pointingRun_numGridRuns (state, val) { state.pointingRun.numGridRuns = val },

  focusAuto_target (state, val) { state.focusAuto.target = val },
  focusAuto_bin (state, val) { state.focusAuto.bin = val },
  focusAuto_area (state, val) { state.focusAuto.area = val },

  focusExtensive_target (state, val) { state.focusExtensive.target = val },
  focusExtensive_bin (state, val) { state.focusExtensive.bin = val },
  focusExtensive_area (state, val) { state.focusExtensive.area = val },

  focusFine_target (state, val) { state.focusFine.target = val },
  focusFine_bin (state, val) { state.focusFine.bin = val },
  focusFine_area (state, val) { state.focusFine.area = val }
}

// vuex actions
const actions = {

  /**
     *  Send a command to the observatory to stop any current running script.
     *  The command is sent to a specific mount at the site (like all commands).
     */
  async script_run_command ({ getters, rootState }) {
    const url = `${rootState.api_endpoints.jobs_api}/newjob?site=${rootState.site_config.selected_site}`
    const header = await getAuthHeader()

    // Command to send
    const script_name = getters.selectedScript
    const command = {
      site: rootState.site_config.selected_site,
      mount: rootState.site_config.selected_mount,
      device: 'sequencer',
      instance: rootState.site_config.selected_sequencer,
      user_name: username(),
      user_id: user_id(),
      user_roles: user_roles(),
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
  async script_stop_command ({ rootState }) {
    // API parameters
    const url = `${rootState.api_endpoints.jobs_api}/newjob`// ?site=${rootState.site_config.selected_site}`
    const header = await getAuthHeader()
    const site = rootState.site_config.selected_site
    const mount = rootState.site_config.selected_mount

    // Command to send
    const command = {
      site,
      mount,
      device: 'sequencer',
      instance: 'sequencer',
      user_name: username(),
      user_id: user_id(),
      user_roles: user_roles(),
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
     * given script. It takes values from the 'defaults' object defined above.
     * @param {string} script_name defines the script to reset
     */
  setScriptDefaults ({ commit }, script_name) {
    // Get the default values
    const default_params = defaults[script_name]()
    // For each key/val pair in the defaults object
    Object.entries(default_params).forEach(function (keyval) {
      // Define the name, key, and val (used in the mutation)
      const payload = {
        script_name,
        script_param: keyval[0],
        val: keyval[1]
      }
      // Commit the mutation for the param. This is done for each value.
      commit('generalScriptParam', payload)
    })
  }

}

export default {
  state,
  getters,
  actions,
  mutations
}

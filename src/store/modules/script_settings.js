//import { API } from 'aws-amplify'
import axios from 'axios'
import { SnackbarProgrammatic as Snackbar } from 'buefy';
import { getInstance } from '../../auth/index' // get user object: getInstance().user

// Get username if user is logged in
function username() {
    if (getInstance().user) {
        return getInstance().user.name
    }
    else {
        return 'anonymous'
    }
}

// These default values (organized per script) are used to initialize values,
// and also used when the user wishes to revert back to defaults.
const defaults = {
    genBiasDarkMaster() {
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
            bin4: false,
        }
    },
    genScreenFlatMasters() {
        return {
            numFrames: 15,
            gainCalc: true,
            shutterCompensation: true,
        }
    },
    takeUGRIZSStack() {
        return {
            numFrames: 1,
            skipU: true,
            skipZS: true,
        }
    },
    takeLRGBStack() {
        return {
            numFrames: 1,
            skipL: false,
            exposureTime: 30,
            useSloane: false,
        }
    },
    takeO3HaS2N2Stack() {
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
            exposureTime: 30,
        }
    },
    takePlanetStack() {
        return {
            numFrames: 127,
        }
    },
    takeLunarStack() {
        return {
            numFrames: 127,
        }
    },
    takeSkyFlats() {
        return {
            numFrames: 15,
        }
    },
    pointingRun() {
        return {
            gridType: "medium",
            numGridRuns: 1,
        }
    },
    focusAuto() {
        return {
            target: "near_tycho_star", // alternative: 'use_field'
            bin: 1, // integer: 1, 2, or 4
            area: "100%", // percent, from 0 to 1
        }
    },
    focusFine() {
        return {
            target: "near_tycho_star", // alternative: 'use_field'
            bin: 1, // integer: 1, 2, or 4
            area: "100%", // percent, from 0 to 1
        }
    },
    focusVcurve() {
        return {
            target: "near_tycho_star", // alternative: 'use_field'
            bin: 1, // integer: 1, 2, or 4
            area: "100%", // percent, from 0 to 1
        }
    },
}

// initial vuex state
const state = {

    // The currently active script. This is sent when 'run script' is clicked.
    selectedScript: "none",

    genBiasDarkMaster: defaults.genBiasDarkMaster(),
    genScreenFlatMasters: defaults.genScreenFlatMasters(),
    takeUGRIZSStack: defaults.takeUGRIZSStack(),
    takeLRGBStack: defaults.takeLRGBStack(),
    takeO3HaS2N2Stack: defaults.takeO3HaS2N2Stack(),
    takePlanetStack: defaults.takePlanetStack(),
    takeLunarStack: defaults.takeLunarStack(),
    takeSkyFlats: defaults.takeSkyFlats(),
    pointingRun: defaults.pointingRun(),
    focusAuto: defaults.focusAuto(),
    focusFine: defaults.focusFine(),
    focusVcurve: defaults.focusVcurve(),

    // If a script is not in this list, the UI settings button will be disabled.
    scriptsWithSettings: [
        'genBiasDarkMaster',
        'genScreenFlatMasters',
        'takeUGRIZSStack',
        'takeLRGBStack',
        'takeO3HaS2N2Stack',
        'takePlanetStack',
        'takeLunarStack',
        'takeSkyFlats',
        'pointingRun',
        'focusAuto',
        'focusFine',
        'focusVcurve',
    ],

    // This is used to fetch a user-friendly name in the UI.
    readableScriptNames: {
        takeLRGBStack: 'Take L/R/G/B Stack',
        takeO3HaS2N2Stack: 'Take O3/Ha/N2/S2 Stack',
        takeUGRIZSStack: 'Take u/g/r/i/zs Stack',
        takePlanetStack: 'Take Planet Stack',
        takeLunarStack: 'Take Lunar Stack',
        genBiasDarkMaster: 'Generate Bias/Dark Master',
        genScreenFlatMasters: 'Generate Screen-Flat Masters',
        takeSkyFlats: 'Take Sky-Flats',
        pointingRun: 'Pointing Run',
        focusAuto: 'Focus Auto',
        focusFine: 'Focus Fine',
        focusVcurve: 'Focus V-Curve',
    },
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
    genBiasDarkMaster: state => state.genBiasDarkMaster,
    genBiasDarkMaster_numOfBias: state => state.genBiasDarkMaster.numOfBias,
    genBiasDarkMaster_darkTime: state => state.genBiasDarkMaster.darkTime, 
    genBiasDarkMaster_numOfDark: state => state.genBiasDarkMaster.numOfDark, 
    genBiasDarkMaster_dark2Time: state => state.genBiasDarkMaster.dark2Time, 
    genBiasDarkMaster_numOfDark2: state => state.genBiasDarkMaster.numOfDark2, 
    genBiasDarkMaster_coldMap: state => state.genBiasDarkMaster.coldMap, 
    genBiasDarkMaster_hotMap: state => state.genBiasDarkMaster.hotMap, 
    genBiasDarkMaster_bin1: state => state.genBiasDarkMaster.bin1, 
    genBiasDarkMaster_bin2: state => state.genBiasDarkMaster.bin2, 
    genBiasDarkMaster_bin3: state => state.genBiasDarkMaster.bin3, 
    genBiasDarkMaster_bin4: state => state.genBiasDarkMaster.bin4, 

    genScreenFlatMasters: state => state.genScreenFlatMasters,
    genScreenFlatMasters_numFrames: 
        state => state.genScreenFlatMasters.numFrames,
    genScreenFlatMasters_gainCalc: 
        state => state.genScreenFlatMasters.gainCalc,
    genScreenFlatMasters_shutterCompensation: 
        state => state.genScreenFlatMasters.shutterCompensation,

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

    takeSkyFlats: state => state.takeSkyFlats,
    takeSkyFlats_numFrames: state => state.takeSkyFlats.numFrames,

    pointingRun_gridType: state => state.pointingRun.gridType,
    pointingRun_numGridRuns: state => state.pointingRun.numGridRuns,

    focusAuto_target: state => state.focusAuto.target,
    focusAuto_bin: state => state.focusAuto.bin,
    focusAuto_area: state => state.focusAuto.area,

    focusFine_target: state => state.focusFine.target,
    focusFine_bin: state => state.focusFine.bin,
    focusFine_area: state => state.focusFine.area,

    focusVcurve_target: state => state.focusVcurve.target,
    focusVcurve_bin: state => state.focusVcurve.bin,
    focusVcurve_area: state => state.focusVcurve.area,

}

// vuex mutations
const mutations = {

    selectedScript(state, script) { state.selectedScript = script },

    // Set a script param defined by the script_name, script_param, and val. 
    // Set these three key/val pairs in 'payload'. 
    generalScriptParam(state, payload) {
        state[payload.script_name][payload.script_param] = payload.val
    },

    genBiasDarkMaster_numOfBias(state, val) { state.genBiasDarkMaster.numOfBias = val },
    genBiasDarkMaster_darkTime(state, val) { state.genBiasDarkMaster.darkTime= val },
    genBiasDarkMaster_numOfDark(state, val) { state.genBiasDarkMaster.numOfDark= val },
    genBiasDarkMaster_dark2Time(state, val) { state.genBiasDarkMaster.dark2Time= val },
    genBiasDarkMaster_numOfDark2(state, val) { state.genBiasDarkMaster.numOfDark2= val },
    genBiasDarkMaster_coldMap(state, val) { state.genBiasDarkMaster.coldMap= val },
    genBiasDarkMaster_hotMap(state, val) { state.genBiasDarkMaster.hotMap= val },
    genBiasDarkMaster_bin1(state, val) { state.genBiasDarkMaster.bin1 = val },
    genBiasDarkMaster_bin2(state, val) { state.genBiasDarkMaster.bin2 = val },
    genBiasDarkMaster_bin3(state, val) { state.genBiasDarkMaster.bin3 = val },
    genBiasDarkMaster_bin4(state, val) { state.genBiasDarkMaster.bin4 = val },

    genScreenFlatMasters_numFrames(state, val) { state.genScreenFlatMasters.numFrames = val },
    genScreenFlatMasters_gainCalc(state, val) { state.genScreenFlatMasters.gainCalc= val },
    genScreenFlatMasters_shutterCompensation(state, val) { state.genScreenFlatMasters.shutterCompensation= val },

    takeUGRIZSStack_numFrames(state, val) { state.takeUGRIZSStack.numFrames = val },
    takeUGRIZSStack_skipU(state, val) { state.takeUGRIZSStack.skipU= val },
    takeUGRIZSStack_skipZS(state, val) { state.takeUGRIZSStack.skipZS= val },

    takeLRGBStack_numFrames(state, val) { state.takeLRGBStack.numFrames = val },
    takeLRGBStack_skipL(state, val) { state.takeLRGBStack.skipL = val },
    takeLRGBStack_exposureTime(state, val) { state.takeLRGBStack.exposureTime = val },
    takeLRGBStack_useSloane(state, val) { state.takeLRGBStack.useSloane = val },

    takeO3HaS2N2Stack_numFrames(state, val) { state.takeO3HaS2N2Stack.numFrames = val },
    takeO3HaS2N2Stack_skipO3(state, val) { state.takeO3HaS2N2Stack.skipO3 = val },
    takeO3HaS2N2Stack_skipHa(state, val) { state.takeO3HaS2N2Stack.skipHa = val },
    takeO3HaS2N2Stack_skipS2(state, val) { state.takeO3HaS2N2Stack.skipS2 = val },
    takeO3HaS2N2Stack_skipN2(state, val) { state.takeO3HaS2N2Stack.skipN2 = val },
    takeO3HaS2N2Stack_addRGB(state, val) { state.takeO3HaS2N2Stack.addRGB = val },
    takeO3HaS2N2Stack_addCR(state, val) { state.takeO3HaS2N2Stack.addCR = val },
    takeO3HaS2N2Stack_addSloane(state, val) { state.takeO3HaS2N2Stack.addSloane = val },
    takeO3HaS2N2Stack_addL(state, val) { state.takeO3HaS2N2Stack.addL = val },
    takeO3HaS2N2Stack_exposureTime(state, val) { state.takeO3HaS2N2Stack.exposureTime = val },

    takePlanetStack_numFrames(state, val) { state.takePlanetStack.numFrames = val },

    takeLunarStack_numFrames(state, val) { state.takeLunarStack.numFrames = val },

    takeSkyFlats_numFrames(state, val) { state.takeSkyFlats.numFrames = val },

    pointingRun_gridType(state, val) { state.pointingRun.gridType = val },
    pointingRun_numGridRuns(state, val) { state.pointingRun.numGridRuns = val },

    focusAuto_target(state, val) { state.focusAuto.target = val },
    focusAuto_bin(state, val) { state.focusAuto.bin = val },
    focusAuto_area(state, val) { state.focusAuto.area = val },

    focusFine_target(state, val) { state.focusFine.target = val },
    focusFine_bin(state, val) { state.focusFine.bin = val },
    focusFine_area(state, val) { state.focusFine.area = val },

    focusVcurve_target(state, val) { state.focusVcurve.target = val },
    focusVcurve_bin(state, val) { state.focusVcurve.bin = val },
    focusVcurve_area(state, val) { state.focusVcurve.area = val },
}

// vuex actions
const actions = {

    /**
     *  Send a command to the observatory to stop any current running script.
     *  The command is sent to a specific mount at the site (like all commands).
     */
    script_run_command({ getters, rootState }) {

        let url = `https://jobs.photonranch.org/jobs/newjob`

        // Command to send
        let script_name = getters.selectedScript
        let command = {
            site: rootState.site_config.selected_site,
            mount: rootState.site_config.selected_mount,
            device: 'sequencer',
            instance: rootState.site_config.selected_sequencer,
            user: username(),
            timestamp: parseInt(Date.now() / 1000),
            action: 'run',
            required_params: {
                script:script_name,
                ...getters.getAllParamsFromScript(script_name),
            },
            optional_params: {}
        }
        
        // Send the command and log the output
        axios.post(url, command).then(response => {
            response = response.data
            console.log(response)
            console.log(command)
            // Small UI success notification
            Snackbar.open({
                duration: 5000,
                message: `Script <span class="has-text-weight-bold">${script_name}</span> sent successfully!`,
                type: "is-success",
                position: "is-top",
                queue: false,
                actionText: null,
            });
        }).catch(error => {
            console.log("error sending script.")
            console.log(error)
            // Small UI error notification
            Snackbar.open({
                duration: 5000,
                message: `Script <span class="has-text-weight-bold">${script_name}</span> failed to send. <br> ${error}`,
                type: "is-danger",
                position: "is-top",
                queue: false,
                actionText: null,
            });
        })
    },

    /**
     *  Send a command to the observatory to stop any current running script.
     *  The command is sent to a specific mount at the site (like all commands).
     */
    script_stop_command({ rootState }) {

        // API parameters
        let apiName = rootState.dev.active_api;
        let site = rootState.site_config.selected_site;
        let mount = rootState.site_config.selected_mount;
        let path = `/${site}/${mount}/command/`

        // Command to send
        let command = {
            device: 'sequencer',
            instance: 'sequencer',
            timestamp: parseInt(Date.now() / 1000),
            action: 'stop',
            required_params: {},
            optional_params: {}
        }

        // Send the command and log the output
        axios.post(apiName+path, {body: command}).then(response => {
            response = response.data
            console.log(response)
            // Small UI success notification
            Snackbar.open({
                duration: 5000,
                message: `<span class="has-text-weight-bold"> Stop Script </span> has been sent successfully`,
                type: "is-success",
                position: "is-top",
                queue: false,
                actionText: null,
            });
        }).catch(error => {
            console.log("error sending script.")
            console.log(error)
            // Small UI error notification
            Snackbar.open({
                duration: 5000,
                message: `<span class="has-text-weight-bold"> Stop Script </span> failed to send. <br> ${error}`,
                type: "is-danger",
                position: "is-top",
                queue: false,
                actionText: null,
            });
        })

    },

    /**
     * This action reverts script parameters to their default values for the
     * given script. It takes values from the 'defaults' object defined above.
     * @param {string} script_name defines the script to reset
     */
    setScriptDefaults({ commit }, script_name) {
        // Get the default values
        let default_params = defaults[script_name]()
        // For each key/val pair in the defaults object
        Object.entries(default_params).map(function(keyval){
            // Define the name, key, and val (used in the mutation)
            let payload = {
                script_name: script_name,
                script_param: keyval[0],
                val: keyval[1],
            }
            // Commit the mutation for the param. This is done for each value.
            commit('generalScriptParam', payload)
        })
    },

}


export default {
    state,
    getters,
    actions,
    mutations
}
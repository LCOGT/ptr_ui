import { API } from 'aws-amplify'
import { SnackbarProgrammatic as Snackbar } from 'buefy';


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
        }
    },
    takeO3HaS2N2Stack() {
        return {
            numFrames: 1,
            skipO3: false,
            skipHa: false,
            skipS2: false,
            skipN2: false,
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
    }
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

    takeO3HaS2N2Stack: state => state.takeO3HaS2N2Stack,
    takeO3HaS2N2Stack_numFrames: state => state.takeO3HaS2N2Stack.numFrames,
    takeO3HaS2N2Stack_skipO3: state => state.takeO3HaS2N2Stack.skipO3,
    takeO3HaS2N2Stack_skipHa: state => state.takeO3HaS2N2Stack.skipHa,
    takeO3HaS2N2Stack_skipS2: state => state.takeO3HaS2N2Stack.skipS2,
    takeO3HaS2N2Stack_skipN2: state => state.takeO3HaS2N2Stack.skipN2,

    takePlanetStack: state => state.takePlanetStack,
    takePlanetStack_numFrames: state => state.takePlanetStack.numFrames,

    takeLunarStack: state => state.takeLunarStack,
    takeLunarStack_numFrames: state => state.takeLunarStack.numFrames,

    takeSkyFlats: state => state.takeSkyFlats,
    takeSkyFlats: state => state.takeSkyFlats.numFrames,

}

// vuex actions
const actions = {

    /**
     *  Send a command to the observatory to stop any current running script.
     *  The command is sent to a specific mount at the site (like all commands).
     */
    script_run_command({ getters, rootState }) {

        // API parameters
        let apiName = rootState.dev.active_api;
        let site = rootState.observatory_configuration.selected_site;
        let mount = rootState.observatory_configuration.selected_mount;
        let path = `/${site}/${mount}/command/`

        // Command to send
        let script_name = getters.selectedScript
        let command = {
            device: 'sequencer',
            instance: 'sequencer',
            timestamp: parseInt(Date.now() / 1000),
            action: 'run',
            required_params: {
                script:script_name,
                ...getters.getAllParamsFromScript(script_name),
            },
            optional_params: {}
        }
        
        // Send the command and log the output
        API.post(apiName, path, {body:command}).then(response => {
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
        let site = rootState.observatory_configuration.selected_site;
        let mount = rootState.observatory_configuration.selected_mount;
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
        API.post(apiName, path, {body: command}).then(response => {
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

    genScreenFlatMasters_numFrames(state, val) { state.genScreenFlatMasters.numFrames = val },
    genScreenFlatMasters_gainCalc(state, val) { state.genScreenFlatMasters.gainCalc= val },
    genScreenFlatMasters_shutterCompensation(state, val) { state.genScreenFlatMasters.shutterCompensation= val },

    takeUGRIZSStack_numFrames(state, val) { state.takeUGRIZSStack.numFrames = val },
    takeUGRIZSStack_skipU(state, val) { state.takeUGRIZSStack.skipU= val },
    takeUGRIZSStack_skipZS(state, val) { state.takeUGRIZSStack.skipZS= val },

    takeLRGBStack_numFrames(state, val) { state.takeLRGBStack.numFrames = val },
    takeLRGBStack_skipL(state, val) { state.takeLRGBStack.skipL = val },

    takeO3HaS2N2Stack_numFrames(state, val) { state.takeO3HaS2N2Stack.numFrames = val },
    takeO3HaS2N2Stack_skipO3(state, val) { state.takeO3HaS2N2Stack.skipO3 = val },
    takeO3HaS2N2Stack_skipHa(state, val) { state.takeO3HaS2N2Stack.skipHa = val },
    takeO3HaS2N2Stack_skipS2(state, val) { state.takeO3HaS2N2Stack.skipS2 = val },
    takeO3HaS2N2Stack_skipN2(state, val) { state.takeO3HaS2N2Stack.skipN2 = val },

    takePlanetStack_numFrames(state, val) { state.takePlanetStack.numFrames = val },

    takeLunarStack_numFrames(state, val) { state.takeLunarStack.numFrames = val },

    takeSkyFlats(state, val) { state.takeSkyFlats.numFrames = val },
}

export default {
    state,
    getters,
    actions,
    mutations
}
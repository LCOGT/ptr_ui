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
}

// initial vuex state
const state = {

    // The currently active script. This is sent when 'run script' is clicked.
    selectedScript: "none",

    genBiasDarkMaster: defaults.genBiasDarkMaster(),
    genScreenFlatMasters: defaults.genScreenFlatMasters(),
    takeUGRIZSStack: defaults.takeUGRIZSStack(),

    // If a script is not in this list, the UI settings button will be disabled.
    scriptsWithSettings: [
        'genBiasDarkMaster',
        'genScreenFlatMasters',
        'takeUGRIZSStack',
    ]
}

// vuex getters
const getters = {

    /* General script settings getters */
    selectedScript: state => state.selectedScript,

    scriptHasSettings: state => state.scriptsWithSettings.includes(state.selectedScript),

    getGeneralScriptParam: state => payload => state[payload.script_name][payload.script_param],
    getAllParamsFromScript: state => script_name => state[script_name],

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

}

// vuex actions
const actions = {

    /**
     *  Send a command to the observatory to stop any current running script.
     *  The command is sent to a specific mount at the site (like all commands).
     */
    script_run_command({ getters, rootState }) {

        // API parameters
        let apiName = 'ptr-api';
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
        let apiName = 'ptr-api';
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

}

export default {
    state,
    getters,
    actions,
    mutations
}
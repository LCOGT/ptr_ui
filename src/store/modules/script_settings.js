import { API } from 'aws-amplify'

// initial state
const state = {
    selectedScript: "none",

    genBiasDarkMaster: {
        numOfBias: 1,
        darkTime: 300,
        numOfDark: 1,
        dark2Time: 300,
        numOfDark2: 1,
        coldMap: true,
        hotMap: true,
    },
    genScreenFlatMasters: {
        numFrames: 15,
        gainCalc: true,
        shutterCompensation: true,
    },
    takeUGRIZSStack: {
        numFrames: 1,
        skipU: true,
        skipZS: true,
    },

    // If a script is not in this list, the UI settings button will be disabled.
    scriptsWithSettings: [
        'genBiasDarkMaster',
        'genScreenFlatMasters',
        'takeUGRIZSStack',
    ]
}

// getters
const getters = {

    /* General script settings getters */
    getSelectedScript: state => state.selectedScript,

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

// actions
const actions = {

    script_run_command({ getters, rootState }) {

        // API parameters
        let apiName = 'ptr-api';
        let site = rootState.observatory_configuration.selected_site;
        let mount = rootState.observatory_configuration.selected_mount;
        let path = `/${site}/${mount}/command/`

        // Command to send
        let script_name = getters.getSelectedScript
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
        }).catch(error => {
            console.log("error sending script.")
            console.log(error)
        })
    },

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
        }).catch(error => {
            console.log("error sending script.")
            console.log(error)
        })

    }
}

// mutations
const mutations = {

    setSelectedScript(state, script) { state.selectedScript = script },

    set_generalScriptParam(state, payload) {
        state[payload.script_name][payload.script_param] = payload.val
    },

    set_genBiasDarkMaster_numOfBias(state, val) { state.genBiasDarkMaster.numOfBias = val },
    set_genBiasDarkMaster_darkTime(state, val) { state.genBiasDarkMaster.darkTime= val },
    set_genBiasDarkMaster_numOfDark(state, val) { state.genBiasDarkMaster.numOfDark= val },
    set_genBiasDarkMaster_dark2Time(state, val) { state.genBiasDarkMaster.dark2Time= val },
    set_genBiasDarkMaster_numOfDark2(state, val) { state.genBiasDarkMaster.numOfDark2= val },
    set_genBiasDarkMaster_coldMap(state, val) { state.genBiasDarkMaster.coldMap= val },
    set_genBiasDarkMaster_hotMap(state, val) { state.genBiasDarkMaster.hotMap= val },

    set_genScreenFlatMasters_numFrames(state, val) { state.genScreenFlatMasters.numFrames = val },
    set_genScreenFlatMasters_gainCalc(state, val) { state.genScreenFlatMasters.gainCalc= val },
    set_genScreenFlatMasters_shutterCompensation(state, val) { state.genScreenFlatMasters.shutterCompensation= val },

    set_takeUGRIZSStack_numFrames(state, val) { state.takeUGRIZSStack.numFrames = val },
    set_takeUGRIZSStack_skipU(state, val) { state.takeUGRIZSStack.skipU= val },
    set_takeUGRIZSStack_skipZS(state, val) { state.takeUGRIZSStack.skipZS= val },

}

export default {
    state,
    getters,
    actions,
    mutations
}
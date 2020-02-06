//import { API } from 'aws-amplify'
import axios from 'axios'

// Used to initialize state, and to replace stale state anytime the server can't be reached.
var emptyState = function() {
    return {
        allState: {},
        mount: {},
        telescope: {},
        camera: {},
        focuser: {},
        rotator: {},
        filter_wheel: {},
        enclosure: {},
        screen: {},
        sequencer: {},
        observingConditions: {},
        timestamp: '',
    }
}

// initial state
const state = emptyState();

// getters
const getters = {

    /* All the state, per instrument type */
    allState: state => state,
    mount: state => state.mount || [],
    telescope: state => state.telescope,
    camera: state => state.camera,
    filter_wheel: state => state.filter_wheel,
    focuser: state => state.focuser,
    rotator: state => state.rotator,
    screen: state => state.screen,
    sequencer: state => state.sequencer,
    observingConditions: state => state.observing_conditions,
    timestamp: state => state.timestamp,
}

// actions
const actions = {
    updateStatus({ commit, rootState}) {

        // Get the active site from the observatory_configuration module
        let site = rootState.observatory_configuration.selected_site;

        // Set empty values if a specific site has not been selected.
        if (site == '') {
            commit('setMount', [])
            commit('setTelescope', [])
            commit('setCamera', [])
            commit('setFilterWheel', [])
            commit('setFocuser', [])
            commit('setFilterWheel', [])
            commit('setRotator', [])
            commit('setScreen', [])
            commit('setSequencer', [])
            commit('setObservingConditions', [])
            commit('setTimestamp', '')
        }
        // Otherwise, refresh the state for the selected site.
        else {
            let apiName = rootState.dev.active_api;
            // 'site' is referencing the item in the observatory_configuration vuex module
            let path = `/${site}/status/`;
            //API.get(apiName, path).then(response => {
            axios.get(apiName+path).then(response => {
                response = response.data
                commit('setMount', response.content.mount)
                commit('setTelescope', response.content.telescope)
                commit('setCamera', response.content.camera)
                commit('setFilterWheel', response.content.filter_wheel)
                commit('setFocuser', response.content.focuser)
                commit('setFilterWheel', response.content.filter_wheel)
                commit('setRotator', response.content.rotator)
                commit('setScreen', response.content.screen)
                commit('setSequencer', response.content.sequencer)
                commit('setObservingConditions', response.content.observing_conditions)
                commit('setTimestamp', response.content.timestamp)
            }).catch(error => {
                console.log(error)
            });
        }
    }
}

// mutations
const mutations = {
    setTimestamp(state, timestamp) { state.timestamp = timestamp },
    setMount(state, mount) { state.mount = mount },
    setTelescope(state, telescope) { state.telescope = telescope },
    setCamera(state, camera) { state.camera = camera },
    setFocuser(state, focuser) { state.focuser = focuser },
    setFilterWheel(state, filter_wheel) { state.filter_wheel = filter_wheel },
    setRotator(state, rotator) { state.rotator = rotator },
    setScreen(state, screen) { state.screen = screen },
    setSequencer(state, sequencer) {state.sequencer = sequencer },
    setObservingConditions(state, wx) {state.observingConditions = wx },
    setEmptyState(state) {
        for (var key in emptyState()) {
            if (state.hasOwnProperty(key)) {
                state[key] = empty[key]
            }
        }
    },
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}



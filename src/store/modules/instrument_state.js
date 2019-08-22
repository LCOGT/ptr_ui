import { API } from 'aws-amplify'

// Used to initialize state, and to replace stale state anytime the server can't be reached.
var emptyState = function() {
    return {
        mount: {},
        telescope: {},
        camera: {},
        focuser: {},
        rotator: {},
        filter_wheel: {},
        enclosure: {},
        screen: {},
        timestamp: '',
    }
}

// initial state
const state = emptyState();

// getters
const getters = {

    /* All the state, per instrument type */
    mount: state => state.mount || [],
    telescope: state => state.telescope,
    camera: state => state.camera,
    filter_wheel: state => state.filter_wheel,
    focuser: state => state.focuser,
    rotator: state => state.rotator,
    timestamp: state => state.timestamp,
<<<<<<< HEAD
    screen: state => state.screen,
=======

>>>>>>> Skychart syncs with selected site at current time.
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
            commit('setTimestamp', '')
        }
        // Otherwise, refresh the state for the selected site.
        else {
            let apiName = 'ptr-api';
            // 'site' is referencing the item in the observatory_configuration vuex module
            let path = `/${site}/status/`;
            API.get(apiName, path).then(response => {
                commit('setMount', response.content.mount)
                commit('setTelescope', response.content.telescope)
                commit('setCamera', response.content.camera)
                commit('setFilterWheel', response.content.filter_wheel)
                commit('setFocuser', response.content.focuser)
                commit('setFilterWheel', response.content.filter_wheel)
                commit('setRotator', response.content.rotator)
                commit('setScreen', response.content.screen)
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



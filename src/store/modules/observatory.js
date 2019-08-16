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
        timestamp: '',

        focus: {
            timestamp: "",
            foc1_connected: "",
            alias: "",
            focus: "",
        },
        rotator1: {
            pa: "",
            timestamp: "",
            alias: "",
            rot1_connected: "",
        },
        weather: {
            "illum lux": "",
            "amb_temp C": "",
            "timestamp": "",
            "solar w/m^2": "",
            "bright hz": "",
            "light": "",
            "pressure mbar": "",
            "time to close": "",
            "humidity %": "",
            "sky C": "",
            "dewpoint C": "",
            "time to open": "",
            "wind k/h": "",
            "open_possible": "",
        },
        test: {
            type: "",
            parked: "",
            "timestamp": ""
        },
        foo: "bar",
    }
}

// initial state
const state = emptyState();

// getters
const getters = {
    mount: state => state.mount || [],
    telescope: state => state.telescope,
    camera: state => state.camera,
    filter_wheel: state => state.filter_wheel,
    focuser: state => state.focuser,
    rotator: state => state.rotator,
    timestamp: state => state.timestamp,

    foo: state => state.foo,

    // Old getters below this comment.
    RightAscension: state => parseFloat(state.mount.RightAscension).toFixed(2),
    Declination: state => parseFloat(state.mount.Declination).toFixed(2),
    Altitude: state => parseFloat(state.mount.Altitude).toFixed(3),
    Azimuth: state => parseFloat(state.mount.Azimuth).toFixed(3),
    roof: state => state.mount.roof,
    sidereal: state => parseFloat(state.mount.tel_sid_time).toFixed(3),

    wx: state => state.weather,
    wx_time: state => state.weather.timestamp,
    amb_temp_C: state => state.weather["amb_temp C"],
    wind: state => state.weather["wind k/h"],

    focus: state => {
        if (Date.now()/1000 - parseFloat(state.focus.timestamp) > 60){
            let diff = (Date.now()/1000 - parseFloat(state.focus.timestamp)).toFixed(2)
            return (state.focus.focus+" warn: "+diff+" sec old")
        } else {
        return (state.focus.focus)
        }
    },
    positionAngle: state => {
        if (Date.now()/1000 - parseFloat(state.rotator.timestamp) > 60){
            let diff = (Date.now()/1000 - parseFloat(state.rotator.timestamp)).toFixed(2)
            return (state.rotator.pa+" warn: "+diff+" sec old")
        } else {
        return (state.rotator.pa)
        }
    },

    timestamp: state => parseFloat(state.test.timestamp).toFixed(2),
    testRootState: (state, getters, rootState) => {
        return rootState.device_selection.foo
    },
}

// actions
const actions = {
    updateStatus({ commit, rootState}) {

        // Get the active site from the device_selection module
        let site = rootState.device_selection.selected_site;

        // Set empty values if a specific site has not been selected.
        if (site == '') {
            commit('setMount', [])
            commit('setTelescope', [])
            commit('setCamera', [])
            commit('setFilterWheel', [])
            commit('setFocuser', [])
            commit('setFilterWheel', [])
            commit('setRotator', [])
            commit('setTimestamp', '')
        }
        // Otherwise, refresh the state for the selected site.
        else {
            let apiName = 'ptr-api';
            // 'site' is referencing the item in the device_selection vuex module
            let path = `/${site}/status/`;
            API.get(apiName, path).then(response => {
                //console.log("retrieved status from observatory store")
                //console.log(response)
                commit('setMount', response.content.mount)
                commit('setTelescope', response.content.telescope)
                commit('setCamera', response.content.camera)
                commit('setFilterWheel', response.content.filter_wheel)
                commit('setFocuser', response.content.focuser)
                commit('setFilterWheel', response.content.filter_wheel)
                commit('setRotator', response.content.rotator)
                commit('setTimestamp', response.content.timestamp)
                commit('setTestState', response.content)
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
    setWeather(state, wx ) { state.weather = wx  },
    setObservatoryState(state, incoming) {
        state.mount = incoming['mnt-1']
        state.focus = incoming['foc1']
        state.rotator = incoming['rot1']
        state.weather = incoming['wx-1']
    },
    setEmptyState(state) {
        let empty = emptyState()
        state.mount = empty.mount
        state.focus = empty.focus
        state.rotator = empty.rotator
        state.weather = empty.weather
        state.test = empty.test
    },
    setTestState(state, incoming) {
        state.test = incoming
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}



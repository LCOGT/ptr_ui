
// Used to initialize state, and to replace stale state anytime the server can't be reached.
var emptyState = function() {
    return {
        mount: {
            quide_status: "",
            focus: "",
            parked: "",
            ra_rate: "",
            alias: "",
            alt: "",
            ra: "",
            tracking: "",
            timestamp: "",
            az: "",
            dec: "",
            enclosure_status: "",
            tel_sid_time: "",
            slewing: "",
            "mnt-1_connected": "",
            pos_angle: "",
            dec_rate: "",
        },
        focus: {
            timestamp: "",
            foc1_connected: "",
            alias: "",
            focus: "",
        },
        rotator: {
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
        }
    }
}

// initial state
const state = emptyState();

// getters
const getters = {
    mount: state => state.mount,
    ra: state => parseFloat(state.mount.ra).toFixed(2),
    dec: state => parseFloat(state.mount.dec).toFixed(2),
    alt: state => parseFloat(state.mount.alt).toFixed(3),
    az: state => parseFloat(state.mount.az).toFixed(3),
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
}

// actions
const actions = {
    streamSSE({ commit }) {
        const es = new EventSource('http://localhost:5000/status/all');


        es.onmessage = function(e) {
            let obj = JSON.parse(e.data);
            commit('setObservatoryState', obj)
        }

        es.onerror = function(e) {
            commit('setEmptyState')
        }

    }
}

// mutations
const mutations = {
    setMount(state, mount) { state.mount = mount },
    setFocus(state, focus) { state.focus = focus },
    setRotator(state, rot) { state.rotator = rot },
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
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}



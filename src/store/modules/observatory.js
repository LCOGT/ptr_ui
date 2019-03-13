// initial state
const state = {
    mount: [],
    focus: [],
    rotator: [],
    weather: [],
}

// getters
const getters = {
    mount: state => state.mount,
    mountRa: state => state.mount.ra,
    mountDec: state => state.mount.dec,

    wx: state => state.weather,
    amb_temp_C: state => state.weather["amb_temp C"],
    wind: state => state.weather["wind k/h"],

    focus: state => {
        if (Date.now()/1000 - parseFloat(state.focus.timestamp) > 60){
            let diff = Date.now()/1000 - parseFloat(state.focus.timestamp).toFixed(2)
            return (state.focus.focus+" warn: "+diff+" sec old")
        } else {
        return (state.focus.focus)
        }
    },
    positionAngle: state => {
        if (Date.now()/1000 - parseFloat(state.rotator.timestamp) > 60){
            let diff = Date.now()/1000 - parseFloat(state.rotator.timestamp).toFixed(2)
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
            //commit('setMount', obj['mnt-1'])
            //commit('setFocus', obj['foc1'])
            //commit('setRotator', obj['rot1'])
            //commit('setWeather', obj['wx-1'])
            commit('setObservatoryState', obj)
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
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}



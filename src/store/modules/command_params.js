

import { API } from 'aws-amplify'

const state = {

    // Subframe parameters
    subframeIsActive: false,
    subframeDefinedWithFile: '',
    subframe_x0: -1,
    subframe_y0: -1,
    subframe_x1: -1,
    subframe_y1: -1,
}

const getters = {
    subframeIsActive: state => state.subframeIsActive,
    subframeDefinedWithFile: state => state.subframeIsActive,
    subframe_x0: state => state.subframe_x0,
    subframe_y0: state => state.subframe_y0,
    subframe_x1: state => state.subframe_x1,
    subframe_y1: state => state.subframe_y1,
}

const actions = {
    /**
     *  Define a subframe with the top left and bottom right corners, and set
     *  it to active (will apply to next image command).
     */
    defineSubframe({ commit }, {x0,y0,x1,y1}) {
        commit('subframeIsActive', true)
        commit('subframe_x0',x0)
        commit('subframe_y0',y0)
        commit('subframe_x1',x1)
        commit('subframe_y1',y1)
    },

}

const mutations = {
    subframeIsActive (state, val) { state.subframeIsActive = val },
    subframeDefinedWithFile (state, val) { state.subframeDefinedWithFile = val },
    subframe_x0 (state, val) { state.subframe_x0 = val; },
    subframe_y0 (state, val) { state.subframe_y0 = val; },
    subframe_x1 (state, val) { state.subframe_x1 = val; },
    subframe_y1 (state, val) { state.subframe_y1 = val; },
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
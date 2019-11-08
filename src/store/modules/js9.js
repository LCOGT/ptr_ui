
import { API } from 'aws-amplify'

// initial state
const state = {
    JS9_ID: 'myJS9',
    js9_current_image: '',
    js9Width: '',
    js9Height: '',
}

// getters
const getters = {
    JS9_ID: state => state.JS9_ID,
    js9_current_image: state => state.js9_current_image,
    js9Width: state => state.js9Width,
    js9Height: state => state.js9Height,
}

// actions
const actions = {

    loadImage({ rootState, state, commit }, { base_filename, site }) {

        // only load if it's not currently loaded.
        if (base_filename == state.js9_current_image) {
            return;
        } else {
            let apiName = rootState.dev.active_api;
            let path = `/fits13_url/${site}/${base_filename}/`;
            
            API.get(apiName, path).then(response => {
                JS9.Load(response, {scale: "histeq"}, {display: state.JS9_ID})
                commit('js9_current_image', base_filename)
            }).catch(error => {
                console.log(error)
            });
        }
    },

    resizeDisplay({ state, commit }, { id, width, height }) {
        // only resize if dimensions are different
        if (state.js9Width==width && state.js9Height==height) {
            return;
        } else {
            // we might later want to adjust the zoom level when the window size changes. 
            let zoom = JS9.GetZoom(id)
            JS9.ResizeDisplay(id, width, height)
            commit('js9Width', width)
            commit('js9Height', height)
        }
    },
}

// mutations
const mutations = {
    JS9_ID(state, id) { state.JS9_ID = id },
    js9_current_image(state, base_filename ) { state.js9_current_image = base_filename },
    js9Width(state,val) { state.js9Width = val },
    js9Height(state,val) { state.js9Height = val },
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
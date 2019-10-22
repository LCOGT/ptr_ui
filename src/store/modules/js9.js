
import { API } from 'aws-amplify'

// initial state
const state = {
    JS9_ID: 'myJS9',
    js9_current_image: '',
}

// getters
const getters = {
    JS9_ID: state => state.JS9_ID,
    js9_current_image: state => state.js9_current_image,
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
                JS9.Load(response, {scale: "log"}, {display: state.JS9_ID})
                commit('js9_current_image', base_filename)
            }).catch(error => {
                console.log(error)
            });
        }
    },

    resizeDisplay({ state }, { id, width, height }) {
        JS9.ResizeDisplay(id, width, height)
    },
}

// mutations
const mutations = {
    JS9_ID(state, id) { state.JS9_ID = id },
    js9_current_image(state, base_filename ) { state.js9_current_image = base_filename},
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
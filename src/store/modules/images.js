
/**
 * @fileoverview This is the vuex store that maintains the state of images.
 */

import { API } from 'aws-amplify'

const state = {
    recent_images: [],
}

const getters = {
    recent_images: state => state.recent_images,
    most_recent_image: state => state.recent_images[0],
}

const actions = {

    refresh_latest_images({ commit, rootState }) {
        let site = rootState.device_selection.selected_site
        let apiName = 'ptr-api';
        let path = `/${site}/latest_images/10/`;
        API.get(apiName, path).then(response => {
            // Save the config to this vuex module.
            console.log(response)
            commit('setRecentImages', response)
        }).catch(error => {
            console.log(error)
        });
    },


}

const mutations = {
    setRecentImages(state, recent_image_list) { 
        state.recent_images = recent_image_list;
    },

    setActiveSite(state, site) { state.selected_site = site; state.is_site_selected = true },
}

export default {
    namespaced: true,
    state, 
    getters,
    actions,
    mutations,
}
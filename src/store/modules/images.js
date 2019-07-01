
/**
 * @fileoverview This is the vuex store that maintains the state of images.
 */

import { API } from 'aws-amplify'

const state = {
    recent_images: [],
    displayed_image: '',
    current_image: {
        name: '',
        url: '',
    },
}

const getters = {
    recent_images: state => state.recent_images,
    displayed_image: state => state.displayed_image,
    most_recent_image: state => state.recent_images[0],
    current_image: state => state.current_image,
}

const actions = {

    refresh_latest_images({ commit, state, rootState }) {

        let site = rootState.device_selection.selected_site
        let apiName = 'ptr-api';
        let path = `/${site}/latest_images/10/`;

        API.get(apiName, path).then(response => {

            commit('setRecentImages', response)

            // Compare the the latest image retrieved with the vuex store. 
            // Only update if they are different to avoid excessive downloads.
            let latest_local = state.recent_images[0].filename
            let latest_response = response[0].filename
            if (latest_local != latest_response) {
                console.log('updating the latest images list')
                let the_current_image = {
                    name: response[0].filename,
                    url: response[0].url,
                }
                commit('setCurrentImage', the_current_image)
            }

            if (state.current_image.name == '' || state.current_image.url == '') {
               let the_current_image = {
                   name: state.recent_images[0].filename,
                   url: state.recent_images[0].url,
               } 
                commit('setCurrentImage', the_current_image)
            }

        }).catch(error => {
            console.log(error)
        });
    },

    set_current_image({ commit }, name, url) {
        let the_current_image = {
            name: name,
            url: url,
        }
        commit('setCurrentImage', the_current_image)
    },


}

const mutations = {
    setRecentImages(state, recent_image_list) { state.recent_images = recent_image_list; },
    setDisplayedImage(state, displayedImageName) { state.displayed_image = displayedImageName },
    setCurrentImage(state, the_current_image) { state.current_image = the_current_image },
}

export default {
    namespaced: true,
    state, 
    getters,
    actions,
    mutations,
}
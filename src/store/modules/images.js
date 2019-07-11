
/**
 * @fileoverview This is the vuex store that maintains the state of images.
 */

import { API } from 'aws-amplify'

const state = {

    // 'recent_images' is a list of elements with form {filename: "", url: ""}.
    // It is updated whenever the action 'refresh_latest_images' is called.
    recent_images: [],

    // 'current_image' defines what image is currently displayed.
    current_image: {
        filename: '',
        url: '',
        last_modified: '',
    },
}

const getters = {
    recent_images: state => state.recent_images,
    most_recent_image: state => state.recent_images[0],

    current_image: state => state.current_image,
}

const actions = {

    refresh_latest_images({ commit, state, rootState }) {

        let site = rootState.device_selection.selected_site;
        let apiName = 'ptr-api';
        let querySize = 10; // How many images to get
        let path = `/${site}/latest_images/${querySize}/`;

        /**
         * The response for this api call is a list of elements with the form:
         *  { 
         *      filename: "", 
         *      url: "",
         *      recency_order: int in [0,k],
         *      last_modified: "2019-07-10 04:51:21+00:00" //last modified time at s3
         *  }
         */
        API.get(apiName, path).then(response => {

            // Store the recent images if our vuex state is empty
            if (state.recent_images.length == 0) {
                commit('setRecentImages', response)
            }

            // If we already have items in the vuex recent_images list:
            else {

                // Compare the filenames of the most recent images.
                /**
                 * Note: each api call for recent images generates unique urls
                 * for each image returned, even if they point to the same files.
                 * To avoid redownloading everything every time we check for updates,
                 * only save the api return if the filenames are different.
                 */
                let latest_local = state.recent_images[0].filename
                let latest_response = response[0].filename
                if (latest_local != latest_response) {

                    commit('setRecentImages', response)
                    let the_current_image = {
                        filename: response[0].filename,
                        url: response[0].url,
                    }
                    commit('setCurrentImage', the_current_image)
                }
            }

            // If current_image is empty, set it to the first element from 'recent_images'. 
            if (state.current_image.name == '' || state.current_image.url == '') {
               let the_current_image = {
                   filename: state.recent_images[0].filename,
                   url: state.recent_images[0].url,
                   last_modified: state.recent_images[0].last_modified,
               } 
                commit('setCurrentImage', the_current_image)
            }

        }).catch(error => {
            console.log(error)
        });
    },

    set_current_image({ commit }, image_object) {
        let the_current_image = {
            filename: image_object.filename,
            url: image_object.url,
            last_modified: image_object.last_modified,
        }
        commit('setCurrentImage', the_current_image)
    },

    /**
     * Set the current image to the most recent one in recent_images.
     */
    set_latest_image({ commit, state }) {
        let the_current_image = {
            filename: state.recent_images[0].filename,
            url: state.recent_images[0].url,
            last_modified: state.recent_images[0].last_modified,
        } 
        commit('setCurrentImage', the_current_image)
    }


}

const mutations = {
    setRecentImages(state, recent_image_list) { state.recent_images = recent_image_list; },
    setCurrentImage(state, the_current_image) { state.current_image = the_current_image },
}

export default {
    namespaced: true,
    state, 
    getters,
    actions,
    mutations,
}
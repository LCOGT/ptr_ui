
/**
 * @fileoverview This is the vuex store that maintains the state of images.
 */

import { API } from 'aws-amplify'

const state = {

    // recent_images is updated whenever the action 'refresh_latest_images' is called.
    recent_images: [],

    // 'current_image' defines what image is currently displayed.
    current_image: {},
}

const getters = {
    recent_images: state => state.recent_images,
    current_image: state => state.current_image,
}

const actions = {

    /**
     *  This action will retrieve a list of the latest images (from the api).
     */
    refresh_latest_images({ commit, state, rootState }) {

        let site = rootState.observatory_configuration.selected_site;
        let apiName = 'ptr-api';
        let querySize = 10; // How many images to get
        let path = `/${site}/latest_images/${querySize}/`;

        /**
         * The response for this api call is a list of elements with the form:
         *  image = {
         *      "recency_order": int,
         *      "site": str,
         *      "base_filename": str,
         *      "capture_date": int (js timestamp, in milis),
         *      "observer": str,
         *      "right_ascension": str,
         *      "declination": str,
         *      "filter_used": str,
         *      "exposure_time": str,
         *      "airmass": str,
         *      "jpg13_url": str,
         *      "fits13_url": str,
         *  }
         */
        API.get(apiName, path).then(response => {

            commit('setRecentImages', response)

            // If current_image is empty, or if we've switched sites:
            // set current_image to the first element from 'recent_images'. 
            if (!Object.keys(state.current_image).length 
                || state.current_image.site != response[0].site) {
                commit('setCurrentImage', state.recent_images[0])
            }

        }).catch(error => {
            console.log(error)
        });
    },

    /**
     * Set the current image, usually to be displayed.
     */
    set_current_image({ commit }, image_object) {
        commit('setCurrentImage',image_object)
    },

    /**
     * Set the current image to the most recent one in recent_images.
     */
    set_latest_image({ commit, state }) {
        let the_current_image = state.recent_images[0]
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
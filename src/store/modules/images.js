
/**
 * @fileoverview This is the vuex store that maintains the state of images.
 */

import { API } from 'aws-amplify'

const state = {

    // recent_images is updated whenever the action 'refresh_latest_images' is called.
    recent_images: [],

    // 'current_image' defines what image is currently displayed.
    current_image: {},

    // user_images a list of all a user's images associated with their account
    // TODO: Write an action that will update a user's image list when images are added to their account
    user_images: [],
}

const getters = {
    recent_images: state => state.recent_images,
    current_image: state => state.current_image,

    user_images: state => state.user_images,
}

const actions = {
<<<<<<< Updated upstream

    /**
     *  This action will retrieve a complete list of an account's images (from the api).
     */
    get_user_images({ commit, state, rootState }) {
=======
    get_user_images({ commit }) {
>>>>>>> Stashed changes

        // TODO: Remove hard coded values and make sure that username in UI is linked to image records in database
        // let username = rootState.auth.user.username
        let username = "WER"
        let apiName = 'ptr-api';
        let path = `/image_by_observer/${username}/`;

        API.get(apiName, path).then(response => {
            commit('setUserImages', response)
        }).catch(error => {
            console.log(error)
        });
    },

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
    setUserImages(state, user_images_list) { state.user_images = user_images_list },
}

export default {
    namespaced: true,
    state, 
    getters,
    actions,
    mutations,
}
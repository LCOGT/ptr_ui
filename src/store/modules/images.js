
/**
 * @fileoverview This is the vuex store that maintains the state of images.
 */

//import { API } from 'aws-amplify'
import axios from 'axios'

const state = {

    // 'current_image' defines what image is currently displayed.
    current_image: {},

    // recent_images is updated whenever the action 'refresh_latest_images' is called.
    recent_images: [],
    // user_images a list of all a user's images associated with their account
    // TODO: Write an action that will update a user's image list when images are added to their account
    user_images: [],
}

const getters = {
    current_image: state => state.current_image,
    recent_images: state => state.recent_images,
    user_images: state => state.user_images,
}

const actions = {
    /**
     *  This action will retrieve a complete list of an account's images (from the api).
     */
    async get_user_images({ commit, state, rootState }) {

        // TODO: Remove hard coded values and make sure that username in UI is linked to image records in database
        // let username = rootState.auth.user.username
        let username = "wmd_admin" // TODO: Grab username from state 
        let apiName = rootState.dev.active_api;
        let path = `/image_by_user/${username}/`;

        axios.get(apiName+path).then(response => {
            response = JSON.parse(response.data)
            commit('setUserImages', response)
        }).catch(error => {
            console.log(error)
        });
    },

    /**
     *  This action will retrieve a list of images filtered by the parameters in filter_params
     */
    get_filtered_images({ commit, state, rootState }, filter_params) {
        console.log(filter_params)
        let apiName = rootState.dev.active_api;
        let path = `/filtered_images`;
        let body = { params: filter_params}
        axios.get(apiName+path, body).then(response => {
            response = response.data
            commit('setUserImages', response)
            let recent_image_list = response.slice(0, 40)
            commit('setRecentImages', recent_image_list)
        }).catch(error => {
            console.log(error)
        });
    },

    /**
     *  This action will retrieve a list of the latest images (from the api).
     */
    async refresh_latest_images({ commit, state, rootState }) {

        let site = rootState.observatory_configuration.selected_site;
        let apiName = rootState.dev.active_api;
        let querySize = 40; // How many images to get
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
        axios.get(apiName+path).then(async response => {
            response = JSON.parse(response.data)

            // Empty response:
            if (response.length == 0) { return; }

            // If current_image is empty, or if we've switched sites:
            // set current_image to the first element from 'recent_images'. 
            if (!Object.keys(state.current_image).length
                || state.current_image.site != response[0].site) {
                commit('setCurrentImage', response[0])
            }

            await commit('setRecentImages', response)

        }).catch(error => {
            //console.log(error)
        });
    },

    /**
     * Set the current image (usually for display).
     */
    set_current_image({ commit }, image_object) {
        commit('setCurrentImage', image_object)

    },

    /**
     * Set the current image to the most recent one in recent_images.
     */
    set_latest_image({ commit, state }) {
        let the_current_image = state.recent_images[0]
        commit('setCurrentImage', the_current_image)
    },

    set_next_image({ commit, state }) {
        let i = state.current_image.recency_order
        let lastImageIndex = state.recent_images.length - 1

        if (i == lastImageIndex) {
            let the_next_image = state.recent_images[0]
            commit('setCurrentImage', the_next_image)
        } else {
            let the_next_image = state.recent_images[i + 1]
            commit('setCurrentImage', the_next_image)
        }
    },

    set_previous_image({ commit, state }) {
        let i = state.current_image.recency_order
        let lastImageIndex = state.recent_images.length - 1

        if (i == 0) {
            let the_previous_image = state.recent_images[lastImageIndex]
            commit('setCurrentImage', the_previous_image)
        } else {
            let the_previous_image = state.recent_images[i - 1]
            commit('setCurrentImage', the_previous_image)
        }
    }

}

const mutations = {
    setCurrentImage(state, the_current_image) { state.current_image = the_current_image },
    setRecentImages(state, recent_image_list) { state.recent_images = recent_image_list; },
    setUserImages(state, user_images_list) { state.user_images = user_images_list },
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
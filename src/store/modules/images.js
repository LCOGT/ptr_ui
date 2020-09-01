
/**
 * @fileoverview This is the vuex store that maintains the state of images.
 */

//import { API } from 'aws-amplify'
import axios from 'axios'
import { getInstance } from '../../auth/index' // get user object: getInstance().user


function user_id() {
    if (getInstance().user) {
        return getInstance().user.sub
    }
    else {
        return false
    }
}

const state = {

    // 'current_image' defines what image is currently displayed.
    current_image: {},

    // recent_images is updated whenever the action 'refresh_latest_images' is called.
    recent_images: [],
    // user_images a list of all a user's images associated with their account
    // TODO: Write an action that will update a user's image list when images are added to their account
    user_images: [],

    show_user_data_only: false,
}

const getters = {
    current_image: state => state.current_image,
    recent_images: state => state.recent_images,
    user_images: state => state.user_images,
    show_user_data_only: state => state.show_user_data_only,
}

const mutations = {
    setCurrentImage(state, the_current_image) { state.current_image = the_current_image; },
    setRecentImages(state, recent_image_list) { state.recent_images = recent_image_list; },
    setUserImages(state, user_images_list) { state.user_images = user_images_list },
    show_user_data_only(state, val) { state.show_user_data_only = val},
}

const actions = {

    /**
     *  This action will retrieve a list of images filtered by the parameters in filter_params
     */
    get_filtered_images({ commit, state, rootState }, filter_params) {
        console.log(filter_params)
        let apiName = rootState.dev.active_api;
        let path = `/filtered_images`;
        //let url = apiName+path;
        let body = { 
            method: "GET",
            params: filter_params,
            baseURL: apiName,
            url: path,
        }
        axios(body).then(response => {
            response = response.data
            commit('setUserImages', response)
            let recent_image_list = response.slice(0, 40)
            commit('setRecentImages', recent_image_list)
        }).catch(error => {
            console.warn(error)
        });
    },

    /**
     *  This action will retrieve a list of the latest images (from the api).
     */
    async refresh_latest_images({ dispatch, commit, state, rootState }) {

        let site = rootState.site_config.selected_site;
        let apiName = rootState.dev.active_api;
        let querySize = 40; // How many images to get
        let path = `/${site}/latest_images/${querySize}`;

        // Get the current user's id
        let userid = user_id()
        
        // If a user is logged in and they want to see only their data, 
        // add their id as a query string param for the api call. 
        if (state.show_user_data_only && userid) {
            const query_data = { userid: userid, };
            const query_params = new URLSearchParams(query_data);
            path += '?' + query_params
        }

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
         *      "jpg_url": str,
         *  }
         */
        axios.get(apiName+path).then(async response => {
            response = response.data

            // Empty response:
            if (response.length == 0) { 
                dispatch('display_placeholder_image') 
                return; 
            }

            // Only change the current image to the newest if there is none 
            // selected.
            // We don't want to yank the view away from the user. 
            if (!state.current_image.site) {
                commit('setCurrentImage', response[0])
            }
            commit('setRecentImages', response)

        }).catch(error => {
            //console.log(error)
        });
    },

    // Use a placeholder image (when there are none to display)
    display_placeholder_image({ commit }) {
        let placeholder_url = "https://via.placeholder.com/768x768?text=nothing here yet"
        let placeholder_image = {
            jpg_url: placeholder_url,
            base_filename: "placeholder image",
            recency_order: 0,  // need this so prev/next buttons don't break
        }
        commit('setRecentImages', [placeholder_image])
        commit('setCurrentImage', placeholder_image)
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
    set_latest_image({ commit, dispatch, state }) {
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


export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
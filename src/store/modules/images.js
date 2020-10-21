
/**
 * @fileoverview This is the vuex store that maintains the state of images.
 */

//import { API } from 'aws-amplify'
import axios from 'axios'
import { getInstance } from '../../auth/index' // get user object: getInstance().user
import { data } from 'jquery'

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
    current_image: {
        pg_url: "https://via.placeholder.com/768x768.jpg/151718?text=...",
        jpg_url: "../assets/1px.gif"
    },

    // recent_images is updated whenever the action 'load_latest_images' is called.
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

    large_fits_exists: state => !state.current_image.ex01_fits_exists,
    small_fits_exists: state => !state.current_image.ex10_fits_exists,
}

const mutations = {
    setCurrentImage(state, the_current_image) { state.current_image = the_current_image; },
    setRecentImages(state, recent_image_list) { state.recent_images = recent_image_list; },
    setUserImages(state, user_images_list) { state.user_images = user_images_list },
    show_user_data_only(state, val) { state.show_user_data_only = val},
}

const actions = {

    /**
     * NOTES:
     * 
     * We should distinguish the similar events of UPDATING the view with
     * new incoming data, and LOADING a completely new set of images.
     * 
     * UPDATING new data is something that happens during an imaging session. In
     * this case, we want to add the new image thumbnail to the view, but we 
     * may not want to bring it into focus (the user may be busy with the 
     * current image, for example). On the other hand, it should be possible 
     * to have the latest images always coming into focus, which might be useful
     * for a user who wants to see their work progress in real time. 
     * 
     * LOADING the data view is the process of replacing the current batch of 
     * images by refetching the whole list. An example would be switching  
     * between different sites, or choosing to display only data taken by the
     * active users's images. These are actions that the user initiates with a
     * button or something similar, and we will assume they are ok changing the
     * active view. We will always want to bring the new "first" image into 
     * focus as the active image. Not doing this has effects like keeping an 
     * image from SAF as the active image even after the user has navigated to 
     * the WMD images page (where all the thumbnails are WMD images). 
     * 
     */


    /**
     * UPDATE the view with new incoming data.
     * This action is dispatched whenever a new-image-notification arrives. 
     * It will get the latest image and add it to the stack of recent images,
     * without necessarily changing the current image displayed. 
     * 
     * @param {string} new_base_filename: query the API for details on this 
     * image, and add it into the 'latest_images' list. 
     * 
     */
    update_new_image({ commit, state, rootState, dispatch }, new_base_filename) {

        // No need to get the latest if the new image is from a different site.
        let site = rootState.site_config.selected_site;
        // Get the image's site of origin from the beginning of the filename.
        let image_site_origin = new_base_filename.substr(0,3) 
        if (site != image_site_origin) {
            return;
        }

        // Fetch the incoming image
        let apiName = rootState.dev.active_api;  // Get the base api url
        let path = `/image/${new_base_filename}`;  

        // Make the api call.
        // If an older version in recent_images already exists, replace it; 
        // otherwise add it to the stack. 
        axios.get(apiName+path).then(async response => {

            console.log('update_new_image response: ', response.data)

            // Empty response. If this runs, something is wrong. 
            if (response.data.length == 0) { 
                console.warn('add_latest_image query returned 0 images.')
                //dispatch('display_placeholder_image') 
                return; 
            }

            let new_image = response.data
            let recent_images= state.recent_images

            // Don't show add the image if the user is requesting their data
            // only, and the new image is not theirs. 
            if (state.show_user_data_only) {
                if (new_image.user_id != user_id()) {
                    return;
                }
            }


            let new_image_filename = new_image.base_filename

            // Find the index of the image we want to update.
            // value will be -1 if it doesn't exist. 
            let old_image_index = recent_images.findIndex(image => 
                image.base_filename == new_image_filename)

            // If it doesn't already exist, just add it to the array (front). 
            if (old_image_index == -1) {
                let updated_recent_images = [new_image, ...recent_images]
                commit('setRecentImages', updated_recent_images)
            }
            // Otherwise, replace the old version with the new one we fetched.
            else {
                recent_images[old_image_index] = new_image
                commit('setRecentImages', recent_images)
            }

            // We don't have a toggle implemented yet. 
            // But eventually we want one to focus on the new image immediately.
            let incoming_image_takes_focus = false
            if (incoming_image_takes_focus) {
                commit('setCurrentImage', new_image)
            }
        }).catch(error => {
            // Most likely: no jpg availaable
            if (error.status == 404) {
                console.log('update_new_image: not found, probably because\
                there was no jpg included in the db')
            }
            else {
                console.warn("Error in vuex 'images/update_new_image': ", error)
            }

        });
    },

    /**
     *  This action will retrieve a list of images filtered by the parameters in filter_params
     */
    get_filtered_images({ commit, dispatch, rootState }, filter_params) {
        console.log(filter_params)
        let apiName = rootState.dev.active_api;
        let url = apiName + '/filtered_images';
        let body = { 
            method: "GET",
            params: filter_params,
            baseURL: apiName,
            url: url,
        }
        axios(body).then(response => {
            response = response.data

            // Empty response:
            if (response.length == 0) { 
                dispatch('display_placeholder_image') 
                return; 
            }

            commit('setRecentImages',response)
        }).catch(error => {
            console.warn(error)
        });
    },

    /**
     *  LOAD the latest images, replacing the current list of latest_images.
     *  @param {boolean} user_data_only: whether or not to filter by images 
     *     taken the active user or not. 
     */
    async load_latest_images({ dispatch, commit, state, rootState }, num_images ) {

        let site = rootState.site_config.selected_site;
        let apiName = rootState.dev.active_api;
        let querySize = num_images || 50; // How many images to get
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
         *      "user_id": str,
         *      "username": str,
         *  }
         */
        axios.get(apiName+path).then(async response => {
            response = response.data

            // Empty response:
            if (response.length == 0) { 
                dispatch('display_placeholder_image') 
                return; 
            }

            commit('setCurrentImage', response[0])
            commit('setRecentImages', response)

        }).catch(error => {
            //console.log(error)
        });
    },

    // Load and display a single placeholder image for a site.
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
     * Set this_image as the current displayed image 
     */
    set_current_image({ commit }, this_image) {
        commit('setCurrentImage', this_image)

    },

    /**
     * Set the current image to the most recent one in recent_images.
     */
    set_latest_image({ commit, dispatch, state }) {
        let the_current_image = state.recent_images[0]
        commit('setCurrentImage', the_current_image)
    },


    set_next_image({ commit, state }) {
        let next_image
        let index = state.recent_images.indexOf(state.current_image);
        if (index >= 0 && index < state.recent_images.length - 1) {
            next_image = state.recent_images[index + 1]
            commit('setCurrentImage', next_image)
        }
    },
    set_previous_image({ commit, state }) {
        let prev_image
        let index = state.recent_images.indexOf(state.current_image);
        if (index >= 1) {
            prev_image = state.recent_images[index - 1]
            commit('setCurrentImage', prev_image)
        }
    },

    async get_fits_url({rootState}, {base_filename, ex_type}) {

        // Get the global configuration for all sites from an api call.
        const apiName = rootState.dev.active_api

        const path = '/download';
        let body = {
            object_name: `${base_filename}-${ex_type}.fits.bz2`
        }
        console.log(path, body)
        const fits_url = await axios.post(apiName+path, body);

        console.log(fits_url.data)
        return fits_url.data;
    },

}


export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
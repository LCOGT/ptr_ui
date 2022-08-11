
/**
 * @fileoverview This is the vuex store that maintains the state of images.
 * 
 * TODO: Make a class for images, gives more flexibility than a plain object
 * for computing various attributes, etc. 
 */

//import { API } from 'aws-amplify'
import Vue from 'vue'
import axios from 'axios'
import moment from 'moment'
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

    large_fits_reduction_level: '00',
    small_fits_reduction_level: '10',

    // 'current_image' defines what image is currently displayed.
    current_image: {
        jpg_url: "../assets/1px.gif"
    },

    // info images in three separate channels. 
    info_images: [
      { jpg_url: '', },
      { jpg_url: '', },
      { jpg_url: '', },
    ],

    // recent_images is updated whenever the action 'load_latest_images' is called.
    recent_images: [],
    // user_images a list of all a user's images associated with their account
    // TODO: Write an action that will update a user's image list when images are added to their account
    user_images: [],

    show_user_data_only: false,

    // determines whether 'current_images' is set to show the most recent images with live updates.
    live_data: true, 
}

const getters = {
    current_image: state => state.current_image,
    recent_images: state => state.recent_images,
    user_images: state => state.user_images,
    show_user_data_only: state => state.show_user_data_only,

    large_fits_exists: state => state.current_image.fits_01_exists,
    small_fits_exists: state => state.current_image.fits_10_exists,

    small_fits_filename: (state, getters) => {
        if (!getters.small_fits_exists) return ''
        const image = getters.current_image
        return `${image.base_filename}-${image.data_type}${state.small_fits_reduction_level}.fits.bz2`
    },
    large_fits_filename: (state, getters) => {
        if (!getters.large_fits_exists) return ''
        const image = getters.current_image
        return `${image.base_filename}-${image.data_type}${state.large_fits_reduction_level}.fits.bz2`
    },

    info_image_is_active: state => state.current_image.s3_direcotry == 'info-images',
    info_images_exist: state => state.info_images.some(i => 'channel' in i),
}

const mutations = {
    setCurrentImage(state, the_current_image) { state.current_image = the_current_image; },
    setRecentImages(state, recent_image_list) { state.recent_images = recent_image_list; },
    setUserImages(state, user_images_list) { state.user_images = user_images_list },
    show_user_data_only(state, val) { state.show_user_data_only = val},
    live_data(state, val) { state.live_data = val},
    setInfoImage(state, val) { Vue.set(state.info_images, val.channel, val.info_image) },
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
        let image_site_origin = new_base_filename.split('-')[0]
        if (site != image_site_origin) {
            return;
        }

        // Fetch the incoming image
        let apiName = rootState.api_endpoints.active_api;  // Get the base api url
        let path = `/image/${new_base_filename}`;  

        // Make the api call.
        // If an older version in recent_images already exists, replace it; 
        // otherwise add it to the stack. 
        axios.get(apiName+path).then(async response => {

            // Empty response. If this runs, something is wrong. 
            if (response.data.length == 0) { 
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
        dispatch('toggle_live_data', false)
        let apiName = rootState.api_endpoints.active_api;
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

    get_last_24hrs({ commit, dispatch, rootState}) {
      dispatch('toggle_live_data', false)
      let apiName = rootState.api_endpoints.active_api;
      let url = apiName + '/filtered_images';
      let body = { 
          method: "GET",
          params: {
            start_date: moment().add(-1, 'days').format("YYYY-MM-DD hh:mm:ss"),
            end_date: moment().format("YYYY-MM-DD hh:mm:ss"),
          },
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
        
        // Get site and user_id
        let url = null
        let site = rootState.site_config.selected_site;
        
        let userid = user_id()
        let filterparams = {}


        if (!num_images) {
            //If no number of images is specified, query for site's local noon to noon
            url =rootState.api_endpoints.active_api + '/filtered_images'

            let queryStart = null
            let queryEnd = null

            let noonDate = new Date

            // Timezone and Offset for site and user to convert to site local time
            let siteTimezone = rootState.site_config.global_config[site].TZ_database_name
            let siteOffset = moment.utc(new Date()).tz(siteTimezone).utcOffset()/60
            let userOffset = - noonDate.getTimezoneOffset()/60
            
            // How many hours difference is between the site and user timezones
            let siteUserDifference = siteOffset-userOffset

            // Noon local site time in user's timezone
            noonDate.setHours (12-siteUserDifference, 0, 0, 0)

            // Current time in user's timezone
            let siteDate = new Date
            siteDate.setHours (10, 0,0,0)


            if (siteDate>noonDate) {
                // If it's later than noon, set the start to noon today
                queryStart = noonDate

                // and the end to noon tomorrow
                queryEnd = new Date
                queryEnd.setHours (12, 0, 0, 0)
                queryEnd.setDate(noonDate.getDate() + 1);

            } else { 
                // If it's earlier than noon, set the start to noon yesterday
                queryStart = new Date
                queryStart.setHours (12, 0, 0, 0)
                queryStart.setDate(noonDate.getDate() - 1);

                // and the end to noon today
                queryEnd = noonDate

            }
            

            // Set the parameters for this query
            filterparams.site = site;
            filterparams.start_date = moment(queryStart).format("YYYY-MM-DD hh:mm:ss");
            filterparams.end_date = moment(queryEnd).format("YYYY-MM-DD hh:mm:ss");

            // If a user is logged in and they want to see only their data,
            // add their id as a parameter for the api call

            if (state.show_user_data_only && userid) {
                filterparams.user_id = user_id
            }

        } else {
            // If a query size is specified, use the old method of retrieving X images
            let querySize = num_images // || 25 (original default);
            url = rootState.api_endpoints.active_api + `/${site}/latest_images/${querySize}`;

            
            // If a user is logged in and they want to see only their data, 
            // add their id as a query string param for the api call. 
            if (state.show_user_data_only && userid) {
                const query_data = { userid: userid, };
                const query_params = new URLSearchParams(query_data);
                url += '?' + query_params
            }
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

        let body = { 
            method: "GET",
            params: filterparams,
            url: url,
        }
    
        axios(body).then(async response => {
            response = response.data

            // Empty response:
            if (response.length == 0) { 
                dispatch('display_placeholder_image') 
                return; 
            }

            commit('setCurrentImage', response[0])
            commit('setRecentImages', response)

        }).catch(error => {
            console.error(error)
        });

        dispatch('load_latest_info_images')
    },

    load_latest_info_images({ state, commit, rootState}) {
      const site = rootState.site_config.selected_site;
      const base_url = rootState.api_endpoints.active_api

      // query each of the three channels
      for (let channel = 0; channel < 3; channel ++) {
        const url = base_url + `/infoimage/${site}/${channel + 1}`
        axios.get(url).then(response => {
          // Only update the current image if currently set to the old info image
          // Don't want to yank the focus from the user
          if (state.current_image.s3_directory == 'info-images') {
            commit('setCurrentImage', response.data)
          }
          commit('setInfoImage', {info_image: response.data, channel: channel})
        }).catch(error => {
          commit('setInfoImage', {info_image: {jpg_url: ""}, channel: channel})  // reset to default empty value
        })
      }
    },

    toggle_live_data({ commit, dispatch }, val) {
      commit('live_data', val)
      if (val) {
        dispatch('load_latest_images')
      }
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
        console.log('in set current image', this_image)
        commit('setCurrentImage', this_image)

    },

    /**
     * Set the current image to the most recent one in recent_images.
     */
    set_latest_image({ commit, dispatch, state }) {
        let the_current_image = state.recent_images[0]
        commit('setCurrentImage', the_current_image)
    },

    set_info_image_as_current_image({commit, state}, channel) {
      commit('setCurrentImage', state.info_images[channel])
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
    set_first_image({ commit, state }) {
        let first_image = state.recent_images[state.recent_images.length - 1]
        commit('setCurrentImage', first_image)
    },

    async get_fits_url({rootState}, {base_filename, data_type, reduction_level}) {

        // Get the global configuration for all sites from an api call.
        const apiName = rootState.api_endpoints.active_api

        const path = '/download';
        let body = {
            object_name: `${base_filename}-${data_type}${reduction_level}.fits.bz2`
        }
        const fits_url = await axios.post(apiName+path, body);

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

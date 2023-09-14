
/**
 * @fileoverview This is the vuex store that maintains the state of images.
 *
 * TODO: Make a class for images, gives more flexibility than a plain object
 * for computing various attributes, etc.
 */

import Vue from 'vue'
import axios from 'axios'
import moment from 'moment'
import { getInstance } from '../../auth/index' // get user object: getInstance().user

function user_id () {
  if (getInstance().user) {
    return getInstance().user.sub
  }
  else {
    return false
  }
}

const state = {

  cached_headers: {}, // save retrieved headers so we don't have to make duplicate api calls

  large_fits_reduction_level: '00',
  small_fits_reduction_level: '10',

  // 'current_image' defines what image is currently displayed.
  current_image: {
    jpg_url: '../assets/1px.gif'
  },

  // info images in three separate channels.
  info_images: [
    { jpg_url: '' },
    { jpg_url: '' },
    { jpg_url: '' }
  ],

  // recent_images is updated whenever the action 'load_latest_images' is called.
  recent_images: [],
  // user_images a list of all a user's images associated with their account
  // TODO: Write an action that will update a user's image list when images are added to their account
  user_images: [],

  // grouped_images: object where key is SMARTSTK and value is an array of all the baseFilenames associated with it
  grouped_images: {},

  show_user_data_only: false,

  // determines whether 'current_images' is set to show the most recent images with live updates.
  live_data: true
}

const getters = {
  current_image: state => state.current_image,
  recent_images: state => state.recent_images,
  user_images: state => state.user_images,
  grouped_images: state => state.grouped_images,
  show_user_data_only: state => state.show_user_data_only,

  current_image_fits_header: state => state.current_image.fits_header,

  large_fits_exists: state => state.current_image.fits_01_exists,
  small_fits_exists: state => state.current_image.fits_10_exists,

  small_fits_filename: (state, getters) => {
    if (!getters.small_fits_exists) return ''
    const image = getters.current_image
    return `${image.base_filename}-${image.data_type}${state.small_fits_reduction_level}.fits.fz`
  },
  large_fits_filename: (state, getters) => {
    if (!getters.large_fits_exists) return ''
    const image = getters.current_image
    return `${image.base_filename}-${image.data_type}${state.large_fits_reduction_level}.fits.fz`
  },

  info_image_is_active: state => state.current_image.s3_direcotry == 'info-images',
  info_images_exist: state => state.info_images.some(i => 'channel' in i)
}

const mutations = {
  setCurrentImage (state, the_current_image) { state.current_image = the_current_image },
  setRecentImages (state, recent_image_list) { state.recent_images = recent_image_list },
  setGroupedImages (state, grouped_images) { state.grouped_images = grouped_images },
  setUserImages (state, user_images_list) { state.user_images = user_images_list },
  show_user_data_only (state, val) { state.show_user_data_only = val },
  live_data (state, val) { state.live_data = val },
  setInfoImage (state, val) { Vue.set(state.info_images, val.channel, val.info_image) },
  cacheHeader (state, { baseFilename, header }) {
    // Cache the header in the state
    state.cached_headers = { ...state.cached_headers, [baseFilename]: header }
  }
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

  update_new_image ({ commit, state, rootState }, new_base_filename) {
    // No need to get the latest if the new image is from a different site.
    const site = rootState.site_config.selected_site
    // Get the image's site of origin from the beginning of the filename.
    const image_site_origin = new_base_filename.split('-')[0]
    if (site != image_site_origin) {
      return
    }

    // Fetch the incoming image
    const apiName = rootState.api_endpoints.active_api // Get the base api url
    const path = `/image/${new_base_filename}`

    // Make the api call.
    // If an older version in recent_images already exists, replace it;
    // otherwise add it to the stack.
    axios.get(apiName + path).then(async response => {
      // Empty response. If this runs, something is wrong.
      if (response.data.length == 0) {
        // dispatch('display_placeholder_image')
        return
      }

      const new_image = response.data
      const recent_images = state.recent_images

      // Don't show add the image if the user is requesting their data
      // only, and the new image is not theirs.
      if (state.show_user_data_only) {
        if (new_image.user_id != user_id()) {
          return
        }
      }

      const new_image_filename = new_image.base_filename

      // Find the index of the image we want to update.
      // value will be -1 if it doesn't exist.
      const old_image_index = recent_images.findIndex(image =>
        image.base_filename == new_image_filename)

      // If it doesn't already exist, just add it to the array (front).
      if (old_image_index == -1) {
        const updated_recent_images = [new_image, ...recent_images]
        commit('setRecentImages', updated_recent_images)
      }
      // Otherwise, replace the old version with the new one we fetched.
      else {
        recent_images[old_image_index] = new_image
        commit('setRecentImages', recent_images)
      }

      // We don't have a toggle implemented yet.
      // But eventually we want one to focus on the new image immediately.
      const incoming_image_takes_focus = false
      if (incoming_image_takes_focus) {
        commit('setCurrentImage', new_image)
      }
    }).catch(error => {
      // Most likely: no jpg availaable
      if (error.status == 404) {
        console.log('update_new_image: not found, probably because there was no jpg included in the db')
      }
      else {
        console.warn("Error in vuex 'images/update_new_image': ", error)
      }
    })
  },

  /**
     *  This action will retrieve a list of images filtered by the parameters in filter_params
     */
  get_filtered_images ({ commit, dispatch, rootState }, filter_params) {
    dispatch('toggle_live_data', false)
    const apiName = rootState.api_endpoints.active_api
    const url = apiName + '/filtered_images'
    const body = {
      method: 'GET',
      params: filter_params,
      baseURL: apiName,
      url
    }
    axios(body).then(response => {
      response = response.data

      // Empty response:
      if (response.length == 0) {
        dispatch('display_placeholder_image')
        return
      }

      commit('setRecentImages', response)
    }).catch(error => {
      console.warn(error)
    })
  },

  // not sure what this does
  get_last_24hrs ({ commit, dispatch, rootState }) {
    dispatch('toggle_live_data', false)
    const apiName = rootState.api_endpoints.active_api
    const url = apiName + '/filtered_images'
    const body = {
      method: 'GET',
      params: {
        start_date: moment().add(-1, 'days').format('YYYY-MM-DD hh:mm:ss'),
        end_date: moment().format('YYYY-MM-DD hh:mm:ss')
      },
      baseURL: apiName,
      url
    }
    axios(body).then(response => {
      response = response.data

      // Empty response:
      if (response.length == 0) {
        dispatch('display_placeholder_image')
        return
      }

      commit('setRecentImages', response)
      dispatch('group_images')
    }).catch(error => {
      console.warn(error)
    })
  },

  /**
     *  LOAD the latest images, replacing the current list of latest_images.
     *  @param {boolean} user_data_only: whether or not to filter by images
     *     taken the active user or not.
     */

  // we want to group images as they load and we group them based on their SMARTSTK value
  // we dispatch this action in multiple places
  group_images ({ commit, state, rootState, dispatch }) {
    const currentSite = rootState.site_config.selected_site
    let grouping_images = JSON.parse(JSON.stringify(state.grouped_images))
    const recent_images = state.recent_images
    if (grouping_images.site && grouping_images.site !== currentSite) {
      dispatch('reset_grouped_images')
      grouping_images = { site: currentSite }
    } else if (!grouping_images.site) {
      grouping_images.site = currentSite
    } else if (grouping_images.site && grouping_images.site == currentSite) {
      console.log('nothing to see here')
    }
    for (let i = 0; i < recent_images.length; i++) {
      const img = recent_images[i]
      const header = img && img.header
      const SMARTSTK = header && header.SMARTSTK
      if (SMARTSTK === 'no' || SMARTSTK === undefined) continue
      if (!grouping_images[SMARTSTK]) {
        grouping_images[SMARTSTK] = []
        grouping_images[SMARTSTK].push(img)
      } else {
        grouping_images[SMARTSTK].push(img)
      }
    }
    commit('setGroupedImages', { ...grouping_images })
  },
  reset_grouped_images ({ commit }) {
    commit('setGroupedImages', {})
  },

  async load_latest_x_images ({ dispatch, commit, state, rootState }, num_images) {
    // Old method of loading only a certain amount of images
    let url = null
    const site = rootState.site_config.selected_site

    const userid = user_id()

    // If a query size is specified, use the old method of retrieving X images
    const querySize = num_images // || 25 (original default);
    url = rootState.api_endpoints.active_api + `/${site}/latest_images/${querySize}`

    // If a user is logged in and they want to see only their data,
    // add their id as a query string param for the api call.
    if (state.show_user_data_only && userid) {
      const query_data = { userid }
      const query_params = new URLSearchParams(query_data)
      url += '?' + query_params
    }

    const body = {
      method: 'GET',
      url
    }

    axios(body).then(async response => {
      response = response.data

      // Empty response:
      if (response.length == 0) {
        dispatch('display_placeholder_image')
        return
      }

      commit('setCurrentImage', response[0])
      commit('setRecentImages', response)
      dispatch('group_images')
    }).catch(error => {
      console.error(error)
    })

    dispatch('load_latest_info_images')
  },

  async load_latest_images ({ dispatch, commit, state, rootState }) {
    /** This function is for the postage stamp images in the observe display.
     * It first queries S3 for the most recent image at a given site, then uses that
     * image's capture date to determine the most recent site local noon to noon "day"
     * of observing, then returns all images from that site during that noon-noon day.
     *
     * Datetime for this function is done in the local timezone of the observatory, then
     * converted to UTC for the API call to query S3 for all images.
     * **/

    // Get site and user_id
    let url = null
    const site = rootState.site_config.selected_site

    const filterparams = {}

    const userid = user_id()

    let siteDate = moment()
    let noonDate = moment()
    let endDate = moment()

    // Timezone and Offset for site
    const siteTimezone = rootState.site_config.global_config[site].TZ_database_name
    const siteOffset = -moment.utc(new Date()).tz(siteTimezone).utcOffset() / 60

    // Query for site's local noon to noon
    url = rootState.api_endpoints.active_api + '/filtered_images'

    let queryStart = null
    let queryEnd = null

    // Check for the most recent image and use that as the "current time".
    const firstbody = {
      method: 'GET',
      url: rootState.api_endpoints.active_api + '/' + site + '/latest_images/1'
    }

    await axios(firstbody).then(async response => {
      response = response.data

      // Empty response:
      if (response.length == 0) {
        dispatch('display_placeholder_image')
        return
      }

      // Datetime (in site timezone) of most recent image
      siteDate = moment(response[0].capture_date).tz(siteTimezone)

      // Site noon (in site timezone) on the day the most recent image was taken
      noonDate = moment(response[0].capture_date).tz(siteTimezone).hours(12).minutes(0).seconds(0).milliseconds(0)

      // Extra variable (in site timezone) for the end date noon, initialized same as noonDate
      endDate = moment(response[0].capture_date).tz(siteTimezone).hours(12).minutes(0).seconds(0).milliseconds(0)
    }).catch(error => {
      console.error(error)
    })

    if (siteDate.format('HH') > 12) {
      // If the image was taken later than noon, set the start of query to noon today
      queryStart = noonDate

      // and the end to noon tomorrow
      queryEnd = endDate.add(1, 'days')
    } else {
      // If the image was taken earlier than noon, set the start of query to noon yesterday
      queryStart = noonDate.add(-1, 'days')

      // and the end to noon today
      queryEnd = endDate
    }

    // Set the parameters for this query
    filterparams.site = site

    // API endpoint expects the start/end dates in UTC, so convert using the site offset
    filterparams.start_date = queryStart.add(siteOffset, 'hours').format('YYYY-MM-DD HH:mm:ss')
    filterparams.end_date = queryEnd.add(siteOffset, 'hours').format('YYYY-MM-DD HH:mm:ss')

    // If a user is logged in and they want to see only their data,
    // add their id as a parameter for the api call

    if (state.show_user_data_only && userid) {
      filterparams.user_id = user_id
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

    const body = {
      method: 'GET',
      params: filterparams,
      url
    }

    await axios(body).then(async response => {
      response = response.data

      // Empty response:
      if (response.length == 0) {
        dispatch('display_placeholder_image')
        return
      }

      commit('setCurrentImage', response[0])
      commit('setRecentImages', response)
      dispatch('group_images')
      // commit('setGroupedImages', { grouped_images })
    }).catch(error => {
      console.error(error)
    })

    dispatch('load_latest_info_images')
  },

  load_latest_info_images ({ state, commit, rootState, dispatch }) {
    const site = rootState.site_config.selected_site
    const base_url = rootState.api_endpoints.active_api
    // query each of the three channels
    for (let channel = 0; channel < 3; channel++) {
      const url = base_url + `/infoimage/${site}/${channel + 1}`
      console.log('this is channel,', channel)
      axios.get(url).then(response => {
        // Handle case if no info image exists
        if (response.status == 204) {
          commit('setInfoImage', { info_image: { jpg_url: '' }, channel }) // reset to default empty value
          return
        }
        // Only update the current image if currently set to the old info image
        // Don't want to yank the focus from the user
        if (state.current_image.s3_directory == 'info-images') {
          commit('setCurrentImage', response.data)
          // dispatch('group_images')
        }
        commit('setInfoImage', { info_image: response.data, channel })
      }).catch(error => {
        console.error('Error fetching info images', error)
      })
    }
  },

  async loadCurrentImageFitsHeader ({ state, rootState, commit }) {
    if ('base_filename' in state.current_image) {
      const baseFilename = state.current_image.base_filename
      console.log('this is basefilename', baseFilename)

      // Check if the header is already cached
      if (state.cached_headers[baseFilename]) {
        console.log('cached headers', state.cached_headers[baseFilename])
        return state.cached_headers[baseFilename]
      }

      const url = rootState.api_endpoints.active_api + `/fitsheader/${baseFilename}/`
      try {
        const response = await axios.get(url)
        const header = response.data

        // Cache the header in the Vuex state
        commit('cacheHeader', { baseFilename, header })

        return header
      } catch (e) {
        console.warn(e)
        return {}
      }
    } else {
      return {}
    }
  },

  toggle_live_data ({ commit, dispatch }, val) {
    commit('live_data', val)
    if (val) {
      dispatch('load_latest_images')
    }
  },

  // Load and display a single placeholder image for a site.
  display_placeholder_image ({ commit }) {
    const placeholder_url = 'https://via.placeholder.com/768x768?text=nothing here yet'
    const placeholder_image = {
      jpg_url: placeholder_url,
      base_filename: 'placeholder image',
      recency_order: 0 // need this so prev/next buttons don't break
    }
    commit('setRecentImages', [placeholder_image])
    commit('setCurrentImage', placeholder_image)
  },

  /**
     * Set this_image as the current displayed image
     */
  set_current_image ({ commit }, this_image) {
    commit('setCurrentImage', this_image)
  },

  /**
  * Set the current image to the most recent one in recent_images.
  */
  set_latest_image ({ commit, dispatch, state }) {
    const the_current_image = state.recent_images[0]
    commit('setCurrentImage', the_current_image)
  },

  set_info_image_as_current_image ({ commit, state }, channel) {
    commit('setCurrentImage', state.info_images[channel])
  },

  set_next_image ({ commit, state }) {
    let next_image
    const index = state.recent_images.indexOf(state.current_image)
    if (index >= 0 && index < state.recent_images.length - 1) {
      next_image = state.recent_images[index + 1]
      commit('setCurrentImage', next_image)
    }
  },
  set_previous_image ({ commit, state }) {
    let prev_image
    const index = state.recent_images.indexOf(state.current_image)
    if (index >= 1) {
      prev_image = state.recent_images[index - 1]
      commit('setCurrentImage', prev_image)
    }
  },
  set_first_image ({ commit, state }) {
    const first_image = state.recent_images[state.recent_images.length - 1]
    commit('setCurrentImage', first_image)
  },

  set_grouped_images ({ commit, state }) {
    const grouped_image = state.grouped_images
    commit('setGroupedImages', { ...grouped_image })
  },

  async get_fits_url ({ rootState }, { base_filename, data_type, reduction_level }) {
    // Get the global configuration for all sites from an api call.
    const apiName = rootState.api_endpoints.active_api

    const path = '/download'
    const body = {
      object_name: `${base_filename}-${data_type}${reduction_level}.fits.fz`
    }
    const fits_url = await axios.post(apiName + path, body)

    return fits_url.data
  }

}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}

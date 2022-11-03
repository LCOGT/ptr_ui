/**
 *  This module is responsible for tracking the state of fields holding parameters
 *  for commands (eg. exposure time).
 *
 */
import helpers from '../../utils/helpers'

const state = {

  // Mount parameters
  mount_ra: '',
  mount_dec: '',
  mount_object: '',
  mount_ha: '0',
  mount_az: '0',
  mount_alt: '45',

  telescope_selection: 1, // 1: main telescope, 2: auxiliary telescope
  telescope_coordinate_frame: 'ICRS',

  // Stack parameters
  smartstackIsActive: true,
  longstackIsActive: false,

  // Subframe parameters
  subframeIsActive: false,
  subframeDefinedWithFile: '',

  camera_areas_selection: 'Full',
  camera_note: '',
  object_name: '',
  camera_exposure: '1',
  camera_count: 1, // numberinput form requires number, not string. converted to string in expose command.
  camera_area: null,
  camera_bin: [1, 1],
  camera_dither: 'off',
  camera_extract: 'on', // requested by Wayne for SEP related tests 20200413
  camera_image_type: 'light',

  camera_cooling: 'off',
  camera_temperature: -20,
  camera_de_ice_cooling: false,

  filter_wheel_options_selection: '',

  selector_position: 0, // the chosen inst. selector position.

  focuser_relative: '',
  focuser_absolute: '',

  rotator_relative: '',
  rotator_absolute: '',

  screen_brightness: 100
}

const getters = {

  mount_ra: state => state.mount_ra,
  mount_dec: state => state.mount_dec,
  mount_object: state => state.mount_object,
  mount_ha: state => state.mount_ha,
  mount_az: state => state.mount_az,
  mount_alt: state => state.mount_alt,

  telescope_selection: state => state.telescope_selection,
  telescope_coordinate_frame: state => state.telescope_coordinate_frame,

  smartstackIsActive: state => state.smartstackIsActive,
  longstackIsActive: state => state.longstackIsActive,

  subframeIsActive: state => state.subframeIsActive,
  subframeDefinedWithFile: state => state.subframeDefinedWithFile,

  camera_areas_selection: state => state.camera_areas_selection,
  camera_note: state => state.camera_note,
  object_name: state => state.object_name,
  camera_exposure: state => state.camera_exposure,
  camera_count: state => state.camera_count,
  camera_bin: state => state.camera_bin,
  camera_dither: state => state.camera_dither,
  camera_extract: state => state.camera_extract,
  camera_image_type: state => state.camera_image_type,

  camera_cooling: state => state.camera_cooling,
  camera_temperature: state => state.camera_temperature,
  camera_de_ice_cooling: state => state.camera_de_ice_cooling,

  filter_wheel_options_selection: state => state.filter_wheel_options_selection,

  selector_position: state => state.selector_position,

  focuser_relative: state => state.focuser_relative,
  focuser_absolute: state => state.focuser_absolute,

  rotator_relative: state => state.rotator_relative,
  rotator_absolute: state => state.rotator_absolute,

  screen_brightness: state => state.screen_brightness

}

const mutations = {

  mount_ra (state, val) {
    // Clear the mount object name if the new coordinates have changed significantly
    const large_anglular_difference_degrees = 3

    const old_ra = helpers.hour2degree(state.mount_ra) // convert hours to degrees
    const new_ra = helpers.hour2degree(val)
    const dec = state.mount_dec // since dec doesn't change here, use it for both positions
    const angle = helpers.angular_distance(old_ra, dec, new_ra, dec)
    if (!isNaN(angle) & angle > large_anglular_difference_degrees) {
      state.mount_object = ''
    }

    // finally, update the right ascension
    state.mount_ra = val
  },
  mount_dec (state, val) {
    // Clear the mount object name if the new coordinates have changed significantly
    const large_anglular_difference_degrees = 3

    const old_dec = state.mount_dec
    const new_dec = val
    const ra = state.mount_ra // since ra doesn't change here, use it for the both positions
    const angle = helpers.angular_distance(ra, old_dec, ra, new_dec)
    if (!isNaN(angle) & angle > large_anglular_difference_degrees) {
      state.mount_object = ''
    }

    // finally, update the declination
    state.mount_dec = val
  },
  mount_ha (state, val) { state.mount_ha = val },
  mount_az (state, val) { state.mount_az = val },
  mount_alt (state, val) { state.mount_alt = val },
  mount_object (state, val) { state.mount_object = val },

  telescope_selection (state, val) { state.telescope_selection = val },
  telescope_coordinate_frame (state, val) { state.telescope_coordinate_frame = val },

  smartstackIsActive (state, val) { state.smartstackIsActive = val },
  longstackIsActive (state, val) { state.longstackIsActive = val },

  subframeIsActive (state, val) { state.subframeIsActive = val },
  subframeDefinedWithFile (state, val) { state.subframeDefinedWithFile = val },

  camera_areas_selection (state, val) { state.camera_areas_selection = val },
  camera_note (state, val) { state.camera_note = val },
  object_name (state, val) { state.object_name = val },
  camera_exposure (state, val) { state.camera_exposure = val },
  camera_count (state, val) { state.camera_count = val },
  camera_bin (state, val) { state.camera_bin = val },
  camera_dither (state, val) { state.camera_dither = val },
  camera_extract (state, val) { state.camera_extract = val },
  camera_image_type (state, val) { state.camera_image_type = val },

  camera_cooling (state, val) { state.camera_cooling = val },
  camera_temperature (state, val) { state.camera_temperature = val },
  camera_de_ice_cooling (state, val) { state.camera_de_ice_cooling = val },

  filter_wheel_options_selection (state, val) { state.filter_wheel_options_selection = val },

  selector_position (state, val) { state.selector_position = val },

  focuser_relative (state, val) { state.focuser_relative = val },
  focuser_absolute (state, val) { state.focuser_absolute = val },

  rotator_relative (state, val) { state.rotator_relative = val },
  rotator_absolute (state, val) { state.rotator_absolute = val },

  screen_brightness (state, val) { state.screen_brightness = val }
}

const actions = {
  // This action does nothing. It exists for easy reference.
  empty ({ commit }, payload) {
    // commit('mutation_name', value)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}

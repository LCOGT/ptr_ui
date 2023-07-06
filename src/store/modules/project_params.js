
const state = {
  project_name: '',
  project_events: [],
  project_note: '',
  project_sites: ['common pool'],
  project_window: 28, // in days, how long the project has a chance to be scheduled
  exposures_index: 1,
  exposures: [
    {
      active: true,
      count: 1,
      imtype: 'light',
      exposure: 1,
      filter: 'Lum',
      area: 'FULL',
      bin: 'optimal',
      dither: 'no',
      drizzle: '1',
      photometry: '-',
      defocus: 0,
      smartstack: true,
      longstack: false
    }
  ],
  targets_index: 1,
  targets: [
    {
      active: true,
      name: '',
      ra: '',
      dec: ''
    }
  ],

  // Project constraints below
  project_is_active: true,
  generic_instrument: 'Main Camera',
  meridian_flip: 'flip_ok', // can be ['flip_ok', 'no_flip', 'east_only', 'west_only']
  ra_offset: 0.0,
  ra_offset_units: 'deg',
  dec_offset: 0.0,
  dec_offset_units: 'deg',
  position_angle: 0,
  max_ha: 4, // decimal hours
  min_zenith_dist: 0, // degrees
  max_airmass: 2.0,
  lunar_dist_min: 30, // deg
  lunar_phase_max: 60, // %
  frequent_autofocus: false,
  near_tycho_star: false,
  prefer_bessell: false,
  enhance_photometry: false,
  close_on_block_completion: false,
  add_center_to_mosaic: false,
  dark_sky_setting: false,
  deplete: true,
  cycle: true,
  tco: false,
  RAhours: true,
  hrsminssecs: false,
  expiry_date: new Date(), // Date obj here for datetimepicker, but gets converted to moment str in UTC
  start_date: new Date() // Date obj here for datetimepicker, but gets converted to moment str in UTC
}

const getters = {
}

const mutations = {
  project_name (state, val) { state.project_name = val },
  project_events (state, val) { state.project_events = val },
  project_note (state, val) { state.project_note = val },
  project_sites (state, val) { state.project_sites = val },
  project_window (state, val) { state.project_window = val },
  exposures_index (state, val) { state.exposures_index = val },
  exposures (state, val) { state.exposures = val },
  targets_index (state, val) { state.targets_index = val },
  targets (state, val) { state.targets = val },

  project_is_active (state, val) { state.project_is_active = val },
  generic_instrument (state, val) { state.generic_instrument = val },
  meridian_flip (state, val) { state.meridian_flip = val },
  ra_offset (state, val) { state.ra_offset = val },
  ra_offset_units (state, val) { state.ra_offset_units = val },
  dec_offset (state, val) { state.dec_offset = val },
  dec_offset_units (state, val) { state.dec_offset_units = val },
  position_angle (state, val) { state.position_angle = val },
  max_ha (state, val) { state.max_ha = val },
  min_zenith_dist (state, val) { state.min_zenith_dist = val },
  max_airmass (state, val) { state.max_airmass = val },
  lunar_dist_min (state, val) { state.lunar_dist_min = val },
  lunar_phase_min (state, val) { state.lunar_phase_min = val },
  frequent_autofocus (state, val) { state.frequent_autofocus = val },
  near_tycho_star (state, val) { state.near_tycho_star = val },
  prefer_bessell (state, val) { state.prefer_bessel = val },
  enhance_photometry (state, val) { state.enhance_photometry = val },
  close_on_block_completion (state, val) { state.close_on_block_completion = val },
  add_center_to_mosaic (state, val) { state.add_center_to_mosaic = val },
  dark_sky_setting (state, val) { state.dark_sky_setting = val },
  deplete (state, val) { state.deplete = val },
  cycle (state, val) { state.cycle = val },
  tco (state, val) { state.tco = val },
  RAhours (state, val) { state.RAhours = val },
  rhsminssecs (state, val) { state.hrsminssecs = val },
  expiry_date (state, val) { state.expiry_date = val },
  start_date (state, val) { state.start_date = val }
}

const actions = {
  // This action does nothing. It exists for easy reference.
  clearProjectForm({ commit }) {
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

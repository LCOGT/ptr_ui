import moment from 'moment'

const state = {
  project_window: 7, // in days, how long the project has a chance to be scheduled; this is not sent with the project

  project_name: '',
  project_events: [],
  project_note: '',
  project_sites: ['common pool'], // can include 'common_pool' or any sitecode
  project_priority: 'standard', // can be ['standard', 'time_critical', 'low_priority']
  project_creator: {
    username: '',
    user_id: ''
  },
  exposures_index: 1,
  exposures: [
    {
      active: true,
      count: 1,
      imtype: 'light',
      exposure: 1,
      filter: 'Lum',
      zoom: 'Full',
      bin: 'optimal',
      width: '0.0',
      height: '0.0',
      angle: '0.0'
    }
  ],
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
  expiry_date: new Date(), // Date obj here for datetimepicker, but gets converted to moment str in UTC
  start_date: new Date(), // Date obj here for datetimepicker, but gets converted to moment str in UTC
  long_stack: false,
  smart_stack: true,
  defocus: 0
}

const getters = {
  project_constraints: state => {
    return {
      project_is_active: state.project_is_active,
      generic_instrument: state.generic_instrument,
      meridian_flip: state.meridian_flip,
      ra_offset: state.ra_offset,
      ra_offset_units: state.ra_offset_units,
      dec_offset: state.dec_offset,
      dec_offset_units: state.dec_offset_units,
      position_angle: state.position_angle,
      max_ha: state.max_ha,
      min_zenith_dist: state.min_zenith_dist,
      max_airmass: state.max_airmass,
      lunar_dist_min: state.lunar_dist_min,
      lunar_phase_max: state.lunar_phase_max,
      frequent_autofocus: state.frequent_autofocus,
      near_tycho_star: state.near_tycho_star,
      prefer_bessell: state.prefer_bessell,
      enhance_photometry: state.enhance_photometry,
      close_on_block_completion: state.close_on_block_completion,
      add_center_to_mosaic: state.add_center_to_mosaic,
      dark_sky_setting: state.dark_sky_setting,
      deplete: state.deplete,
      cycle: state.cycle,
      expiry_date: state.expiry_date,
      start_date: state.start_date,
      smart_stack: state.smart_stack,
      long_stack: state.long_stack,
      defocus: state.defocus
    }
  },
  projectToSend: (state, getters, rootState) => {
    const project = {
      project_name: state.project_name,
      created_at: moment().utc().format(),
      user_id: rootState.user_data.userId,
      project_note: state.project_note,
      project_priority: state.project_priority,
      project_creator: state.project_creator,
      project_constraints: getters.project_constraints,
      project_targets: state.targets
        .filter(t => t.active)
        .map(({ active, ...stuff_to_keep }) => stuff_to_keep),
      project_sites: state.project_sites,
      exposures: state.exposures
        .filter(e => e.active)
        .map(({ active, ...stuff_to_keep }) => stuff_to_keep),
      // Nested arrays such that
      // remaining[exposure_index] = number of remaining exposures
      remaining: state.exposures.map(e => parseInt(e.count)),
      // Empty nested arrays such that
      // project_data[exposure_index] = [array of filenames]
      project_data: state.exposures.map(e => []),
      scheduled_with_events: state.project_events,

      // This ignores the TZ info and acts as if the input to the datetime picker is in UTC
      // no matter the user's timezone
      start_date: moment(state.start_date).format('YYYY-MM-DDTHH:mm:ss'),
      expiry_date: moment(state.expiry_date).format('YYYY-MM-DDTHH:mm:ss')
    }
    return project
  }
}

const mutations = {
  project_name (state, val) { state.project_name = val },
  project_events (state, val) { state.project_events = val },
  project_note (state, val) { state.project_note = val },
  project_sites (state, val) { state.project_sites = val },
  project_window (state, val) { state.project_window = val },
  project_priority (state, val) { state.project_priority = val },
  project_creator (state, val) { state.project_creator = val },
  exposures_index (state, val) { state.exposures_index = val },
  exposures (state, val) { state.exposures = val },
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
  lunar_phase_max (state, val) { state.lunar_phase_max = val },
  frequent_autofocus (state, val) { state.frequent_autofocus = val },
  near_tycho_star (state, val) { state.near_tycho_star = val },
  prefer_bessell (state, val) { state.prefer_bessell = val },
  enhance_photometry (state, val) { state.enhance_photometry = val },
  close_on_block_completion (state, val) { state.close_on_block_completion = val },
  add_center_to_mosaic (state, val) { state.add_center_to_mosaic = val },
  dark_sky_setting (state, val) { state.dark_sky_setting = val },
  deplete (state, val) { state.deplete = val },
  cycle (state, val) { state.cycle = val },
  expiry_date (state, val) { state.expiry_date = val },
  start_date (state, val) { state.start_date = val },
  long_stack (state, val) { state.long_stack = val },
  smart_stack (state, val) { state.smart_stack = val },
  defocus (state, val) { state.defocus = val }
}

const actions = {
  resetProjectForm ({ state, commit, rootState }) {
    commit('project_name', '')
    commit('project_events', [])
    commit('project_note', '')
    commit('project_sites', [rootState.site_config.selected_site])
    commit('project_priority', 'standard')
    commit('project_creator', { username: '', user_id: '' })
    commit('targets', [{
      active: true,
      name: '',
      ra: '',
      dec: ''
    }])
    commit('exposures', [
      {
        active: true,
        count: 1,
        imtype: 'light',
        exposure: 1,
        filter: 'Lum',
        zoom: 'Full',
        bin: 'optimal',
        width: '0.0',
        height: '0.0',
        angle: '0.0'
      }
    ])
    commit('exposures_index', 1)
    commit('project_is_active', true)
    commit('ra_offset', 0.0)
    commit('ra_offset_units', 'deg')
    commit('dec_offset', 0.0)
    commit('dec_offset_units', 'deg')
    commit('position_angle', 0)
    commit('max_ha', 4) // decimal hrs
    commit('min_zenith_dist', 0) // deg
    commit('max_airmass', 2.0)
    commit('lunar_dist_min', 30) // deg
    commit('lunar_phase_max', 60) // %
    commit('frequent_autofocus', false)
    commit('near_tycho_star', false)
    commit('prefer_bessell', false)
    commit('enhance_photometry', false)
    commit('close_on_block_completion', false)
    commit('add_center_to_mosaic', false)
    commit('dark_sky_setting', false)
    commit('generic_instrument', 'Main Camera')
    commit('deplete', true)
    commit('cycle', true)

    const today = new Date()
    const expiry_date = new Date()
    expiry_date.setDate(today.getDate() + state.project_window)
    expiry_date.setMinutes(today.getMinutes() + today.getTimezoneOffset())
    commit('expiry_date', expiry_date)

    const start_date = new Date()
    start_date.setDate(today.getDate())
    start_date.setMinutes(today.getMinutes() + today.getTimezoneOffset())
    commit('start_date', start_date)

    commit('smart_stack', true)
    commit('long_stack', false)
    commit('defocus', 0)
  },
  loadProject ({ state, commit }, project) {
    commit('project_name', project.project_name)
    commit('project_events', project.scheduled_with_events)
    commit('project_sites', project.project_sites)
    commit('targets', project.project_targets.map(target => ({ ...target, active: true })))
    commit('project_note', project.project_note)
    commit('project_priority', project?.project_priority || 'standard')
    commit('project_creator', project?.project_creator || { username: 'n/a', user_id: project.user_id })
    commit('exposures', project.exposures.map(exposure => ({ ...exposure, active: true })))
    commit('exposures_index', state.exposures.length)

    for (const key in project.project_constraints) {
      commit(key, project.project_constraints[key])
    }
    commit('start_date', moment(project.project_constraints.start_date).toDate())
    commit('expiry_date', moment(project.project_constraints.expiry_date).toDate())
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}


const enclosure_state = (state, getters, rootState) => {
  if (Object.keys(state.enclosure).includes(rootState.site_config.selected_enclosure)) {
    return state.enclosure[rootState.site_config.selected_enclosure]
  } else {
    return {}
  }
}

// should rename this to 'enclosure_open_status' or similar
const enclosure_status = (state, getters, rootState) => {
  try {
    return getters.enclosure_state.shutter_status 
      || getters.enclosure_state.roof_status 
      || '-'
  } catch { 
    return {} 
  }
}

const enclosure_mode = (state, getters, rootState) => {
  try {
    return getters.enclosure_state.enclosure_mode
  } catch { 
    return {} 
  }
}

const dome_azimuth = (state, getters, rootState) => {
  try {
    return getters.enclosure_state.dome_azimuth
  } catch {
    return '-'
  }
}

const dome_slewing = (state, getters, rootState) => {
  try {
    return getters.enclosure_state.dome_slewing
  } catch {
    return '-'
  }
}

const enclosure_synchronized = (state, getters, rootState) => {
  try {
    return getters.enclosure_state.enclosure_synch
  } catch {
    return '-'
  }
}

export default {
  enclosure_state,
  enclosure_status,
  enclosure_mode,
  dome_azimuth,
  dome_slewing,
  enclosure_synchronized,
}
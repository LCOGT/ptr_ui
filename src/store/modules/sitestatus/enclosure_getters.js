
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

/* 
Define the status items that are calculated from the wxEncStatus status type. 
 
Then, when the weather status timestamp is old, we can selectively mark these items 
as stale by making them grey or some other style change. 
  
Note: there is a similar item in the enclosure getters, since enclosure and weather
status are reported together.
  
This list must be manually updated when new getters are added!
*/
const enclosure_status_items = () => [
  'enclosure_state',
  'enclosure_status',
  'enclosure_mode',
  'dome_azimuth',
  'dome_slewing',
  'enclosure_synchronized',
]

export default {
  enclosure_state,
  enclosure_status,
  enclosure_mode,
  dome_azimuth,
  dome_slewing,
  enclosure_synchronized,

  enclosure_status_items
}
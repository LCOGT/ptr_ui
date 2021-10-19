import { isItemStale } from './status_utils'

// Handle status before and after the individual timestamp inclusion
function get_val(getters, key) {
  return getters.enclosure_state[key]?.val ?? getters.enclosure_state[key] ?? '-'
}

const enclosure_state = (state, getters, rootState) => {
    return state.enclosure?.[rootState.site_config.selected_enclosure] ?? {}
}

const enclosure_open_status = (state, getters) => {
  let name = 'Enc. Status'
  let val = '-'
  let is_stale = true
  if (Object.keys(getters.enclosure_state).includes('shutter_status')) {
    val = get_val(getters, 'shutter_status')
    is_stale = isItemStale(getters, 'enclosure_state', 'shutter_status')
  } else if (Object.keys(getters.enclosure_state).includes('roof_status')) {
    val = get_val(getters, 'shutter_status')
    is_stale = isItemStale(getters, 'enclosure_state', 'roof_status')
  }
  return { name, val, is_stale }
}

const enclosure_mode = (state, getters) => {
  let name = 'Enc. Mode'
  let val = get_val(getters, 'enclosure_mode')
  let is_stale = isItemStale(getters, 'enclosure_state', 'enclosure_mode')
  return { name, val, is_stale }
}

const dome_azimuth = (state, getters) => {
  let name = 'Dome Az'
  let val = get_val(getters, 'dome_azimuth')
  let is_stale = isItemStale(getters, 'enclosure_state', 'dome_azimuth')
  return { name, val, is_stale }
}

const dome_slewing = (state, getters) => {
  let name = 'Dome Slewing'
  let val = get_val(getters, 'dome_slewing')
  let is_stale = isItemStale(getters, 'enclosure_state', 'dome_slewing')
  return { name, val, is_stale }
}

const enclosure_synchronized = (state, getters) => {
  let name = 'Enc. Synced'
  let val = get_val(getters, 'enclosure_synchronized')
  let is_stale = isItemStale(getters, 'enclosure_state', 'enclosure_synchronized')
  return { name, val, is_stale }
}

const enclosure_message = (state, getters) => {
  let name = 'Enclosure Message'
  let val = get_val(getters, 'enclosure_message')
  let is_stale = isItemStale(getters, 'enclosure_state', 'enclosure_message')
  return { name, val, is_stale }
}

export default {
  enclosure_state,
  enclosure_open_status,
  enclosure_mode,
  dome_azimuth,
  dome_slewing,
  enclosure_synchronized,
  enclosure_message,
}

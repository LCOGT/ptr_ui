
import { STALE_AGE_MS, isItemStale, parseTrueFalse } from './status_utils'

function get_val(getters, key) {
  return getters.mount_state[key]?.val ?? getters.mount_state[key] ?? '-'
}
function get_timestamp(getters, key) {
  let timestamp_ms = getters.mount_state[key]?.timestamp ?? 0
  let timestamp_s = timestamp_ms / 1000
  return timestamp_s
}

const mount_state = (state, getters, rootState) => {
  return state.mount[rootState.site_config.selected_mount] ?? {}
}

const mount_is_slewing = (state, getters) => {
  let name = 'Mount Slewing'
  let val = get_val(getters, 'is_slewing')
  let is_stale = isItemStale(getters, 'mount_state', 'is_slewing')
  return { name, val, is_stale }
}

const mount_is_parked = (state, getters) => {
  let name = 'Mount Parked'
  let val = get_val(getters, 'is_parked')
  let is_stale = isItemStale(getters, 'mount_state', 'is_parked')
  return { name, val, is_stale }
}

const mount_is_tracking = (state, getters) => {
  let name = 'Mount Tracking'
  let val = get_val(getters, 'is_tracking')
  let is_stale = isItemStale(getters, 'mount_state', 'is_tracking')
  return { name, val, is_stale }
}

const mount_activity = (state, getters) => {
  let name = 'Mount'
  let val = 'idle'
  let is_stale = true
  if (Object.keys(getters.mount_state).length === 0) { 
    val = "offline" 
  }
  else if (parseTrueFalse(getters.mount_state.is_parked?.val)) { 
    val = "parked" 
    //is_stale = (getters.timestamp - get_timestamp(getters, 'is')) > STALE_AGE_MS
    is_stale = isItemStale(getters, 'mount_state', 'is_parked')
  }
  else if (parseTrueFalse(getters.mount_state.is_tracking?.val)) { 
    val = "tracking" 
    is_stale = isItemStale(getters, 'mount_state', 'is_tracking')
  }
  else if (parseTrueFalse(getters.mount_state.is_slewing?.val)) { 
    val = "slewing" 
    is_stale = isItemStale(getters, 'mount_state', 'is_slewing')
  }
  return { name, val, is_stale }
}

const mount_message = (state, getters) => {
  let name = 'Mount Message'
  let val = get_val(getters, 'message')
  let is_stale = isItemStale(getters, 'mount_state', 'message')
  return { name, val, is_stale }
}

export default {
  mount_state,
  mount_is_slewing,
  mount_is_parked,
  mount_is_tracking,
  mount_activity,
  mount_message,
}
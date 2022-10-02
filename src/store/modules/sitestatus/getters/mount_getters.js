
import { isItemStale, parseTrueFalse } from './status_utils'

function get_val (getters, key) {
  return getters.mount_state[key]?.val ?? getters.mount_state[key] ?? '-'
}

const mount_state = (state, getters, rootState) => {
  return state.mount[rootState.site_config.selected_mount] ?? {}
}

const mount_is_slewing = (state, getters) => {
  const name = 'Mount Slewing'
  const val = get_val(getters, 'is_slewing')
  const is_stale = isItemStale(getters, 'mount_state', 'is_slewing')
  return { name, val, is_stale }
}

const mount_is_parked = (state, getters) => {
  const name = 'Mount Parked'
  const val = get_val(getters, 'is_parked')
  const is_stale = isItemStale(getters, 'mount_state', 'is_parked')
  return { name, val, is_stale }
}

const mount_is_tracking = (state, getters) => {
  const name = 'Mount Tracking'
  const val = get_val(getters, 'is_tracking')
  const is_stale = isItemStale(getters, 'mount_state', 'is_tracking')
  return { name, val, is_stale }
}

const mount_activity = (state, getters) => {
  const name = 'Mount'
  let val = 'idle'
  let is_stale = true
  if (Object.keys(getters.mount_state).length === 0) {
    val = 'offline'
  }
  else if (parseTrueFalse(getters.mount_state.is_parked?.val)) {
    val = 'parked'
    is_stale = isItemStale(getters, 'mount_state', 'is_parked')
  }
  else if (parseTrueFalse(getters.mount_state.is_tracking?.val)) {
    val = 'tracking'
    is_stale = isItemStale(getters, 'mount_state', 'is_tracking')
  }
  else if (parseTrueFalse(getters.mount_state.is_slewing?.val)) {
    val = 'slewing'
    is_stale = isItemStale(getters, 'mount_state', 'is_slewing')
  }
  return { name, val, is_stale }
}

const mount_message = (state, getters) => {
  const name = 'Mount Message'
  const val = get_val(getters, 'message')
  const is_stale = isItemStale(getters, 'mount_state', 'message')
  return { name, val, is_stale }
}

export default {
  mount_state,
  mount_is_slewing,
  mount_is_parked,
  mount_is_tracking,
  mount_activity,
  mount_message
}

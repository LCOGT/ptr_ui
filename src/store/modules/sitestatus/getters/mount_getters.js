
import { isItemStale, parseTrueFalse } from './status_utils'

function get_val (getters, key) {
  return getters.mount_state[key]?.val ?? '-'
}

const ra = (state, getters) => {
  const name = 'Ra'
  const val = parseFloat(getters.mount_state.right_ascension?.val)?.toFixed(4) ?? '-'
  const is_stale = isItemStale(getters, 'mount_state', 'right_ascension')
  return { name, val, is_stale }
}

const dec = (state, getters) => {
  const name = 'Dec'
  const val = parseFloat(getters.mount_state.declination?.val)?.toFixed(4) ?? '-'
  const is_stale = isItemStale(getters, 'mount_state', 'declination')
  return { name, val, is_stale }
}

const azimuth = (state, getters) => {
  const name = 'Azimuth'
  const val = parseFloat(getters.mount_state.azimuth?.val)?.toFixed(4) ?? '-'
  const is_stale = isItemStale(getters, 'mount_state', 'azimuth')
  return { name, val, is_stale }
}

const altitude = (state, getters) => {
  const name = 'Altitude'
  const val = parseFloat(getters.mount_state.altitude?.val)?.toFixed(4) ?? '-'
  const is_stale = isItemStale(getters, 'mount_state', 'altitude')
  return { name, val, is_stale }
}

const sidereal_time = (state, getters) => {
  const name = 'Sidereal Time'
  const val = get_val(getters, 'sidereal_time')
  const is_stale = isItemStale(getters, 'telescope_state', 'sidereal_time')
  return { name, val, is_stale }
}

const zenith_distance = (state, getters) => {
  const name = 'Zenith Dist.'
  const val = parseFloat(getters.mount_state.zenith_distance?.val)?.toFixed(4) ?? '-'
  const is_stale = isItemStale(getters, 'mount_state', 'zenith_distance')
  return { name, val, is_stale }
}

const airmass = (state, getters) => {
  const name = 'Airmass'
  const val = parseFloat(getters.mount_state.airmass?.val)?.toFixed(4) ?? '-'
  const is_stale = isItemStale(getters, 'mount_state', 'airmass')
  return { name, val, is_stale }
}

const transition_time = (state, getters) => {
  const name = 'Transit. Time'
  const val = parseFloat(getters.mount_state.airmass?.val)?.toFixed(4) ?? '-'
  const is_stale = isItemStale(getters, 'mount_state', 'transit_time')
  return { name, val, is_stale }
}

const refraction = (state, getters) => {
  const name = 'Refraction'
  const val = parseFloat(getters.mount_state.refraction?.val)?.toFixed(4) ?? '-'
  const is_stale = isItemStale(getters, 'mount_state', 'refraction')
  return { name, val, is_stale }
}

const hour_angle = (state, getters) => {
  const name = 'HA'
  let val
  const is_stale = isItemStale(getters, 'mount_state', 'azimuth') &&
    isItemStale(getters, 'mount_state', 'right_ascension')

  let ha = getters.mount_state.sidereal_time?.val - getters.mount_state.right_ascension?.val
  if (isNaN(ha)) {
    val = '-' // if sidereal_time or right_ascension is not provided, can't calculate hour_angle.
  } else {
    if (ha < -12) { ha += 24 } // hours, since we're in decimal
    if (ha > 12) { ha -= 24 } // hours, since we're in decimal
    ha = ha.toFixed(3)
    if (ha > 0) { ha = '+' + ha }
    val = ha
  }
  return { name, val, is_stale }
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
  ra,
  dec,
  azimuth,
  altitude,
  sidereal_time,
  zenith_distance,
  airmass,
  transition_time,
  refraction,
  hour_angle,
  mount_state,
  mount_is_slewing,
  mount_is_parked,
  mount_is_tracking,
  mount_activity,
  mount_message
}

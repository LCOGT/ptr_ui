import { isItemStale } from './status_utils'

// Handle status before and after the individual timestamp inclusion
function get_val (getters, key) {
  return getters.telescope_state[key]?.val ?? '-'
}

const telescope_state = (state, getters, rootState) => {
  return state.telescope?.[rootState.site_config.selected_telescope] ?? {}
}

const ra = (state, getters) => {
  const name = 'Ra'
  const val = parseFloat(getters.telescope_state.right_ascension?.val)?.toFixed(4) ?? '-'
  const is_stale = isItemStale(getters, 'telescope_state', 'right_ascension')
  return { name, val, is_stale }
}

const dec = (state, getters) => {
  const name = 'Dec'
  const val = parseFloat(getters.telescope_state.declination?.val)?.toFixed(4) ?? '-'
  const is_stale = isItemStale(getters, 'telescope_state', 'declination')
  return { name, val, is_stale }
}

const azimuth = (state, getters) => {
  const name = 'Azimuth'
  const val = get_val(getters, 'azimuth')
  const is_stale = isItemStale(getters, 'telescope_state', 'azimuth')
  return { name, val, is_stale }
}

const altitude = (state, getters) => {
  const name = 'Altitude'
  const val = get_val(getters, 'altitude')
  const is_stale = isItemStale(getters, 'telescope_state', 'altitude')
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
  const val = get_val(getters, 'zenith_distance')
  const is_stale = isItemStale(getters, 'telescope_state', 'zenith_distance')
  return { name, val, is_stale }
}

const airmass = (state, getters) => {
  const name = 'Airmass'
  const val = get_val(getters, 'airmass')
  const is_stale = isItemStale(getters, 'telescope_state', 'airmass')
  return { name, val, is_stale }
}

const refraction = (state, getters) => {
  const name = 'Refraction'
  const val = get_val(getters, 'refraction')
  const is_stale = isItemStale(getters, 'telescope_state', 'refraction')
  return { name, val, is_stale }
}

const hour_angle = (state, getters) => {
  const name = 'HA'
  let val
  const is_stale = isItemStale(getters, 'telescope_state', 'azimuth') &&
    isItemStale(getters, 'telescope_state', 'right_ascension')

  let ha = getters.telescope_state.sidereal_time?.val - getters.telescope_state.right_ascension?.val
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

const telescope_message = (state, getters) => {
  const name = 'Telescope Message'
  const val = get_val(getters, 'message')
  const is_stale = isItemStale(getters, 'telescope_state', 'message')
  return { name, val, is_stale }
}

export default {
  telescope_state,
  ra,
  dec,
  azimuth,
  altitude,
  sidereal_time,
  zenith_distance,
  airmass,
  refraction,
  hour_angle,
  telescope_message
}

import { isItemStale } from './status_utils'

// Handle status before and after the individual timestamp inclusion
function get_val (getters, key) {
  return getters.enclosure_state[key]?.val ?? '-'
}

const enclosure_state = (state, getters, rootState) => {
  return state.enclosure?.[rootState.site_config.selected_enclosure] ?? {}
}

const enclosure_open_status = (state, getters) => {
  const name = 'Enc. Status'
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

const enclosure_is_open = (getters) => {
  const name = 'Enc. Open'
  const val = get_val(getters, 'enclosure_is_open')
  const is_stale = isItemStale(getters, 'enclosure_state', 'enclosure_is_open')
  return { name, val, is_stale }
}

const shut_reason_is_bad_weather = (state, getters) => {
  const name = 'Weather Closure'
  const val = get_val(getters, 'shut_reason_bad_weather')
  const is_stale = isItemStale(getters, 'enclosure_state', 'shut_reason_bad_weather')
  return { name, val, is_stale }
}
const shut_reason_is_daytime = (state, getters) => {
  const name = 'Daytime Closure'
  const val = get_val(getters, 'shut_reason_daytime')
  const is_stale = isItemStale(getters, 'enclosure_state', 'shut_reason_daytime')
  return { name, val, is_stale }
}
const shut_reason_is_manual_mode = (state, getters) => {
  const name = 'Manual Closure'
  const val = get_val(getters, 'shut_reason_manual_mode')
  const is_stale = isItemStale(getters, 'enclosure_state', 'shut_reason_manual_mode')
  return { name, val, is_stale }
}

const enclosure_mode = (state, getters) => {
  const name = 'Enc. Mode'
  const val = get_val(getters, 'enclosure_mode')
  const is_stale = isItemStale(getters, 'enclosure_state', 'enclosure_mode')
  return { name, val, is_stale }
}

const dome_azimuth = (state, getters) => {
  const name = 'Dome Az'
  const val = get_val(getters, 'dome_azimuth')
  const is_stale = isItemStale(getters, 'enclosure_state', 'dome_azimuth')
  return { name, val, is_stale }
}

const dome_slewing = (state, getters) => {
  const name = 'Dome Slewing'
  const val = get_val(getters, 'dome_slewing')
  const is_stale = isItemStale(getters, 'enclosure_state', 'dome_slewing')
  return { name, val, is_stale }
}

const enclosure_synchronized = (state, getters) => {
  const name = 'Enc. Synced'
  const val = get_val(getters, 'enclosure_synchronized')
  const is_stale = isItemStale(getters, 'enclosure_state', 'enclosure_synchronized')
  return { name, val, is_stale }
}

const enclosure_message = (state, getters) => {
  const name = 'Enclosure Message'
  const val = get_val(getters, 'enclosure_message')
  const is_stale = isItemStale(getters, 'enclosure_state', 'enclosure_message')
  return { name, val, is_stale }
}

export default {
  enclosure_state,
  enclosure_open_status,
  enclosure_is_open,
  shut_reason_is_bad_weather,
  shut_reason_is_daytime,
  shut_reason_is_manual_mode,
  enclosure_mode,
  dome_azimuth,
  dome_slewing,
  enclosure_synchronized,
  enclosure_message
}

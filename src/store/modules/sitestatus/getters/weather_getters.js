import { isItemStale, display_colors } from './status_utils'

// Handle status before and after the individual timestamp inclusion
function get_val (getters, key) {
  return getters.weather_state[key]?.val ?? getters.weather_state[key] ?? '-'
}

const weather_state = (state, getters, rootState) => {
  return state.weather[rootState.site_config.selected_weather] ?? {}
}

const weather_ok = (state, getters) => {
  const name = 'Weather OK'
  let color = display_colors.red
  const val = get_val(getters, 'wx_ok')
  const is_stale = isItemStale(getters, 'weather_state', 'wx_ok')
  if (val.toLowerCase() == 'yes') { color = display_colors.green }
  return { name, val, is_stale, color }
}

const open_ok = (state, getters) => {
  const name = 'Open OK'
  const val = get_val(getters, 'open_ok')
  let color = display_colors.red
  if (val.toLowerCase() == 'yes') { color = display_colors.green }
  const is_stale = isItemStale(getters, 'weather_state', 'open_ok')
  return { name, val, color, is_stale }
}

const sky_temp = (state, getters) => {
  const name = 'Sky Temp'
  const val = get_val(getters, 'sky_temp_C') + ' °C'
  const is_stale = isItemStale(getters, 'weather_state', 'sky_temp_C')
  return { name, val, is_stale }
}

const air_temp = (state, getters) => {
  const name = 'Air Temp'
  const val = get_val(getters, 'temperature_C') + ' °C'
  const is_stale = isItemStale(getters, 'weather_state', 'temperature_C')
  return { name, val, is_stale }
}

const humidity = (state, getters) => {
  const name = 'Humidity'
  const val = get_val(getters, 'humidity_%') + ' %'
  const is_stale = isItemStale(getters, 'weather_state', 'humidity_%')
  return { name, val, is_stale }
}

const dewpoint = (state, getters) => {
  const name = 'Dewpoint'
  const val = get_val(getters, 'dewpoint_C') + ' °C'
  const is_stale = isItemStale(getters, 'weather_state', 'dewpoint_C')
  return { name, val, is_stale }
}

const wind = (state, getters) => {
  const name = 'Wind'
  const val = get_val(getters, 'wind_m/s') + ' m/s'
  const is_stale = isItemStale(getters, 'weather_state', 'wind_m/s')
  return { name, val, is_stale }
}

// surface brightness
const surface = (state, getters) => {
  const name = 'Surface'
  const val = get_val(getters, 'calc_HSI_lux') + ' lux'
  const is_stale = isItemStale(getters, 'weather_state', 'calc_HSI_lux')
  return { name, val, is_stale }
}

const ambient = (state, getters) => {
  const name = 'Ambient'
  const val = get_val(getters, 'ambient_light')
  const is_stale = isItemStale(getters, 'weather_state', 'ambient_light')
  return { name, val, is_stale }
}

// measured sky magnitudes per square arc second
const meas_sky_mpsas = (state, getters) => {
  const name = 'Meas. mpsas'
  const val = get_val(getters, 'meas_sky_mpsas')
  const is_stale = isItemStale(getters, 'weather_state', 'meas_sky_mpsas')
  return { name, val, is_stale }
}

// calculated sky magnitudes per square arc second
const calc_sky_mpsas = (state, getters) => {
  const name = 'Calc. mpsas'
  const val = get_val(getters, 'calc_sky_mpsas')
  const is_stale = isItemStale(getters, 'weather_state', 'calc_sky_mpsas')
  return { name, val, is_stale }
}

const wx_hold = (state, getters) => {
  const name = 'Wx Hold'
  let val
  let color = display_colors.default
  const is_stale = isItemStale(getters, 'weather_state', 'wx_hold')
  if (!Object.keys(getters.weather_state).includes('wx_hold')) {
    val = 'missing key'
    color = 'grey'
  } else {
    const is_holding = getters.weather_state.wx_hold.val
    if (is_holding == 'Holding') {
      color = display_colors.red
      val = is_holding
    } else if (is_holding == 'No Hold') {
      val = 'No Hold'
    } else {
      val = is_holding
    }
  }
  return { name, val, is_stale, color }
}

const hold_duration = (state, getters) => {
  const name = 'Hold Duration'
  let val
  const is_stale = isItemStale(getters, 'weather_state', 'hold_duration')
  let color
  if (!Object.keys(getters.weather_state).includes('hold_duration')) {
    val = 'missing key'
    color = 'grey'
  } else {
    color = display_colors.default
    val = get_val(getters, 'hold_duration')
    if (getters.weather_state?.wx_hold?.val == 'Holding') { color = display_colors.red }
  }
  return { name, val, is_stale, color }
}

export default {
  weather_state,
  weather_ok,
  open_ok,
  sky_temp,
  air_temp,
  humidity,
  dewpoint,
  wind,
  surface,
  ambient,
  meas_sky_mpsas,
  calc_sky_mpsas,
  wx_hold,
  hold_duration
}

import { isItemStale, display_colors } from './status_utils'
import StatusItem from '../status_item'

// Handle status before and after the individual timestamp inclusion
function get_val(getters, key) {
  return getters.weather_state[key]?.val ?? getters.weather_state[key] ?? '-'
}

const weather_state = (state, getters, rootState) => {
  return state.observing_conditions[rootState.site_config.selected_weather] ?? {}
}

const weather_ok = (state, getters) => {
  let name = 'Weather OK'
  let color = display_colors.red
  let val = get_val(getters, 'wx_ok')
  let is_stale = isItemStale(getters, 'weather_state', 'wx_ok')
  if (val == "Yes") { color = display_colors.green }
  return { name, val, is_stale, color }
}

const open_ok = (state, getters) => {
  let name = 'Open OK'
  let val = get_val(getters, 'open_ok')
  let color = display_colors.red
  if (val == "Yes") { color = display_colors.green }
  let is_stale = isItemStale(getters, 'weather_state', 'open_ok')
  return { name, val, color, is_stale}
}

const sky_temp = (state, getters) => {
  let name = 'Sky Temp'
  let val = get_val(getters, 'sky_temp_C') + ' °C'
  let is_stale = isItemStale(getters, 'weather_state', 'sky_temp_C')
  return { name, val, is_stale }
}

const air_temp = (state, getters) => {
  let name = 'Air Temp'
  let val = get_val(getters, 'temperature_C') + ' °C'
  let is_stale = isItemStale(getters, 'weather_state', 'temperature_C')
  return { name, val, is_stale }
}

const humidity = (state, getters) => {
  let name = 'Humidity'
  let val = get_val(getters, 'humidity_%') + ' %'
  let is_stale = isItemStale(getters, 'weather_state', 'humidity_%')
  return { name, val, is_stale }
}

const dewpoint = (state, getters) => {
  let name = 'Dewpoint'
  let val = get_val(getters, 'dewpoint_C') + ' °C'
  let is_stale = isItemStale(getters, 'weather_state', 'dewpoint_C')
  return { name, val, is_stale }
}

const wind = (state, getters) => {
  let name = 'Wind'
  let val = get_val(getters, 'wind_m/s') + ' m/s'
  let is_stale = isItemStale(getters, 'weather_state', 'wind_m/s')
  return { name, val, is_stale }
}

// surface brightness
const surface = (state, getters) => {
  let name = 'Surface'
  let val = get_val(getters, 'calc_HSI_lux') + ' lux'
  let is_stale = isItemStale(getters, 'weather_state', 'calc_HSI_lux')
  return { name, val, is_stale }
}

const ambient = (state, getters) => {
  let name = 'Ambient'
  let val = get_val(getters, 'ambient_light')
  let is_stale = isItemStale(getters, 'weather_state', 'ambient_light')
  return { name, val, is_stale }
}

// measured sky magnitudes per square arc second
const meas_sky_mpsas = (state, getters) => {
  let name = 'Meas. mpsas'
  let val = get_val(getters, 'meas_sky_mpsas') 
  let is_stale = isItemStale(getters, 'weather_state', 'meas_sky_mpsas')
  return { name, val, is_stale }
}

// calculated sky magnitudes per square arc second
const calc_sky_mpsas = (state, getters) => {
  let name = 'Calc. mpsas'
  let val = get_val(getters, 'calc_sky_mpsas')
  let is_stale = isItemStale(getters, 'weather_state', 'calc_sky_mpsas')
  return { name, val, is_stale }
}

const wx_hold = (state, getters) => {
  let name = 'Wx Hold'
  let val
  let color = display_colors.red
  let is_stale = isItemStale(getters, 'weather_state', 'wx_hold')
  if (!Object.keys(getters.weather_state).includes('wx_hold')) {
    val = 'missing'
    color = 'grey'
  } else {
    let is_holding = getters.weather_state.wx_hold || true
    if (!is_holding) { color = display_colors.green }
    val = is_holding ? 'ACTIVE' : 'Off'
  }
  return { name, val, is_stale, color }
}

const hold_duration = (state, getters) => {
  let name = 'Hold Duration'
  let val
  let is_stale = isItemStale(getters, 'weather_state', 'hold_duration')
  let color
  if (!Object.keys(getters.weather_state).includes('hold_duration')) {
    val = "missing"
    color = "grey"
  } else {
    color = display_colors.green
    val = get_val(getters, 'hold_duration')
    if (val > 0) { color = display_colors.red }
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
  hold_duration,
}
